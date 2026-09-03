import {
  createPurchaseOrder,
  getOpenPoLines,
  getPurchaseOrderById,
  listPurchaseOrders,
  submitPurchaseOrder,
} from '../services/purchase-order-service.js';

const createPurchaseOrderSchema = {
  description: 'Create a new purchase order',
  tags: ['Purchase Orders'],
  body: {
    type: 'object',
    required: ['vendorName', 'lines'],
    properties: {
      vendorName: { type: 'string' },
      lines: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            prLineId: { type: 'string', format: 'uuid' },
            itemCode: { type: 'string' },
            itemName: { type: 'string' },
            qtyOrdered: { type: 'number' },
            unitPrice: { type: 'number' },
            uom: { type: 'string' },
            siteCode: { type: 'string' },
            requiredDate: { type: 'string', format: 'date', nullable: true },
          },
        },
      },
    },
  },
};

const listPurchaseOrdersSchema = {
  description: 'List all purchase orders',
  tags: ['Purchase Orders'],
};

const getPurchaseOrderSchema = {
  description: 'Get a purchase order by ID',
  tags: ['Purchase Orders'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
};

const submitPurchaseOrderSchema = {
  description: 'Submit a purchase order',
  tags: ['Purchase Orders'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
};

const openLinesSchema = {
  description: 'Get open lines for a purchase order',
  tags: ['Purchase Orders'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
};

export default async function purchaseOrderRoutes(fastify) {
  fastify.get('/api/purchase-orders', { schema: listPurchaseOrdersSchema }, async (request, reply) => {
    const items = await listPurchaseOrders(fastify.db);
    return { items };
  });

  fastify.post('/api/purchase-orders', { schema: createPurchaseOrderSchema }, async (request, reply) => {
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
  });

  fastify.post('/api/purchase-orders/:id/submit', { schema: submitPurchaseOrderSchema }, async (request, reply) => {
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
  });

  fastify.get('/api/purchase-orders/:id', { schema: getPurchaseOrderSchema }, async (request, reply) => {
    const purchaseOrder = await getPurchaseOrderById(fastify.db, request.params.id);
    if (!purchaseOrder) {
      reply.code(404);
      return { message: 'Purchase order not found' };
    }

    return purchaseOrder;
  });

  fastify.get('/api/purchase-orders/:id/open-lines', { schema: openLinesSchema }, async (request, reply) => {
    const payload = await getOpenPoLines(fastify.db, request.params.id);
    if (!payload) {
      reply.code(404);
      return { message: 'Purchase order not found' };
    }

    return payload;
  });
}
