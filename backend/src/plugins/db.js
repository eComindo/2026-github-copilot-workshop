import fp from 'fastify-plugin';
import pg from 'pg';
import { config } from '../config.js';

const { Pool } = pg;

async function dbPlugin(fastify) {
  const pool = new Pool({ connectionString: config.databaseUrl });

  fastify.decorate('db', {
    query: (text, params) => pool.query(text, params),
    pool,
  });

  fastify.addHook('onClose', async () => {
    await pool.end();
  });
}

export default fp(dbPlugin);
