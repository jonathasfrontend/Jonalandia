const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const blockedLinksData = require('../../config/blockedLinks.json');
const { getBlockedChannels } = require('../../utils/checkingComandsExecution');
const { client } = require('../../Client');
const { logger, securityEvent, databaseEvent } = require('../../logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');
const configData = require('../../config/punishmentConfig.json');

const config = configData.antiFlood || {};

function isUserImmune(member) {
    if (!member) return false;
    
    // Dono do servidor é imune
    if (member.id === member.guild.ownerId) return true;
    
    // Administradores são imunes
    if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
    
    // Moderadores são imunes (ajuste o ID do cargo conforme necessário)
    if (process.env.CARGO_MODERADOR && member.roles.cache.has(process.env.CARGO_MODERADOR)) return true;
    
    return false;
}

const blockedLinks = blockedLinksData.blockedLinks.map(pattern => new RegExp(pattern));

async function blockLinks(message) {
    if (message.author.bot) return;

    const context = {
        module: 'SECURITY',
        user: message.author.tag,
        guild: message.guild?.name
    };

    try {
        const channelsIdBLocke = await getBlockedChannels();

        if (channelsIdBLocke.includes(message.channel.id)) {
            logger.silly(`Verificando links para ${message.author.tag} no canal ${message.channel.name}`, context);

            // Verificar se o usuário é imune ao bloqueio de links
            if (isUserImmune(message.member)) {
                logger.info(`Usuário ${message.author.tag} é imune ao bloqueio de links`, context);
                return;
            }

            const blockedRegex = blockedLinks.find(regex => regex.test(message.content));

            if (blockedRegex) {
                logger.warn(`Link bloqueado detectado para ${message.author.tag}`, {
                    ...context,
                    channel: message.channel.name,
                    linkPattern: blockedRegex.source
                });

                securityEvent('BLOCKED_LINK_DETECTED', message.author, message.guild, `Padrão: ${blockedRegex.source}`);

                try {
                    await message.delete();
                    logger.debug('Mensagem com link bloqueado deletada', context);

                    const reason = `Mensagem bloqueada por conter links! Usuário: ${message.author.tag}, Tipo de link: ${blockedRegex.source}`;
                    const type = 'serverLinksPosted';


                    // Salvar infração de link bloqueado
                    try {
                        await saveUserInfractions(
                            message.author.id,
                            message.author.tag,
                            message.author.displayAvatarURL({ dynamic: true }),
                            message.author.createdAt,
                            message.member.joinedAt,
                            type,
                            reason,
                            client.user.tag
                        );
                        databaseEvent('INSERT', 'UserInfractions', true, `Infração por link bloqueado para ${message.author.tag}`);

                    } catch (dbError) {
                        logger.error('Erro ao salvar dados da infração por link', context, dbError);
                        databaseEvent('INSERT/UPDATE', 'Database', false, dbError.message);
                    }

                    // salvar infração de timeout
                    try {
                        const reason = `O usuário ${message.author.tag} recebeu um timeout de 5 minutos.`;
                        const type = 'timeouts';

                        await saveUserInfractions(
                            message.author.id,
                            message.author.tag,
                            message.author.displayAvatarURL({ dynamic: true }),
                            message.author.createdAt,
                            message.member.joinedAt,
                            type,
                            reason,
                            client.user.tag
                        );
                        databaseEvent('INSERT', 'UserInfractions', true, `Infração de timeout por arquivo bloqueado para ${message.author.tag}`);

                    } catch (dbError) {
                        logger.error('Erro ao salvar infração por arquivo bloqueado', context, dbError);
                        databaseEvent('INSERT', 'UserInfractions', false, dbError.message);
                    }

                    // Enviar embed de aviso
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setAuthor({
                            name: client.user.username,
                            iconURL: client.user.displayAvatarURL({ dynamic: true }),
                        })
                        .setTitle('Link bloqueado detectado! ❌')
                        .setDescription('Você não pode enviar certos links por aqui.')
                        .setTimestamp()
                        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: `Envio de links monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

                    const userEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setAuthor({
                            name: client.user.username,
                            iconURL: client.user.displayAvatarURL({ dynamic: true }),
                        })
                        .setTitle('Link bloqueado detectado! ❌')
                        .setDescription('Você levou timeout de 5 minutos por enviar certos links nos canais do servidor jonalandia.')
                        .setTimestamp()
                        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: `Envio de links monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

                    try {
                        await message.channel.send({ content: `||${message.author}||`, embeds: [embed], ephemeral: true });
                        await message.author.send({ embeds: [userEmbed] });
                        await message.member.timeout(config.timeoutDuration, 'Timeout de 5 minutos aplicado pelo bot.');

                        logger.debug('Embed de aviso de link bloqueado enviado', context);
                    } catch (embedError) {
                        logger.warn('Erro ao enviar embed de aviso', context, embedError);
                    }

                    logger.info(`Link bloqueado detectado e mensagem removida`, {
                        ...context,
                        linkType: blockedRegex.source
                    });

                    // Log no canal
                    const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                    if (discordChannel) {
                        try {
                            await discordChannel.send(`Mensagem bloqueada por conter links. Usuário: ${message.author.tag}, Tipo de link: ${blockedRegex.source}`);
                            logger.debug('Log de link bloqueado enviado para canal', context);
                        } catch (logError) {
                            logger.warn('Erro ao enviar log para canal', context, logError);
                        }
                    } else {
                        logger.warn('Canal de logs não encontrado', context);
                    }

                } catch (deleteError) {
                    logger.error('Erro ao deletar mensagem com link bloqueado', context, deleteError);
                    securityEvent('MESSAGE_DELETE_FAILED', message.author, message.guild, deleteError.message);
                }
            } else {
                logger.silly(`Nenhum link bloqueado encontrado na mensagem de ${message.author.tag}`, context);
            }
        } else {
            logger.silly(`Canal ${message.channel.name} não está sendo monitorado para links`, context);
        }

    } catch (error) {
        logger.error('Erro na verificação de links bloqueados', context, error);
        securityEvent('LINK_CHECK_ERROR', message.author, message.guild, error.message);
    }
}

module.exports = { blockLinks };