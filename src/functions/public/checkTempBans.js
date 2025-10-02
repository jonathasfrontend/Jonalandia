const { client } = require('../../Client');
const { TempBan } = require('../../models/tempBan');
const { logger, securityEvent } = require('../../logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');

/**
 * Verifica e processa bans temporários que expiraram
 */
async function checkExpiredTempBans() {
    try {
        const now = new Date();
        const expiredBans = await TempBan.find({
            unbanDate: { $lte: now },
            isActive: true
        });

        for (const ban of expiredBans) {
            try {
                const guild = client.guilds.cache.get(ban.guildId);
                if (!guild) {
                    logger.warn(`Guild ${ban.guildId} não encontrada para unban de ${ban.username}`, {
                        module: 'TEMP_BAN_CHECKER'
                    });
                    continue;
                }

                // Verificar se o usuário ainda está banido
                const banList = await guild.bans.fetch();
                const isBanned = banList.has(ban.userId);

                if (isBanned) {
                    // Desbanir o usuário
                    await guild.members.unban(ban.userId, 'Ban temporário expirado');
                    
                    // Tentar enviar DM
                    try {
                        const user = await client.users.fetch(ban.userId);
                        await user.send(`<:feliz:1402690475634458664> Seu ban temporário de **${ban.duration}** no servidor **${guild.name}** expirou. Você pode voltar ao servidor agora.`);
                        logger.debug(`DM de unban enviada para ${ban.username}`, {
                            module: 'TEMP_BAN_CHECKER'
                        });
                    } catch (dmError) {
                        logger.warn(`Não foi possível enviar DM de unban para ${ban.username}`, {
                            module: 'TEMP_BAN_CHECKER'
                        }, dmError);
                    }

                    // Registrar a infração de unban automático
                    try {
                        const user = await client.users.fetch(ban.userId);
                        await saveUserInfractions(
                            ban.userId,
                            ban.username,
                            user.displayAvatarURL({ dynamic: true }),
                            user.createdAt,
                            null, // joinedAt não disponível para usuário banido
                            'unbans',
                            `Ban temporário expirado automaticamente (duração: ${ban.duration})`,
                            'Sistema Automático'
                        );
                    } catch (dbError) {
                        logger.error('Erro ao salvar infração de unban automático', {
                            module: 'TEMP_BAN_CHECKER'
                        }, dbError);
                    }

                    // Log de segurança
                    securityEvent('USER_TEMP_UNBAN', { id: ban.userId, tag: ban.username }, guild, 'Ban temporário expirado');
                    
                    logger.info(`Ban temporário expirado para ${ban.username} (${ban.duration})`, {
                        module: 'TEMP_BAN_CHECKER',
                        userId: ban.userId,
                        duration: ban.duration
                    });

                    // Log no canal
                    const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                    if (logChannel) {
                        try {
                            await logChannel.send(`🔓 Ban temporário expirado: **${ban.username}** foi desbanido automaticamente após **${ban.duration}**.`);
                        } catch (logError) {
                            logger.error('Erro ao enviar log de unban automático para canal', {
                                module: 'TEMP_BAN_CHECKER'
                            }, logError);
                        }
                    }
                }

                // Marcar o ban como inativo
                ban.isActive = false;
                await ban.save();

            } catch (error) {
                logger.error(`Erro ao processar unban automático para ${ban.username}`, {
                    module: 'TEMP_BAN_CHECKER',
                    userId: ban.userId
                }, error);
            }
        }

        if (expiredBans.length > 0) {
            logger.debug(`Processados ${expiredBans.length} bans temporários expirados`, {
                module: 'TEMP_BAN_CHECKER'
            });
        }

    } catch (error) {
        logger.error('Erro ao verificar bans temporários expirados', {
            module: 'TEMP_BAN_CHECKER'
        }, error);
    }
}

/**
 * Agenda a verificação periódica de bans temporários
 */
function scheduleTempBanCheck() {
    // Verificar a cada 10 segundos
    setInterval(checkExpiredTempBans, 10 * 1000);
    logger.info('Agendador de verificação de bans temporários iniciado (intervalo: 10s)', {
        module: 'TEMP_BAN_CHECKER'
    });
}

module.exports = { checkExpiredTempBans, scheduleTempBanCheck };
