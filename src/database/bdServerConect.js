const mongoose = require('mongoose');
const { logger, databaseEvent, botEvent } = require('../logger');

function bdServerConect() {
    const context = { module: 'DATABASE' };
    
    logger.info('Iniciando conexão com MongoDB...', context);
    
    mongoose.connect(process.env.MONGO_SERVER)
        .then(() => {
            logger.info('Conectado ao MongoDB com sucesso', {
                ...context,
            });
            databaseEvent('CONNECT', 'MongoDB', true);
        })
        .catch(err => {
            logger.error('Erro ao conectar ao MongoDB', context, err);
            databaseEvent('CONNECT', 'MongoDB', false, err.message);
            botEvent('DATABASE_CONNECTION_FAILED', `Falha na conexão: ${err.message}`);
        });

    // Log de eventos de conexão do MongoDB
    mongoose.connection.on('connected', () => {
        logger.info('Mongoose conectado ao MongoDB', context);
        databaseEvent('MONGOOSE_CONNECTED', 'MongoDB', true);
    });

    mongoose.connection.on('error', (err) => {
        logger.error('Erro de conexão do Mongoose', context, err);
        databaseEvent('MONGOOSE_ERROR', 'MongoDB', false, err.message);
    });

    mongoose.connection.on('disconnected', () => {
        logger.warn('Mongoose desconectado do MongoDB', context);
        databaseEvent('MONGOOSE_DISCONNECTED', 'MongoDB', false);
        botEvent('DATABASE_DISCONNECTED', 'MongoDB desconectado');
    });
}

module.exports = { bdServerConect };
