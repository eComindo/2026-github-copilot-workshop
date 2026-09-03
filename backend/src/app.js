import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import dbPlugin from './plugins/db.js';
import requisitionRoutes from './routes/requisition-routes.js';
import purchaseOrderRoutes from './routes/purchase-order-routes.js';

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, {
    origin: true,
  });

  app.register(swagger, {
    swagger: {
      info: {
        title: 'Procurement MVP API',
        description: 'REST API for Purchase Requisition and Purchase Order management',
        version: '1.0.0',
      },
      host: 'localhost:3000',
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
      ],
    },
  });

  app.register(swaggerUI, {
    routePrefix: '/api-docs',
  });

  app.register(dbPlugin);
  app.register(requisitionRoutes);
  app.register(purchaseOrderRoutes);

  app.get('/health', async () => ({ status: 'ok' }));

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    if (reply.sent) {
      return;
    }

    reply.code(500).send({ message: 'Internal server error' });
  });

  return app;
}
