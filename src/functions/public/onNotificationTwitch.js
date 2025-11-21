const { client } = require("../../Client");
const { logger, botEvent, databaseEvent } = require('../../logger');
const onNotificationTwitchSchema = require("../../database/models/notificationTwitch");
const onTwitchStreamersSchema = require("../../database/models/streamers");
const NotificationChannelsModel = require("../../database/models/notificationChannels");
const GuildConfig = require("../../database/models/guildConfig");
const axios = require('axios');
const { EmbedBuilder } = require("discord.js");
const cron = require('node-cron');

/**
 * Verifica notificações Twitch para todas as guilds ativas
 * Itera por cada guild e processa streamers cadastrados isoladamente
 */
async function onNotificationTwitch() {
    const context = { module: 'TWITCH_NOTIFICATIONS' };

    logger.debug('Iniciando verificação de notificações Twitch multi-guild', context);

    try {
        // Busca todas as guilds ativas
        const activeGuilds = await GuildConfig.find({ isActive: true });
        
        if (activeGuilds.length === 0) {
            logger.debug('Nenhuma guild ativa encontrada', context);
            return;
        }

        logger.info(`Processando notificações Twitch para ${activeGuilds.length} guild(s) ativa(s)`, context);

        // Processa cada guild isoladamente
        for (const guildConfig of activeGuilds) {
            await processGuildTwitchNotifications(guildConfig);
        }

        logger.debug('Verificação de notificações Twitch multi-guild concluída', context);

    } catch (error) {
        logger.error('Erro na verificação de notificações Twitch', context, error);
        botEvent('TWITCH_NOTIFICATIONS_ERROR', `Erro geral: ${error.message}`);
    }
}

/**
 * Processa notificações Twitch para uma guild específica
 * @param {GuildConfig} guildConfig - Configuração da guild
 */
async function processGuildTwitchNotifications(guildConfig) {
    const context = { 
        module: 'TWITCH_NOTIFICATIONS', 
        guildId: guildConfig.guildId,
        guildName: guildConfig.guildName
    };

    try {
        logger.debug(`Verificando notificações Twitch para guild ${guildConfig.guildName}`, context);

        // Busca streamers cadastrados para esta guild
        const streamersData = await onTwitchStreamersSchema.find({ guildId: guildConfig.guildId });
        
        if (streamersData.length === 0) {
            logger.silly(`Nenhum streamer cadastrado para ${guildConfig.guildName}`, context);
            return;
        }

        logger.info(`Verificando ${streamersData.length} streamer(s) para guild ${guildConfig.guildName}`, context);

        // Busca canal de notificação configurado para esta guild
        const notificationChannelData = await NotificationChannelsModel.findOne({ 
            guildId: guildConfig.guildId,
            notificationType: 'twitch' 
        });

        if (!notificationChannelData) {
            logger.warn(`Canal de notificação Twitch não configurado para ${guildConfig.guildName}`, context);
            return;
        }

        const discordChannel = client.channels.cache.get(notificationChannelData.channelId);
        
        if (!discordChannel) {
            logger.error(`Canal de notificação Twitch não encontrado ou inacessível para ${guildConfig.guildName}`, {
                ...context,
                channelId: notificationChannelData.channelId
            });
            return;
        }

        // Verifica cada streamer
        for (const streamerData of streamersData) {
            await checkStreamerStatus(streamerData, guildConfig, discordChannel, context);
        }

    } catch (error) {
        logger.error(`Erro ao processar notificações Twitch para guild ${guildConfig.guildName}`, context, error);
    }
}

/**
 * Verifica status de um streamer e envia notificação se necessário
 * @param {Object} streamerData - Dados do streamer
 * @param {GuildConfig} guildConfig - Configuração da guild
 * @param {TextChannel} discordChannel - Canal onde enviar notificação
 * @param {Object} baseContext - Contexto base para logs
 */
async function checkStreamerStatus(streamerData, guildConfig, discordChannel, baseContext) {
    const streamer = streamerData.name;
    const streamerContext = {
        ...baseContext,
        streamer
    };

    try {
        logger.silly(`Verificando status do streamer: ${streamer}`, streamerContext);

        // Requisições à API do Twitch via DecAPI
        const [uptimeResponse, avatarResponse, titleResponse, gameResponse] = await Promise.all([
            axios.get(`https://decapi.me/twitch/uptime/${streamer}`),
            axios.get(`https://decapi.me/twitch/avatar/${streamer}`),
            axios.get(`https://decapi.me/twitch/title/${streamer}`),
            axios.get(`https://decapi.me/twitch/game/${streamer}`)
        ]);

        // Validações básicas
        if (uptimeResponse.data === `${streamer} is offline`) {
            logger.silly(`${streamer} está offline`, streamerContext);
            return;
        }

        if (streamer === 'undefined' || !streamer) {
            logger.error('Streamer com nome inválido encontrado', streamerContext);
            return;
        }

        // Verifica rate limit
        if (uptimeResponse.status === 429) {
            logger.warn(`Limite de requisições excedido para o streamer ${streamer}`, streamerContext);
            botEvent('TWITCH_RATE_LIMIT', `Limite de requisições excedido para ${streamer}`);
            return;
        }

        // Streamer está online
        logger.info(`${streamer} está online - verificando se já foi notificado para guild ${guildConfig.guildName}`, {
            ...streamerContext,
            title: titleResponse.data,
            game: gameResponse.data
        });

        // Verifica se já existe notificação para este título NESTA GUILD
        const existingNotification = await onNotificationTwitchSchema.findOne({ 
            guildId: guildConfig.guildId,
            title: titleResponse.data,
            streamer: streamer
        });

        if (existingNotification) {
            logger.silly(`Notificação Twitch para "${titleResponse.data}" já enviada para ${guildConfig.guildName}`, streamerContext);
            return;
        }

        // Cria embed de notificação
        const embed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: `🟣 Twitch - ${streamer}`,
                iconURL: avatarResponse.data,
            })
            .setTitle(titleResponse.data)
            .setURL(`https://twitch.tv/${streamer}`)
            .setThumbnail(avatarResponse.data)
            .setDescription(`**${streamer}** está online agora! 🎮\n\n[Clique aqui para assistir](https://twitch.tv/${streamer})`)
            .addFields(
                { name: '🎮 Jogando', value: gameResponse.data || 'Não definido', inline: true },
                { name: '⏱️ Tempo Online', value: uptimeResponse.data, inline: true }
            )
            .setTimestamp()
            .setFooter({ 
                text: `${guildConfig.guildName} | Notificação Twitch`, 
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            });

        // Envia notificação
        await discordChannel.send({ embeds: [embed] });
        
        logger.info(`Notificação Twitch enviada para ${streamer} em ${guildConfig.guildName}`, {
            ...streamerContext,
            title: titleResponse.data,
            game: gameResponse.data
        });

        botEvent('TWITCH_NOTIFICATION_SENT', `${streamer} online em ${guildConfig.guildName}: ${titleResponse.data}`);

        // Salva registro da notificação com guildId
        const newNotification = new onNotificationTwitchSchema({
            guildId: guildConfig.guildId,
            title: titleResponse.data,
            streamer: streamer,
            image: avatarResponse.data,
            gamer: gameResponse.data,
            notifiedAt: new Date()
        });

        await newNotification.save();
        databaseEvent('INSERT', 'TwitchNotifications', true, `Notificação salva para ${streamer} em ${guildConfig.guildName}`);

    } catch (streamerError) {
        // Tratamento específico de erro 404 (streamer não existe)
        if (streamerError.response?.status === 404) {
            logger.warn(`Streamer ${streamer} não encontrado (404) - pode ter sido deletado`, streamerContext);
            return;
        }

        logger.error(`Erro ao verificar streamer ${streamer}`, streamerContext, streamerError);
        botEvent('TWITCH_CHECK_ERROR', `Erro ao verificar ${streamer} em ${guildConfig.guildName}: ${streamerError.message}`);
    }
}

/**
 * Agenda verificação automática de notificações Twitch
 */
function scheduleNotificationTwitchCheck() {
    const context = { module: 'TWITCH_NOTIFICATIONS' };

    try {
        // Executa a cada 3 minutos
        cron.schedule('*/3 * * * *', () => {
            logger.debug('Executando verificação automática de Twitch multi-guild', context);
            botEvent('TWITCH_CHECK_SCHEDULED', 'Verificação automática de Twitch executada');
            onNotificationTwitch();
        });

        logger.info('Agendador de notificações Twitch multi-guild configurado (a cada 3 minutos)', context);
        botEvent('TWITCH_SCHEDULER_CONFIGURED', 'Agendador configurado para executar a cada 3 minutos');

    } catch (error) {
        logger.error('Erro ao configurar agendador de notificações Twitch', context, error);
    }
}

module.exports = { 
    scheduleNotificationTwitchCheck,
    onNotificationTwitch,
    processGuildTwitchNotifications 
};