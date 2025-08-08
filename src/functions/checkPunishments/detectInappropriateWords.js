const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { client } = require('../../Client');
const { logger, securityEvent, databaseEvent } = require('../../logger');
const inappropriateWordsData = require('../../config/InappropriateWords.json');
const { getBlockedChannels } = require('../../utils/checkingComandsExecution');
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


const inappropriateWords = inappropriateWordsData.inappropriateWords;

async function detectInappropriateWords(message) {
    if (message.author.bot) return;

    const context = {
        module: 'SECURITY',
        user: message.author.tag,
        guild: message.guild?.name
    };

    try {
        const channelsIdBLocke = await getBlockedChannels();

        if (!channelsIdBLocke.includes(message.channel.id)) {
            logger.silly(`Canal ${message.channel.name} não está sendo monitorado para palavras inapropriadas`, context);
            return;
        }

        // Verificar se o usuário é imune à detecção de palavras inapropriadas
        if (isUserImmune(message.member)) {
            logger.info(`Usuário ${message.author.tag} é imune à detecção de palavras inapropriadas`, context);
            return;
        }

        // Verifica cada palavra usando regex para evitar subcadeias
        const foundWord = inappropriateWords.find(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i'); // 'i' para case-insensitive
            return regex.test(message.content);
        });

        if (foundWord) {
            logger.warn(`Palavra inadequada detectada: "${foundWord}"`, {
                ...context,
                channel: message.channel.name
            });

            securityEvent('INAPPROPRIATE_WORD_DETECTED', message.author, message.guild, `Palavra: "${foundWord}"`);

            try {
                await message.delete();
                logger.debug('Mensagem com palavra inadequada deletada', context);

                // Salvar infração de palavras inadequadas
                try {
                    const reason = `O usuário ${message.author.username} usou palavras inadequadas: ${foundWord}`;
                    const type = 'inappropriateLanguage';

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
                    databaseEvent('INSERT', 'UserInfractions', true, `Infração por linguagem inadequada para ${message.author.tag}`);

                } catch (dbError) {
                    logger.error('Erro ao salvar dados da infração', context, dbError);
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

                // Embed para o canal
                const channelEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('🚫 Linguagem Inadequada Detectada')
                    .setDescription(`${message.author.tag}, você usou uma linguagem inadequada e foi silenciado por **5 minutos**.`)
                    .addFields(
                        { name: 'Motivo', value: 'Uso de palavras inadequadas', inline: true },
                        { name: 'Canal', value: `<#${message.channel.id}>`, inline: true },
                    )
                    .setFooter({ text: `Envio de palavras inapropriadas monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` })
                    .setTimestamp();

                const userEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('⚠️ Aviso de Silenciamento')
                    .setDescription(`Você foi silenciado no servidor **${message.guild.name}** por **5 minutos** devido ao uso de palavras inadequadas.`)
                    .addFields(
                        { name: 'Motivo', value: 'Uso de palavras inadequadas', inline: true },
                        { name: 'Servidor', value: message.guild.name, inline: true },
                    )
                    .setFooter({ text: `Envio de palavras inapropriadas monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` })
                    .setTimestamp();

                try {
                    await message.channel.send({ embeds: [channelEmbed], ephemeral: true });
                    await message.author.send({ embeds: [userEmbed], ephemeral: true });
                    await message.member.timeout(5 * 60 * 1000, 'Timeout de 5 minutos aplicado pelo bot.');

                    logger.debug('Embed de aviso de linguagem inadequada enviado', context);
                } catch (dmError) {
                    logger.warn('Erro ao enviar DM para o usuário', context, dmError);
                }

                // Log no canal
                const discordChannelDelete = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                if (discordChannelDelete) {
                    try {
                        await discordChannelDelete.send(`Mensagem de ${message.author.tag} deletada devido a palavras inadequadas: "${foundWord}".`);
                        logger.debug('Log enviado para canal de informações', context);
                    } catch (logError) {
                        logger.warn('Erro ao enviar log para canal', context, logError);
                    }
                } else {
                    logger.warn('Canal de logs não encontrado', context);
                }


            } catch (deleteError) {
                logger.error('Erro ao deletar mensagem com palavra inadequada', context, deleteError);
                securityEvent('MESSAGE_DELETE_FAILED', message.author, message.guild, deleteError.message);
            }
        }

    } catch (error) {
        logger.error('Erro na detecção de palavras inadequadas', context, error);

        const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        if (discordChannel) {
            try {
                await discordChannel.send(`Erro ao tentar deletar mensagem de ${message.author.tag} por palavras inadequadas! ${error.message}`);
            } catch (logError) {
                logger.error('Erro ao enviar log de erro', context, logError);
            }
        }
    }
}

module.exports = { detectInappropriateWords };
