import { addBookmark, removeBookmark } from '../services/bookmark-service.js';

export default async function bookmarkRoutes(fastify) {
  fastify.post('/api/bookmarks', async (request, reply) => {
    try {
      const bookmark = await addBookmark(fastify.db, request.body);
      if (!bookmark) {
        reply.code(404);
        return { message: 'Entity not found' };
      }

      reply.code(201);
      return bookmark;
    } catch (error) {
      if (error.statusCode) {
        reply.code(error.statusCode);
        return { message: error.message };
      }

      throw error;
    }
  });

  fastify.delete('/api/bookmarks/:entityType/:entityId', async (request, reply) => {
    try {
      const bookmark = await removeBookmark(
        fastify.db,
        request.params.entityType,
        request.params.entityId
      );
      if (!bookmark) {
        reply.code(404);
        return { message: 'Entity not found' };
      }

      return bookmark;
    } catch (error) {
      if (error.statusCode) {
        reply.code(error.statusCode);
        return { message: error.message };
      }

      throw error;
    }
  });
}
