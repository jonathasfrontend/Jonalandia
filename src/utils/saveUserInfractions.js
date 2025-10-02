const { logger } = require('../logger');
const { client } = require('../Client');
const Infractions = require('../models/infracoesUsers');
const { v4: uuidv4 } = require('uuid');

async function saveUserInfractions(
    userId,
    username,
    avatarUrl,
    accountCreatedDate,
    joinedServerDate,
    type,
    reason,
    moderator
) {
    try {
        const infractionId = uuidv4();
        let userData = await Infractions.findOne({ username });

        if (!userData) {
            userData = new Infractions({
                userId,
                username,
                avatarUrl,
                accountCreatedDate,
                joinedServerDate,
                infractions: { [type]: 1 },
                logs: [{
                    id: infractionId,
                    type,
                    reason,
                    date: new Date(),
                    moderator,
                }]
            });
        } else {
            userData.infractions[type] = (userData.infractions[type] || 0) + 1;
            userData.logs.push({
                id: infractionId,
                type,
                reason,
                date: new Date(),
                moderator,
            });
        }

        await userData.save();

        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
        if (logChannel) {
            try {
                await logChannel.send(`Infração registrada no banco com sucesso no usuário ${username} ${reason}.`);
            } catch (sendError) {
                logger.error('Erro ao enviar mensagem para canal de logs', { username, reason }, sendError);
            }
        } else {
            logger.warn('Canal de logs não encontrado', { channelId: process.env.CHANNEL_ID_LOGS_INFO_BOT });
        }

        logger.info(`Infração registrada no banco com sucesso no usuário ${username} ${reason}.`);
        return infractionId;

    } catch (error) {
        logger.error('Erro ao aplicar ao cadastrar a infração no banco de dados:', { username, reason }, error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        if (logChannel) {
            try {
                await logChannel.send(`Erro ao aplicar ao cadastrar a infração no banco de dados: ${error.message}`);
            } catch (sendError) {
                logger.error('Erro ao enviar mensagem de erro para canal de logs', { username, reason }, sendError);
            }
        } else {
            logger.warn('Canal de logs de erro não encontrado', { channelId: process.env.CHANNEL_ID_LOGS_ERRO_BOT });
        }
        return null;
    }
}

module.exports = { saveUserInfractions };