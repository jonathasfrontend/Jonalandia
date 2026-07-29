const { logger, databaseEvent, botEvent } = require('../logger');
const { testConnection, runMigrations, closePool } = require('./supabase');

async function bdServerConect() {
  const context = { module: 'DATABASE' };

  logger.info('Iniciando conexão com Supabase...', context);

  if (!process.env.SUPABASE_URL) {
    const envError = 'Variável de ambiente SUPABASE_URL não foi definida';
    logger.error('Erro ao conectar ao Supabase', context, new Error(envError));
    databaseEvent('CONNECT', 'Supabase', false, envError);
    botEvent('DATABASE_CONNECTION_FAILED', envError);
    return;
  }

  try {
    const connected = await testConnection();
    if (!connected) {
      databaseEvent('CONNECT', 'Supabase', false, 'Falha no teste de conexão');
      botEvent('DATABASE_CONNECTION_FAILED', 'Falha no teste de conexão com Supabase');
      return;
    }

    await runMigrations();

    logger.info('Conectado ao Supabase com sucesso', context);
    databaseEvent('CONNECT', 'Supabase', true);
    botEvent('DATABASE_CONNECTION_SUCCESS', 'Conectado ao Supabase');
  } catch (err) {
    logger.error('Erro ao conectar ao Supabase', context, err);
    databaseEvent('CONNECT', 'Supabase', false, err.message);
    botEvent('DATABASE_CONNECTION_FAILED', err.message);
  }
}

async function bdServerDisconnect() {
  await closePool();
}

module.exports = { bdServerConect, bdServerDisconnect };
