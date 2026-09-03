import {
  createPurchaseOrder,
  getOpenPoLines,
  getPurchaseOrderById,
  listPurchaseOrders,
  submitPurchaseOrder,
} from '../services/purchase-order-service.js';

export default async function purchaseOrderRoutes(fastify) {
  fastify.get(
    '/api/purchase-orders',
    {
      schema: {
        tags: ['Purchase Orders'],
        description: 'List all purchase orders',
        response: {
          200: {
            description: 'List of purchase orders',
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    poNumber: { type: 'string' },
                    vendorName: { type: 'string' },
                    status: { type: 'string', enum: ['DRAFT', 'SUBMITTED'] },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const items = await listPurchaseOrders(fastify.db);
      return { items };
    }
  );

  fastify.post(
    '/api/purchase-orders',
    {
      schema: {
        tags: ['Purchase Orders'],
        description: 'Create a new purchase order from approved requisition lines',
        body: {
          type: 'object',
          required: ['vendorName', 'lines'],
          properties: {
            vendorName: { type: 'string', description: 'Vendor name' },
            lines: {
              type: 'array',
              description: 'PO line items derived from approved PR lines',
              items: {
                type: 'object',
                required: ['prLineId', 'qtyOrdered', 'unitPrice'],
                properties: {
                  prLineId: { type: 'string', format: 'uuid', description: 'Reference to PR line' },
                  qtyOrdered: { type: 'number', description: 'Qty to order (≤ PR open qty)' },
                  unitPrice: { type: 'number', description: 'Unit price for this line' },
                },
              },
            },
          },
        },
        response: {
          201: {
            description: 'Purchase order created successfully',
            type: 'object',
          },
          400: {
            description: 'Invalid input or over-allocation error',
          },
          404: {
            description: 'PR line not found',
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const purchaseOrder = await createPurchaseOrder(fastify.db, request.body);
        reply.code(201);
        return purchaseOrder;
      } catch (error) {
        if (error.statusCode) {
          reply.code(error.statusCode);
          return { message: error.message };
        }

        throw error;
      }
    }
  );

  fastify.post(
    '/api/purchase-orders/:id/submit',
    {
      schema: {
        tags: ['Purchase Orders'],
        description: 'Submit a purchase order (DRAFT → SUBMITTED)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: { description: 'Purchase order submitted' },
          404: { description: 'Purchase order not found' },
          400: { description: 'Invalid state transition' },
        },
      },
    },
    async (request, reply) => {
      try {
        const purchaseOrder = await submitPurchaseOrder(fastify.db, request.params.id);
        if (!purchaseOrder) {
          reply.code(404);
          return { message: 'Purchase order not found' };
        }

        return purchaseOrder;
      } catch (error) {
        if (error.statusCode) {
          reply.code(error.statusCode);
          return { message: error.message };
        }

        throw error;
      }
    }
  );

  fastify.get(
    '/api/purchase-orders/:id',
    {
      schema: {
        tags: ['Purchase Orders'],
        description: 'Get purchase order details by ID with line items and allocations',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: { description: 'Purchase order details' },
          404: { description: 'Purchase order not found' },
        },
      },
    },
    async (request, reply) => {
      const purchaseOrder = await getPurchaseOrderById(fastify.db, request.params.id);
      if (!purchaseOrder) {
        reply.code(404);
        return { message: 'Purchase order not found' };
      }

      return purchaseOrder;
    }
  );

  fastify.get(
    '/api/purchase-orders/:id/open-lines',
    {
      schema: {
        tags: ['Purchase Orders'],
        description: 'Get open line items from a purchase order (not yet fully received)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: { description: 'Open PO lines' },
          404: { description: 'Purchase order not found' },
        },
      },
    },
    async (request, reply) => {
      const payload = await getOpenPoLines(fastify.db, request.params.id);
      if (!payload) {
        reply.code(404);
        return { message: 'Purchase order not found' };
      }

      return payload;
    }
  );
}
