import Knex from 'knex';

export const knex = Knex({
  client: 'postgres',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASS ?? '', // ensure string for pg SCRAM auth
    database: process.env.DB_NAME || '',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    ssl: process.env.DB_SSL ? { rejectUnauthorized: process.env.DB_SSL !== 'false' } : undefined,
  },
});