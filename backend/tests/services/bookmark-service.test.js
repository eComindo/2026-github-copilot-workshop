import { jest, describe, test, expect } from '@jest/globals';
import { addBookmark, removeBookmark } from '../../src/services/bookmark-service.js';

function mockDb(queryFn) {
  return {
    query: jest.fn(queryFn),
  };
}

describe('bookmark-service', () => {
  test('adds a bookmark when entity exists', async () => {
    const db = mockDb((sql) => {
      if (sql.includes('FROM purchase_requisitions')) {
        return { rows: [{ id: 'pr-1' }], rowCount: 1 };
      }
      if (sql.includes('INSERT INTO bookmarks')) {
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });

    const result = await addBookmark(db, { entityType: 'PR', entityId: 'pr-1' });
    expect(result).toEqual({ entityType: 'PR', entityId: 'pr-1', isBookmarked: true });
  });

  test('rejects invalid entity type', async () => {
    const db = mockDb(() => ({ rows: [], rowCount: 0 }));
    await expect(addBookmark(db, { entityType: 'XX', entityId: 'id-1' }))
      .rejects.toMatchObject({ message: 'entityType must be one of PR, PO, or GR', statusCode: 422 });
  });

  test('returns null when adding bookmark for non-existent entity', async () => {
    const db = mockDb((sql) => {
      if (sql.includes('FROM purchase_orders')) {
        return { rows: [], rowCount: 0 };
      }
      return { rows: [], rowCount: 0 };
    });

    const result = await addBookmark(db, { entityType: 'PO', entityId: 'missing-po' });
    expect(result).toBeNull();
  });

  test('removes bookmark when entity exists', async () => {
    const db = mockDb((sql) => {
      if (sql.includes('FROM goods_receipts')) {
        return { rows: [{ id: 'gr-1' }], rowCount: 1 };
      }
      if (sql.includes('DELETE FROM bookmarks')) {
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });

    const result = await removeBookmark(db, 'GR', 'gr-1');
    expect(result).toEqual({ entityType: 'GR', entityId: 'gr-1', isBookmarked: false });
  });
});
