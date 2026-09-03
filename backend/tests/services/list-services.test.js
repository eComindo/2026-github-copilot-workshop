/**
 * Comprehensive tests for backend list services
 * Focus: Data returned to frontend, proper mapping, edge cases
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import {
  listPurchaseOrders,
  getOpenPoLines,
} from '../../src/services/purchase-order-service.js';
import {
  listRequisitions,
  getRequisitionOpenLines,
} from '../../src/services/requisition-service.js';

// ── Setup Helpers ────────────────────────────────────────────

/**
 * Create a mock DB with configurable query responses
 */
function mockDb(queryImpl) {
  return {
    query: jest.fn(queryImpl),
    pool: { connect: jest.fn(() => Promise.resolve({ release: jest.fn() })) },
  };
}

// ═════════════════════════════════════════════════════════════
// PURCHASE ORDER LIST SERVICE TESTS
// ═════════════════════════════════════════════════════════════

describe('Purchase Order List Service - listPurchaseOrders()', () => {
  test('returns empty array when no purchase orders exist', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 0 }));

    const result = await listPurchaseOrders(db);

    expect(result).toEqual([]);
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  test('maps DB column names to camelCase frontend property names', async () => {
    const db = mockDb(() => ({
      rows: [
        {
          id: 'po-uuid-1',
          po_number: 'PO-2026-0001',
          status: 'DRAFT',
          vendor_name: 'Acme Supplies',
          created_at: '2026-09-01T10:00:00Z',
          updated_at: '2026-09-01T10:00:00Z',
        },
      ],
      rowCount: 1,
    }));

    const result = await listPurchaseOrders(db);

    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('poNumber'); // NOT po_number
    expect(result[0]).toHaveProperty('vendorName'); // NOT vendor_name
    expect(result[0]).toHaveProperty('createdAt'); // NOT created_at
    expect(result[0]).not.toHaveProperty('po_number');
  });

  test('returns POs sorted by created_at DESC (newest first)', async () => {
    // Mock returns data already sorted DESC by created_at (SQL does the sorting)
    const db = mockDb(() => ({
      rows: [
        { id: 'po-3', po_number: 'PO-2026-0003', status: 'SUBMITTED', vendor_name: 'Vendor C', created_at: '2026-09-03T00:00:00Z', updated_at: '2026-09-03T00:00:00Z' },
        { id: 'po-2', po_number: 'PO-2026-0002', status: 'DRAFT', vendor_name: 'Vendor B', created_at: '2026-09-02T00:00:00Z', updated_at: '2026-09-02T00:00:00Z' },
        { id: 'po-1', po_number: 'PO-2026-0001', status: 'DRAFT', vendor_name: 'Vendor A', created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-01T00:00:00Z' },
      ],
      rowCount: 3,
    }));

    const result = await listPurchaseOrders(db);

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('po-3'); // Newest first
    expect(result[1].id).toBe('po-2');
    expect(result[2].id).toBe('po-1'); // Oldest last
  });

  test('includes all required frontend fields: id, poNumber, status, vendorName, timestamps', async () => {
    const db = mockDb(() => ({
      rows: [
        {
          id: 'po-uuid',
          po_number: 'PO-2026-0042',
          status: 'SUBMITTED',
          vendor_name: 'Global Supply Co',
          created_at: '2026-09-02T14:30:00Z',
          updated_at: '2026-09-02T14:35:00Z',
        },
      ],
    }));

    const result = await listPurchaseOrders(db);
    const po = result[0];

    expect(po).toEqual({
      id: 'po-uuid',
      poNumber: 'PO-2026-0042',
      status: 'SUBMITTED',
      vendorName: 'Global Supply Co',
      createdAt: '2026-09-02T14:30:00Z',
      updatedAt: '2026-09-02T14:35:00Z',
    });
  });

  test('handles multiple POs with different statuses', async () => {
    const db = mockDb(() => ({
      rows: [
        { id: '2', po_number: 'PO-2', status: 'SUBMITTED', vendor_name: 'V2', created_at: '2026-09-02T00:00:00Z', updated_at: '2026-09-02T00:00:00Z' },
        { id: '1', po_number: 'PO-1', status: 'DRAFT', vendor_name: 'V1', created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-01T00:00:00Z' },
      ],
    }));

    const result = await listPurchaseOrders(db);

    expect(result).toHaveLength(2);
    // Newest first (DESC by created_at)
    expect(result[0].status).toBe('SUBMITTED');
    expect(result[1].status).toBe('DRAFT');
  });

  test('throws error if DB query fails', async () => {
    const error = new Error('Database connection failed');
    const db = mockDb(() => {
      throw error;
    });

    await expect(listPurchaseOrders(db)).rejects.toThrow('Database connection failed');
  });
});

// ═════════════════════════════════════════════════════════════
// PURCHASE ORDER OPEN LINES SERVICE TESTS
// ═════════════════════════════════════════════════════════════

describe('Purchase Order List Service - getOpenPoLines()', () => {
  test('returns null when PO not found', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 0 }));

    const result = await getOpenPoLines(db, 'nonexistent-po-id');

    expect(result).toBeNull();
  });

  test('returns header and lines with calculated qtyOpenForGr', async () => {
    let callCount = 0;
    const db = mockDb(() => {
      callCount += 1;

      // First call: get PO header
      if (callCount === 1) {
        return {
          rows: [
            {
              id: 'po-id',
              po_number: 'PO-2026-0001',
              status: 'SUBMITTED',
            },
          ],
          rowCount: 1,
        };
      }

      // Second call: get PO lines
      return {
        rows: [
          {
            id: 'line-1',
            line_no: 1,
            item_code: 'ITEM-001',
            item_name: 'Widget A',
            qty_ordered: 100,
            qty_received: 25,
            uom: 'PCS',
            unit_price: 50.0,
            site_code: 'WH-01',
            required_date: '2026-09-15',
          },
        ],
        rowCount: 1,
      };
    });

    const result = await getOpenPoLines(db, 'po-id');

    expect(result).not.toBeNull();
    expect(result.openLines).toBeDefined();
    const line = result.openLines[0];
    expect(line.qtyOpenForGr).toBe(75); // 100 - 25 = 75 still open for receipt
  });

  test('filters lines to show only those not fully received', async () => {
    let callCount = 0;
    const db = mockDb(() => {
      callCount += 1;

      if (callCount === 1) {
        return {
          rows: [{ id: 'po-id', po_number: 'PO-1', status: 'SUBMITTED' }],
          rowCount: 1,
        };
      }

      return {
        rows: [
          {
            id: 'line-1',
            line_no: 1,
            item_code: 'A',
            item_name: 'Item A',
            qty_ordered: 50,
            qty_received: 50, // Fully received
            uom: 'PCS',
            unit_price: 10.0,
            site_code: 'WH',
            required_date: null,
          },
          {
            id: 'line-2',
            line_no: 2,
            item_code: 'B',
            item_name: 'Item B',
            qty_ordered: 100,
            qty_received: 0, // Nothing received yet
            uom: 'PCS',
            unit_price: 20.0,
            site_code: 'WH',
            required_date: null,
          },
        ],
      };
    });

    const result = await getOpenPoLines(db, 'po-id');

    // Service filters for qtyOpenForGr > 0, so only line-2 should be returned
    expect(result.openLines).toHaveLength(1);
    expect(result.openLines[0].qtyOpenForGr).toBe(100);
    expect(result.openLines[0].itemCode).toBe('B');
  });
});

// ═════════════════════════════════════════════════════════════
// REQUISITION LIST SERVICE TESTS
// ═════════════════════════════════════════════════════════════

describe('Requisition List Service - listRequisitions()', () => {
  test('returns empty array when no requisitions exist', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 0 }));

    const result = await listRequisitions(db);

    expect(result).toEqual([]);
  });

  test('maps DB columns to camelCase property names', async () => {
    const db = mockDb(() => ({
      rows: [
        {
          id: 'pr-uuid',
          pr_number: 'PR-2026-0001',
          status: 'APPROVED',
          requester_name: 'John Doe',
          department_name: 'Operations',
          title: 'Office Supplies',
          notes: 'Urgent',
          needed_by_date: '2026-09-15',
          created_at: '2026-09-01T10:00:00Z',
          updated_at: '2026-09-02T10:00:00Z',
        },
      ],
    }));

    const result = await listRequisitions(db);

    expect(result[0]).toHaveProperty('prNumber'); // NOT pr_number
    expect(result[0]).toHaveProperty('requesterName'); // NOT requester_name
    expect(result[0]).toHaveProperty('departmentName'); // NOT department_name
    expect(result[0]).toHaveProperty('neededByDate'); // NOT needed_by_date
    expect(result[0]).toHaveProperty('createdAt'); // NOT created_at
    expect(result[0]).not.toHaveProperty('pr_number');
  });

  test('sorts requisitions by created_at DESC (newest first)', async () => {
    // Mock returns data already sorted DESC by created_at (SQL does the sorting)
    const db = mockDb(() => ({
      rows: [
        { id: 'pr-3', pr_number: 'PR-2026-0003', status: 'APPROVED', requester_name: 'C', department_name: 'Ops', title: 'T3', needed_by_date: '2026-09-03', created_at: '2026-09-03T00:00:00Z', updated_at: '2026-09-03T00:00:00Z' },
        { id: 'pr-2', pr_number: 'PR-2026-0002', status: 'SUBMITTED', requester_name: 'B', department_name: 'Ops', title: 'T2', needed_by_date: '2026-09-02', created_at: '2026-09-02T00:00:00Z', updated_at: '2026-09-02T00:00:00Z' },
        { id: 'pr-1', pr_number: 'PR-2026-0001', status: 'DRAFT', requester_name: 'A', department_name: 'Ops', title: 'T1', needed_by_date: '2026-09-01', created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-01T00:00:00Z' },
      ],
    }));

    const result = await listRequisitions(db);

    expect(result[0].id).toBe('pr-3');
    expect(result[1].id).toBe('pr-2');
    expect(result[2].id).toBe('pr-1');
  });

  test('includes all required frontend fields', async () => {
    const db = mockDb(() => ({
      rows: [
        {
          id: 'pr-id',
          pr_number: 'PR-2026-0099',
          status: 'APPROVED',
          requester_name: 'Jane Smith',
          department_name: 'Procurement',
          title: 'Lab Equipment',
          needed_by_date: '2026-10-01',
          created_at: '2026-08-15T09:00:00Z',
          updated_at: '2026-08-20T14:00:00Z',
        },
      ],
    }));

    const result = await listRequisitions(db);
    const pr = result[0];

    // listRequisitions does NOT include notes in the query
    expect(pr).toEqual({
      id: 'pr-id',
      prNumber: 'PR-2026-0099',
      status: 'APPROVED',
      requesterName: 'Jane Smith',
      departmentName: 'Procurement',
      title: 'Lab Equipment',
      notes: undefined,
      neededByDate: '2026-10-01',
      createdAt: '2026-08-15T09:00:00Z',
      updatedAt: '2026-08-20T14:00:00Z',
    });
  });

  test('preserves null values in optional fields like notes', async () => {
    const db = mockDb(() => ({
      rows: [
        {
          id: 'pr-id',
          pr_number: 'PR-2026-0001',
          status: 'DRAFT',
          requester_name: 'User',
          department_name: 'Dept',
          title: 'Title',
          notes: null,
          needed_by_date: '2026-09-01',
          created_at: '2026-09-01T00:00:00Z',
          updated_at: '2026-09-01T00:00:00Z',
        },
      ],
    }));

    const result = await listRequisitions(db);

    expect(result[0].notes).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════
// REQUISITION OPEN LINES SERVICE TESTS
// ═════════════════════════════════════════════════════════════

describe('Requisition List Service - getRequisitionOpenLines()', () => {
  test('returns null when requisition not found', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 0 }));

    const result = await getRequisitionOpenLines(db, 'missing-id');

    expect(result).toBeNull();
  });

  test('returns PR header with calculated qtyOpenForPo per line', async () => {
    let callCount = 0;
    const db = mockDb(() => {
      callCount += 1;

      // First call: PR header
      if (callCount === 1) {
        return {
          rows: [
            {
              id: 'pr-id',
              pr_number: 'PR-2026-0001',
              status: 'APPROVED',
            },
          ],
        };
      }

      // Second call: PR lines
      return {
        rows: [
          {
            id: 'line-1',
            line_no: 1,
            item_code: 'IT-001',
            item_name: 'Laptop',
            qty_requested: 10,
            qty_allocated: 3,
            qty_received: 0,
            uom: 'EACH',
            est_unit_price: 1500.0,
            site_code: 'SITE-A',
            required_date: '2026-09-15',
            budget_center: 'BC-100',
          },
        ],
      };
    });

    const result = await getRequisitionOpenLines(db, 'pr-id');

    expect(result).not.toBeNull();
    expect(result.openLines).toBeDefined();
    expect(result.openLines[0].qtyOpenForPo).toBe(7); // 10 - 3 = 7 available for PO
  });

  test('includes only lines where qtyOpenForPo > 0 in filtered response', async () => {
    let callCount = 0;
    const db = mockDb(() => {
      callCount += 1;

      if (callCount === 1) {
        return {
          rows: [{ id: 'pr-id', pr_number: 'PR-1', status: 'APPROVED' }],
        };
      }

      return {
        rows: [
          {
            id: 'l-1',
            line_no: 1,
            item_code: 'A',
            item_name: 'Item A',
            qty_requested: 10,
            qty_allocated: 7,
            qty_received: 0,
            uom: 'PCS',
            est_unit_price: 100.0,
            site_code: 'WH',
            required_date: null,
            budget_center: null,
          },
          {
            id: 'l-2',
            line_no: 2,
            item_code: 'B',
            item_name: 'Item B',
            qty_requested: 5,
            qty_allocated: 5,
            qty_received: 0,
            uom: 'PCS',
            est_unit_price: 200.0,
            site_code: 'WH',
            required_date: null,
            budget_center: null,
          },
        ],
      };
    });

    const result = await getRequisitionOpenLines(db, 'pr-id');

    // Service filters for qtyOpenForPo > 0, so only line-1 should be returned
    expect(result.openLines).toHaveLength(1);
    expect(result.openLines[0].qtyOpenForPo).toBe(3); // 10 - 7 = 3
    expect(result.openLines[0].itemCode).toBe('A');
  });

  test('converts numeric strings to numbers for quantities and prices', async () => {
    let callCount = 0;
    const db = mockDb(() => {
      callCount += 1;

      if (callCount === 1) {
        return {
          rows: [{ id: 'pr-id', pr_number: 'PR-1', status: 'APPROVED' }],
        };
      }

      return {
        rows: [
          {
            id: 'l-1',
            line_no: 1,
            item_code: 'A',
            item_name: 'Item A',
            qty_requested: '100', // String from DB
            qty_allocated: '25',  // String from DB
            qty_received: '0',    // String from DB
            uom: 'PCS',
            est_unit_price: '99.99', // String from DB
            site_code: 'WH',
            required_date: null,
            budget_center: null,
          },
        ],
      };
    });

    const result = await getRequisitionOpenLines(db, 'pr-id');
    const line = result.openLines[0];

    // All should be numbers, not strings
    expect(typeof line.qtyRequested).toBe('number');
    expect(typeof line.qtyAllocated).toBe('number');
    expect(typeof line.qtyReceived).toBe('number');
    expect(typeof line.estUnitPrice).toBe('number');
    expect(line.qtyRequested).toBe(100);
    expect(line.estUnitPrice).toBe(99.99);
  });
});
