const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { client } = require('../../Client');
const blockedFileExtensions = require('../../config/blockedFileExtensions.json').blockedFileExtensions;
const { getBlockedChannels } = require('../../utils/checkingComandsExecution')
const { logger, securityEvent, databaseEvent } = require('../../logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');

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

async function blockFileTypes(message) {
    if (!message.inGuild()) return;
    if (message.author.bot) return;

    const context = {
        module: 'SECURITY',
        user: message.author.tag,
        guild: message.guild?.name
    };

    try {
        const channelsIdBLocke = await getBlockedChannels();

        if (channelsIdBLocke.includes(message.channel.id)) {
            logger.silly(`Verificando tipos de arquivo para ${message.author.tag} no canal ${message.channel.name}`, context);

            // Verificar se o usuário é imune ao bloqueio de tipos de arquivo
            if (isUserImmune(message.member)) {
                logger.info(`Usuário ${message.author.tag} é imune ao bloqueio de tipos de arquivo`, context);
                return;
            }

            if (message.attachments.size > 0) {
                const blockedAttachments = message.attachments.filter(attachment =>
                    blockedFileExtensions.some(ext => attachment.name.endsWith(ext))
                );

                if (blockedAttachments.size > 0) {
                    const blockedFiles = blockedAttachments.map(att => att.name).join(', ');

                    logger.warn(`Arquivo bloqueado detectado para ${message.author.tag}`, {
                        ...context,
                        channel: message.channel.name,
                        blockedFiles
                    });

                    securityEvent('BLOCKED_FILE_DETECTED', message.author, message.guild, `Arquivos: ${blockedFiles}`);

                    try {
                        await message.delete();
                        logger.debug('Mensagem com arquivo bloqueado deletada', context);

                        // Salvar infração de arquivo bloqueado
                        try {
                            const reason = `Tentativa de envio de arquivo com extensão bloqueada: ${blockedFiles}`;
                            const type = 'blockedFiles';

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
                            databaseEvent('INSERT', 'UserInfractions', true, `Infração por arquivo bloqueado para ${message.author.tag}`);

                        } catch (dbError) {
                            logger.error('Erro ao salvar infração por arquivo bloqueado', context, dbError);
                            databaseEvent('INSERT', 'UserInfractions', false, dbError.message);
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
                            .setTitle('Arquivo Bloqueado')
                            .setDescription(`${message.author}, o envio de arquivos com certas extensões é proibido neste servidor.`)
                            .setTimestamp()
                            .setFooter({ text: `Envio de arquivos monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

                        const userEmbed = new EmbedBuilder()
                            .setColor('#FF0000')
                            .setAuthor({
                                name: client.user.username,
                                iconURL: client.user.displayAvatarURL({ dynamic: true }),
                            })
                            .setTitle('Arquivo Bloqueado')
                            .setDescription(`${message.author} voce levou timeout de 5 minutos por envio de arquivos com certas extensões é proibido neste servidor.`)
                            .setTimestamp()
                            .setFooter({ text: `Envio de arquivos monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

                        try {
                            await message.author.send({ embeds: [userEmbed] });
                            await message.channel.send({ embeds: [embed], content: `||${message.author}||` });
                            await message.member.timeout(5 * 60 * 1000, 'Timeout de 5 minutos aplicado pelo bot.');

                            logger.debug('Embed de aviso de arquivo bloqueado enviado', context);
                        } catch (embedError) {
                            logger.warn('Erro ao enviar embed de aviso', context, embedError.message);
                        }

                        logger.info(`Arquivo bloqueado detectado e mensagem removida`, {
                            ...context,
                            blockedFiles
                        });

                        // Log no canal
                        const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                        if (discordChannel) {
                            try {
                                await discordChannel.send(`${message.author} tentou enviar um arquivo com extensão bloqueada em um canal restrito!`);
                                logger.debug('Log de arquivo bloqueado enviado para canal', context);
                            } catch (logError) {
                                logger.warn('Erro ao enviar log para canal', context, logError);
                            }
                        } else {
                            logger.warn('Canal de logs não encontrado', context);
                        }

                    } catch (deleteError) {
                        logger.error('Erro ao deletar mensagem com arquivo bloqueado', context, deleteError);
                        securityEvent('MESSAGE_DELETE_FAILED', message.author, message.guild, deleteError.message);

                        // Log de erro no canal
                        const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
                        if (discordChannel) {
                            try {
                                await discordChannel.send(`Erro ao tentar bloquear o envio de arquivos com extensões bloqueadas!`);
                            } catch (logError) {
                                logger.error('Erro ao enviar log de erro', context, logError);
                            }
                        }
                    }
                } else {
                    logger.silly(`Arquivos enviados por ${message.author.tag} são permitidos`, context);
                }
            } else {
                logger.silly(`Mensagem de ${message.author.tag} não contém anexos`, context);
            }
        } else {
            logger.silly(`Canal ${message.channel.name} não está sendo monitorado para tipos de arquivo`, context);
        }

    } catch (error) {
        logger.error('Erro na verificação de tipos de arquivo', context, error);
        securityEvent('FILE_CHECK_ERROR', message.author, message.guild, error.message);
    }
}

module.exports = { blockFileTypes };