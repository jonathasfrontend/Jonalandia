const { logger } = require('../logger');
const { client } = require('../Client');
const { db } = require('../database/service');
const { v4: uuidv4 } = require('uuid');

async function saveUserInfractions(
    guildId,
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
        let userData = await db.infractions.findOne({ guildId, userId });

        if (!userData) {
            const infractions = {};
            infractions[type] = 1;

            await db.infractions.create({
                guildId,
                userId,
                username,
                avatarUrl,
                accountCreatedDate,
                joinedServerDate,
                infractions: JSON.stringify(infractions),
                logs: JSON.stringify([{
                    id: infractionId,
                    type,
                    reason,
                    date: new Date().toISOString(),
                    moderator,
                }]),
            });
        } else {
            const infractions = typeof userData.infractions === 'object'
                ? { ...userData.infractions }
                : {};
            infractions[type] = (infractions[type] || 0) + 1;

            const logs = Array.isArray(userData.logs) ? [...userData.logs] : [];
            logs.push({
                id: infractionId,
                type,
                reason,
                date: new Date().toISOString(),
                moderator,
            });

            await db.infractions.update(userData.id, {
                infractions: JSON.stringify(infractions),
                logs: JSON.stringify(logs),
            });
        }

        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
        if (logChannel) {
            try {
                await logChannel.send(`Infração registrada no banco com sucesso no usuário ${username} ${reason}.`);
            } catch (sendError) {
                logger.error('Erro ao enviar mensagem para canal de logs', { username, reason }, sendError);
            }
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
        }
        return null;
    }
}

module.exports = { saveUserInfractions };
