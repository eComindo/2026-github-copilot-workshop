import {
  approveRequisition,
  createRequisition,
  getRequisitionById,
  getRequisitionOpenLines,
  listRequisitions,
  submitRequisition,
} from '../services/requisition-service.js';

export default async function requisitionRoutes(fastify) {
  fastify.get(
    '/api/requisitions',
    {
      schema: {
        tags: ['Requisitions'],
        description: 'List all purchase requisitions',
        response: {
          200: {
            description: 'List of requisitions',
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    pr_number: { type: 'string' },
                    requester_name: { type: 'string' },
                    department_name: { type: 'string' },
                    title: { type: 'string' },
                    status: { type: 'string', enum: ['DRAFT', 'SUBMITTED', 'APPROVED'] },
                    needed_by_date: { type: 'string', format: 'date' },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const items = await listRequisitions(fastify.db);
      return { items };
    }
  );

  fastify.post(
    '/api/requisitions',
    {
      schema: {
        tags: ['Requisitions'],
        description: 'Create a new purchase requisition',
        body: {
          type: 'object',
          required: ['requesterName', 'departmentName', 'title', 'neededByDate', 'lines'],
          properties: {
            requesterName: { type: 'string' },
            departmentName: { type: 'string' },
            title: { type: 'string' },
            notes: { type: 'string' },
            neededByDate: { type: 'string', format: 'date' },
            lines: {
              type: 'array',
              items: {
                type: 'object',
                required: ['itemCode', 'itemName', 'qtyRequested', 'uom', 'estUnitPrice'],
                properties: {
                  itemCode: { type: 'string' },
                  itemName: { type: 'string' },
                  qtyRequested: { type: 'number' },
                  uom: { type: 'string' },
                  estUnitPrice: { type: 'number' },
                  siteCode: { type: 'string' },
                  requiredDate: { type: 'string', format: 'date' },
                  budgetCenter: { type: 'string' },
                },
              },
            },
          },
        },
        response: {
          201: {
            description: 'Requisition created',
            type: 'object',
          },
          400: {
            description: 'Invalid input',
          },
        },
      },
    },
    async (request, reply) => {
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
    }
  );

  fastify.post(
    '/api/requisitions/:id/submit',
    {
      schema: {
        tags: ['Requisitions'],
        description: 'Submit a requisition (DRAFT → SUBMITTED)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: { description: 'Requisition submitted' },
          404: { description: 'Requisition not found' },
        },
      },
    },
    async (request, reply) => {
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
    }
  );

  fastify.post(
    '/api/requisitions/:id/approve',
    {
      schema: {
        tags: ['Requisitions'],
        description: 'Approve a requisition (SUBMITTED → APPROVED)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: { description: 'Requisition approved' },
          404: { description: 'Requisition not found' },
        },
      },
    },
    async (request, reply) => {
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
    }
  );

  fastify.get(
    '/api/requisitions/:id',
    {
      schema: {
        tags: ['Requisitions'],
        description: 'Get requisition details by ID',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: { description: 'Requisition details' },
          404: { description: 'Requisition not found' },
        },
      },
    },
    async (request, reply) => {
      const requisition = await getRequisitionById(fastify.db, request.params.id);
      if (!requisition) {
        reply.code(404);
        return { message: 'Requisition not found' };
      }

      return requisition;
    }
  );

  fastify.get(
    '/api/requisitions/:id/open-lines',
    {
      schema: {
        tags: ['Requisitions'],
        description: 'Get open line items from a requisition (not yet fully allocated)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: { description: 'Open lines' },
          404: { description: 'Requisition not found' },
        },
      },
    },
    async (request, reply) => {
      const payload = await getRequisitionOpenLines(fastify.db, request.params.id);
      if (!payload) {
        reply.code(404);
        return { message: 'Requisition not found' };
      }

      return payload;
    }
  );
}
