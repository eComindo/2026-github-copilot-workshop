import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as apiModule from '../../src/api';

describe('API Functions', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('listRequisitions', () => {
    it('should fetch requisitions from API', async () => {
      const mockData = {
        items: [
          { id: 1, prNumber: 'PR-001', title: 'Test PR', status: 'APPROVED' },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData,
      });

      const result = await apiModule.api.listRequisitions();
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/requisitions', expect.any(Object));
    });

    it('should throw error on failed request', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Server error' }),
      });

      await expect(apiModule.api.listRequisitions()).rejects.toThrow('Server error');
    });
  });

  describe('createRequisition', () => {
    it('should post requisition data', async () => {
      const payload = { prNumber: 'PR-002', title: 'New PR' };
      const mockResponse = { id: 2, ...payload, status: 'DRAFT' };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const result = await apiModule.api.createRequisition(payload);
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/requisitions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
        })
      );
    });
  });

  describe('listPurchaseOrders', () => {
    it('should fetch purchase orders', async () => {
      const mockData = {
        items: [
          { id: 1, poNumber: 'PO-001', status: 'DRAFT' },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData,
      });

      const result = await apiModule.api.listPurchaseOrders();
      expect(result).toEqual(mockData);
    });
  });

  describe('createPurchaseOrder', () => {
    it('should post purchase order', async () => {
      const payload = {
        prId: 1,
        supplierName: 'Test Supplier',
        allocations: [],
      };
      const mockResponse = { id: 1, ...payload, status: 'DRAFT' };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const result = await apiModule.api.createPurchaseOrder(payload);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPurchaseOrder', () => {
    it('should fetch a specific purchase order', async () => {
      const mockData = { id: 1, poNumber: 'PO-001', status: 'DRAFT' };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData,
      });

      const result = await apiModule.api.getPurchaseOrder(1);
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/purchase-orders/1', expect.any(Object));
    });
  });

  describe('submitPurchaseOrder', () => {
    it('should submit a purchase order', async () => {
      const mockResponse = { id: 1, status: 'SUBMITTED' };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });

      const result = await apiModule.api.submitPurchaseOrder(1);
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/purchase-orders/1/submit',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
