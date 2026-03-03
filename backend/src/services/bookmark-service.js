import { v4 as uuidv4 } from 'uuid';

const ENTITY_TABLES = {
  PR: 'purchase_requisitions',
  PO: 'purchase_orders',
  GR: 'goods_receipts',
};

function normalizeEntityType(entityType) {
  return String(entityType || '').toUpperCase();
}

export function validateEntityType(entityType) {
  const normalized = normalizeEntityType(entityType);
  if (!ENTITY_TABLES[normalized]) {
    const err = new Error('entityType must be one of PR, PO, or GR');
    err.statusCode = 422;
    throw err;
  }
  return normalized;
}

export async function getBookmarkStatus(db, entityType, entityId) {
  const normalized = validateEntityType(entityType);
  const { rowCount } = await db.query(
    `SELECT 1 FROM bookmarks WHERE entity_type = $1 AND entity_id = $2`,
    [normalized, entityId]
  );
  return rowCount > 0;
}

async function ensureEntityExists(db, entityType, entityId) {
  if (entityType === 'PR') {
    const result = await db.query(`SELECT id FROM purchase_requisitions WHERE id = $1`, [entityId]);
    return result.rowCount > 0;
  }
  if (entityType === 'PO') {
    const result = await db.query(`SELECT id FROM purchase_orders WHERE id = $1`, [entityId]);
    return result.rowCount > 0;
  }
  const result = await db.query(`SELECT id FROM goods_receipts WHERE id = $1`, [entityId]);
  return result.rowCount > 0;
}

export async function addBookmark(db, payload) {
  if (!payload || typeof payload !== 'object') {
    const err = new Error('Body is required');
    err.statusCode = 422;
    throw err;
  }

  const entityType = validateEntityType(payload.entityType);
  const entityId = payload.entityId;
  if (!entityId) {
    const err = new Error('entityId is required');
    err.statusCode = 422;
    throw err;
  }

  const exists = await ensureEntityExists(db, entityType, entityId);
  if (!exists) {
    return null;
  }

  await db.query(
    `INSERT INTO bookmarks (id, entity_type, entity_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (entity_type, entity_id) DO NOTHING`,
    [uuidv4(), entityType, entityId]
  );

  return { entityType, entityId, isBookmarked: true };
}

export async function removeBookmark(db, entityType, entityId) {
  const normalized = validateEntityType(entityType);
  const exists = await ensureEntityExists(db, normalized, entityId);
  if (!exists) {
    return null;
  }

  await db.query(
    `DELETE FROM bookmarks WHERE entity_type = $1 AND entity_id = $2`,
    [normalized, entityId]
  );

  return { entityType: normalized, entityId, isBookmarked: false };
}
