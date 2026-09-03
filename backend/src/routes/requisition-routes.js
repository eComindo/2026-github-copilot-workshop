import {
  approveRequisition,
  createRequisition,
  getRequisitionById,
  getRequisitionOpenLines,
  listRequisitions,
  submitRequisition,
} from '../services/requisition-service.js';

const listRequisitionsSchema = {
  description: 'List all purchase requisitions',
  tags: ['Requisitions'],
};

const createRequisitionSchema = {
  description: 'Create a new purchase requisition',
  tags: ['Requisitions'],
  body: {
    type: 'object',
    required: ['requester_name', 'department_name', 'title', 'needed_by_date', 'lines'],
    properties: {
      requester_name: { type: 'string' },
      department_name: { type: 'string' },
      title: { type: 'string' },
      notes: { type: 'string', nullable: true },
      needed_by_date: { type: 'string', format: 'date' },
      lines: {
        type: 'array',
        items: {
          type: 'object',
          required: ['item_code', 'item_name', 'qty_requested', 'uom', 'est_unit_price', 'required_date'],
          properties: {
            item_code: { type: 'string' },
            item_name: { type: 'string' },
            qty_requested: { type: 'number', minimum: 0.01 },
            uom: { type: 'string' },
            est_unit_price: { type: 'number', minimum: 0 },
            site_code: { type: 'string' },
            required_date: { type: 'string', format: 'date' },
            budget_center: { type: 'string' },
          },
        },
      },
    },
  },
};

const getRequisitionSchema = {
  description: 'Get a purchase requisition by ID',
  tags: ['Requisitions'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
};

const submitRequisitionSchema = {
  description: 'Submit a purchase requisition for approval',
  tags: ['Requisitions'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
};

const approveRequisitionSchema = {
  description: 'Approve a purchase requisition',
  tags: ['Requisitions'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
};

const openLinesSchema = {
  description: 'Get open lines for a purchase requisition',
  tags: ['Requisitions'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
};

export default async function requisitionRoutes(fastify) {
  fastify.get('/api/requisitions', { schema: listRequisitionsSchema }, async (request, reply) => {
    const items = await listRequisitions(fastify.db);
    return { items };
  });

  fastify.post('/api/requisitions', { schema: createRequisitionSchema }, async (request, reply) => {
    try {
      const requisition = await createRequisition(fastify.db, request.body);
      reply.code(201);
      return requisition;
    } catch (error) {
      if (error.statusCode) {
        reply.code(error.statusCode);
        return { message: error.message };
      }

      throw error;
    }
  });

  fastify.post('/api/requisitions/:id/submit', { schema: submitRequisitionSchema }, async (request, reply) => {
    try {
      const requisition = await submitRequisition(fastify.db, request.params.id);
      if (!requisition) {
        reply.code(404);
        return { message: 'Requisition not found' };
      }

      return requisition;
    } catch (error) {
      if (error.statusCode) {
        reply.code(error.statusCode);
        return { message: error.message };
      }

      throw error;
    }
  });

  fastify.post('/api/requisitions/:id/approve', { schema: approveRequisitionSchema }, async (request, reply) => {
    try {
      const requisition = await approveRequisition(fastify.db, request.params.id);
      if (!requisition) {
        reply.code(404);
        return { message: 'Requisition not found' };
      }

      return requisition;
    } catch (error) {
      if (error.statusCode) {
        reply.code(error.statusCode);
        return { message: error.message };
      }

      throw error;
    }
  });

  fastify.get('/api/requisitions/:id', { schema: getRequisitionSchema }, async (request, reply) => {
    const requisition = await getRequisitionById(fastify.db, request.params.id);
    if (!requisition) {
      reply.code(404);
      return { message: 'Requisition not found' };
    }

    return requisition;
  });

  fastify.get('/api/requisitions/:id/open-lines', { schema: openLinesSchema }, async (request, reply) => {
    const payload = await getRequisitionOpenLines(fastify.db, request.params.id);
    if (!payload) {
      reply.code(404);
      return { message: 'Requisition not found' };
    }

    return payload;
  });
}
