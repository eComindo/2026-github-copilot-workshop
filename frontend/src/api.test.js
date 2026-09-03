import { afterEach, describe, expect, test, vi } from 'vitest';
import { api, apiFetch } from './api';

describe('api', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('apiFetch surfaces backend 422 messages and status code', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      status: 422,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ message: 'allocation qty exceeds remaining qty' }),
    })));

    await expect(apiFetch('/api/purchase-orders')).rejects.toMatchObject({
      message: 'allocation qty exceeds remaining qty',
      statusCode: 422,
    });
  });

  test('listPurchaseOrders requests the purchase order endpoint', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ items: [] }),
    }));

    vi.stubGlobal('fetch', fetchMock);

    await api.listPurchaseOrders();

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/purchase-orders', {
      headers: {},
    });
  });
});