const { Pool } = require('pg');
const { logger } = require('../logger');

let pool = null;

function getPool() {
  if (pool) return pool;
  const connectionString = process.env.SUPABASE_URL;
  if (!connectionString) {
    throw new Error('SUPABASE_URL não definida no .env');
  }
  pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  pool.on('error', (err) => {
    logger.error('Erro inesperado no pool do banco', { module: 'DATABASE' }, err);
  });
  return pool;
}

async function query(text, params) {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

async function runMigrations() {
  const { readFileSync } = require('fs');
  const path = require('path');
  const files = ['migration.sql', 'migration_002.sql'];
  for (const file of files) {
    const sql = readFileSync(path.join(__dirname, file), 'utf8');
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    for (const stmt of statements) {
      try {
        await query(stmt);
      } catch (err) {
        logger.error('Erro na migração SQL', { module: 'DATABASE', file, statement: stmt.slice(0, 80) }, err);
        throw err;
      }
    }
  }
  logger.info('Migrações SQL executadas com sucesso', { module: 'DATABASE' });
}

async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    logger.info(`Conexão com Supabase estabelecida: ${result.rows[0].now}`, { module: 'DATABASE' });
    return true;
  } catch (err) {
    logger.error('Falha na conexão com Supabase', { module: 'DATABASE' }, err);
    return false;
  }
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { getPool, query, runMigrations, testConnection, closePool };
