const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { client } = require('../../Client');
const { logger, securityEvent, databaseEvent } = require('../../logger');
const inappropriateWordsData = require('../../config/InappropriateWords.json');
const { getBlockedChannels } = require('../../utils/checkingComandsExecution');
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

async function registerInfraction(user, member, type, reason) {
    try {
        const infractionId = await saveUserInfractions(
            user.id,
            user.tag,
            user.displayAvatarURL({ dynamic: true }),
            user.createdAt,
            member?.joinedAt || new Date(),
            type,
            reason,
            client.user.tag
        );

        databaseEvent('INSERT', 'UserInfractions', true, `${type} registrado para ${user.tag}`);
        return infractionId;
    } catch (error) {
        logger.error('Erro ao registrar infração no banco de dados', {
            module: 'ANTI_FLOOD',
            user: user.tag,
            type,
            error: error.message
        });

        databaseEvent('INSERT', 'UserInfractions', false, error.message);
        return null;
    }
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

                const reasonInappropriate = `O usuário ${message.author.username} usou palavras inadequadas: ${foundWord}`;
                const typeInappropriate = 'inappropriateLanguage';
                const reasonTimeout = `O usuário ${message.author.tag} recebeu um timeout de 5 minutos.`;
                const typeTimeout = 'timeouts';
                const reasonWarns = `O usuário ${message.author.tag} recebeu um aviso.`;
                const typeWarns = 'warns';

                const inappropriateId = await registerInfraction(message.author, message.member, typeInappropriate, reasonInappropriate);
                const timeoutId = await registerInfraction(message.author, message.member, typeTimeout, reasonTimeout);
                const warnsId = await registerInfraction(message.author, message.member, typeWarns, reasonWarns);

                databaseEvent('INSERT', 'UserInfractions', true, `Infração por linguagem inadequada para ${message.author.tag}`);


                // Embed para o canal
                const channelEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('<:triste:1402690489462947981> 🚫 Linguagem Inadequada Detectada')
                    .setDescription(`${message.author.tag}, você usou uma linguagem inadequada e foi silenciado por **5 minutos**.`)
                    .addFields(
                        { name: 'Motivo', value: 'Uso de palavras inadequadas', inline: true },
                        { name: 'Canal', value: `<#${message.channel.id}>`, inline: true },
                    )
                    .setFooter({ text: `Envio de palavras inapropriadas monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` })
                    .setTimestamp();

                const userEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('<:triste:1402690489462947981> ⚠️ Aviso de Silenciamento')
                    .setDescription(`Você foi silenciado no servidor **${message.guild.name}** por **5 minutos** devido ao uso de palavras inadequadas.`)
                    .addFields(
                        { name: 'Motivo', value: 'Uso de palavras inadequadas', inline: true },
                        { name: 'Servidor', value: message.guild.name, inline: true },
                        { name: '🆔 ID da Infração', value: `\`${inappropriateId}\``, inline: true }
                    )
                    .setFooter({ text: `Envio de palavras inapropriadas monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` })
                    .setTimestamp();

                try {
                    await message.channel.send({ embeds: [channelEmbed], ephemeral: true });
                    await message.author.send({ embeds: [userEmbed], ephemeral: true });
                    await message.member.timeout(configData.timeoutLevel.low.timeoutDuration, 'Timeout de 5 minutos aplicado pelo bot.');

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
