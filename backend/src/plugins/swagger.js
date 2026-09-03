import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyPlugin from 'fastify-plugin';

// Schema definitions
const RequisitionLine = {
  $id: '#/definitions/RequisitionLine',
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    pr_id: { type: 'string', format: 'uuid' },
    line_no: { type: 'integer' },
    item_code: { type: 'string' },
    item_name: { type: 'string' },
    qty_requested: { type: 'number' },
    qty_allocated: { type: 'number' },
    qty_received: { type: 'number' },
    uom: { type: 'string' },
    est_unit_price: { type: 'number' },
    site_code: { type: 'string' },
    required_date: { type: 'string', format: 'date' },
    budget_center: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

const Requisition = {
  $id: '#/definitions/Requisition',
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    pr_number: { type: 'string' },
    requester_name: { type: 'string' },
    department_name: { type: 'string' },
    title: { type: 'string' },
    notes: { type: ['string', 'null'] },
    needed_by_date: { type: 'string', format: 'date' },
    status: { type: 'string', enum: ['DRAFT', 'SUBMITTED', 'APPROVED'] },
    lines: {
      type: 'array',
      items: { $ref: '#/definitions/RequisitionLine' },
    },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

const POLine = {
  $id: '#/definitions/POLine',
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    po_id: { type: 'string', format: 'uuid' },
    line_no: { type: 'integer' },
    item_code: { type: 'string' },
    item_name: { type: 'string' },
    qty_ordered: { type: 'number' },
    qty_received: { type: 'number' },
    uom: { type: 'string' },
    unit_price: { type: 'number' },
    site_code: { type: 'string' },
    required_date: { type: 'string', format: 'date' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

const PurchaseOrder = {
  $id: '#/definitions/PurchaseOrder',
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    po_number: { type: 'string' },
    vendor_name: { type: 'string' },
    status: { type: 'string', enum: ['DRAFT', 'SUBMITTED'] },
    lines: {
      type: 'array',
      items: { $ref: '#/definitions/POLine' },
    },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

const ErrorResponse = {
  $id: '#/definitions/ErrorResponse',
  type: 'object',
  properties: {
    message: { type: 'string' },
    code: { type: ['string', 'null'] },
  },
};

const swaggerPlugin = fastifyPlugin(async (fastify) => {
  // Register schemas with Fastify so they can be referenced
  fastify.addSchema(RequisitionLine);
  fastify.addSchema(Requisition);
  fastify.addSchema(POLine);
  fastify.addSchema(PurchaseOrder);
  fastify.addSchema(ErrorResponse);

  await fastify.register(fastifySwagger, {
    swagger: {
      info: {
        title: 'Procurement MVP API',
        description: 'API for Purchase Requisition, Purchase Order, and Goods Receipt management',
        version: '1.0.0',
      },
      host: `localhost:${process.env.PORT || 3000}`,
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        {
          name: 'Requisitions',
          description: 'Purchase Requisition endpoints',
        },
        {
          name: 'Purchase Orders',
          description: 'Purchase Order endpoints',
        },
        {
          name: 'Health',
          description: 'Health check',
        },
      ],
      definitions: {
        RequisitionLine,
        Requisition,
        POLine,
        PurchaseOrder,
        ErrorResponse,
      },
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/api-docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });
});

export default swaggerPlugin;
