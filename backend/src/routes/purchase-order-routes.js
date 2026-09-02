import {
  createPurchaseOrder,
  getOpenPoLines,
  getPurchaseOrderById,
  listPurchaseOrders,
  submitPurchaseOrder,
} from '../services/purchase-order-service.js';

const purchaseOrderSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    pr_id: { type: 'string' },
    status: { type: 'string' },
    vendor: { type: 'string' },
    vendor_email: { type: 'string' },
    total_amount: { type: 'number' },
    created_at: { type: 'string' },
    lines: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          po_id: { type: 'string' },
          pr_line_id: { type: 'string' },
          qty_ordered: { type: 'number' },
          unit_price: { type: 'number' },
        },
      },
    },
  },
};

const errorSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
};

export default async function purchaseOrderRoutes(fastify) {
  fastify.get('/api/purchase-orders', async (request, reply) => {
    const items = await listPurchaseOrders(fastify.db);
    return { items };
  }, {
    schema: {
      tags: ['Purchase Orders'],
      summary: 'List all purchase orders',
      description: 'Retrieve a list of all purchase orders',
      response: {
        200: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: purchaseOrderSchema,
            },
          },
        },
      },
    },
  });

  fastify.post('/api/purchase-orders', async (request, reply) => {
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
  }, {
    schema: {
      tags: ['Purchase Orders'],
      summary: 'Create a new purchase order',
      description: 'Create a new PO with allocated quantities from approved requisition lines',
      body: {
        type: 'object',
        required: ['pr_id', 'vendor', 'vendor_email', 'lines'],
        properties: {
          pr_id: { type: 'string' },
          vendor: { type: 'string' },
          vendor_email: { type: 'string' },
          lines: {
            type: 'array',
            items: {
              type: 'object',
              required: ['pr_line_id', 'qty_ordered', 'unit_price'],
              properties: {
                pr_line_id: { type: 'string' },
                qty_ordered: { type: 'number' },
                unit_price: { type: 'number' },
              },
            },
          },
        },
      },
      response: {
        201: purchaseOrderSchema,
        400: errorSchema,
      },
    },
  });

  fastify.post('/api/purchase-orders/:id/submit', async (request, reply) => {
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
  }, {
    schema: {
      tags: ['Purchase Orders'],
      summary: 'Submit a purchase order',
      description: 'Submit a draft PO (transition from DRAFT to SUBMITTED)',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: purchaseOrderSchema,
        404: errorSchema,
      },
    },
  });

  fastify.get('/api/purchase-orders/:id', async (request, reply) => {
    const purchaseOrder = await getPurchaseOrderById(fastify.db, request.params.id);
    if (!purchaseOrder) {
      reply.code(404);
      return { message: 'Purchase order not found' };
    }

    return purchaseOrder;
  }, {
    schema: {
      tags: ['Purchase Orders'],
      summary: 'Get purchase order by ID',
      description: 'Retrieve a specific purchase order with all its details and line items',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: purchaseOrderSchema,
        404: errorSchema,
      },
    },
  });

  fastify.get('/api/purchase-orders/:id/open-lines', async (request, reply) => {
    const payload = await getOpenPoLines(fastify.db, request.params.id);
    if (!payload) {
      reply.code(404);
      return { message: 'Purchase order not found' };
    }

    return payload;
  }, {
    schema: {
      tags: ['Purchase Orders'],
      summary: 'Get open lines for a purchase order',
      description: 'Retrieve line items from a PO that have unallocated quantities (for GR creation)',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            lines: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
          },
        },
        404: errorSchema,
      },
    },
  });
}
