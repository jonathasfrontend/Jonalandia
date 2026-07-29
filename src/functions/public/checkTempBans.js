const { client } = require('../../Client');
const { db } = require('../../database/service');
const { logger, securityEvent } = require('../../logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');

async function checkExpiredTempBans() {
    try {
        const expiredBans = await db.tempBans.findExpired();

        for (const ban of expiredBans) {
            try {
                const guild = client.guilds.cache.get(ban.guildId);
                if (!guild) {
                    logger.warn(`Guild ${ban.guildId} não encontrada para unban de ${ban.username}`);
                    continue;
                }

                const banList = await guild.bans.fetch();
                if (banList.has(ban.userId)) {
                    await guild.members.unban(ban.userId, 'Ban temporário expirado');

                    try {
                        const user = await client.users.fetch(ban.userId);
                        await user.send(`Seu ban temporário de **${ban.duration}** no servidor **${guild.name}** expirou.`);
                    } catch (dmError) {
                        logger.warn(`DM de unban não enviada para ${ban.username}`);
                    }

                    await saveUserInfractions(
                        ban.guildId, ban.userId, ban.username, null, null, null,
                        'unbans', `Ban temporário expirado (${ban.duration})`, 'Sistema'
                    );

                    securityEvent('USER_TEMP_UNBAN', { id: ban.userId, tag: ban.username }, guild, 'Ban expirado');
                    logger.info(`Ban expirado para ${ban.username} (${ban.duration})`);

                    const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                    if (logChannel) logChannel.send(`🔓 Ban expirado: **${ban.username}** desbanido (${ban.duration}).`);
                }

                await db.tempBans.update(ban.id, { isActive: false });
            } catch (error) {
                logger.error(`Erro ao processar unban para ${ban.username}`, { userId: ban.userId }, error);
            }
        }
    } catch (error) {
        logger.error('Erro ao verificar bans expirados', error);
    }
}

function scheduleTempBanCheck() {
    setInterval(checkExpiredTempBans, 60 * 1000);
    logger.info('Verificador de temp bans iniciado (60s)');
}

module.exports = { checkExpiredTempBans, scheduleTempBanCheck };
