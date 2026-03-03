import { getBookmarkStatus } from './bookmark-service.js';

function mapHeader(row) {
  return {
    id: row.id,
    grNumber: row.gr_number,
    poId: row.po_id,
    status: row.status,
    receiptDate: row.receipt_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapLine(row) {
  return {
    id: row.id,
    poLineId: row.po_line_id,
    lineNo: row.line_no,
    qtyReceived: Number(row.qty_received),
    actualSiteCode: row.actual_site_code,
    createdAt: row.created_at,
  };
}

export async function listGoodsReceipts(db) {
  const { rows } = await db.query(
    `SELECT id, gr_number, status, receipt_date, created_at
     FROM goods_receipts
     ORDER BY created_at DESC`
  );

  return rows.map((row) => ({
    id: row.id,
    grNumber: row.gr_number,
    status: row.status,
    receiptDate: row.receipt_date,
    createdAt: row.created_at,
  }));
}

export async function getGoodsReceiptById(db, id) {
  const headerResult = await db.query(`SELECT * FROM goods_receipts WHERE id = $1`, [id]);
  if (headerResult.rowCount === 0) {
    return null;
  }

  const linesResult = await db.query(
    `SELECT * FROM gr_lines WHERE gr_id = $1 ORDER BY line_no ASC`,
    [id]
  );

  const isBookmarked = await getBookmarkStatus(db, 'GR', id);
  return {
    ...mapHeader(headerResult.rows[0]),
    isBookmarked,
    lines: linesResult.rows.map(mapLine),
  };
}
