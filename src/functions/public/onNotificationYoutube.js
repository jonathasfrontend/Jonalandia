const { client } = require("../../Client");
const { logger, botEvent, databaseEvent } = require('../../logger');
const onNotificationYoutubeSchema = require('../../database/models/notificationYoutube');
const onYoutubeChannelSchema = require('../../database/models/youtubeChannel');
const NotificationChannelsModel = require('../../database/models/notificationChannels');
const GuildConfig = require('../../database/models/guildConfig');
const axios = require('axios');
const { EmbedBuilder } = require("discord.js");
const cron = require('node-cron');

/**
 * Verifica notificações YouTube para todas as guilds ativas
 * Itera por cada guild e processa canais cadastrados isoladamente
 */
async function onNotificationYoutube() {
    const context = { module: 'YOUTUBE_NOTIFICATIONS' };

    logger.debug('Iniciando verificação de notificações YouTube multi-guild', context);

    try {
        // Busca todas as guilds ativas
        const activeGuilds = await GuildConfig.find({ isActive: true });
        
        if (activeGuilds.length === 0) {
            logger.debug('Nenhuma guild ativa encontrada', context);
            return;
        }

        logger.info(`Processando notificações YouTube para ${activeGuilds.length} guild(s) ativa(s)`, context);

        // Processa cada guild isoladamente
        for (const guildConfig of activeGuilds) {
            await processGuildYoutubeNotifications(guildConfig);
        }

        logger.debug('Verificação de notificações YouTube multi-guild concluída', context);

    } catch (error) {
        logger.error('Erro na verificação de notificações YouTube', context, error);
        botEvent('YOUTUBE_NOTIFICATIONS_ERROR', `Erro geral: ${error.message}`);
    }
}

/**
 * Processa notificações YouTube para uma guild específica
 * @param {GuildConfig} guildConfig - Configuração da guild
 */
async function processGuildYoutubeNotifications(guildConfig) {
    const context = { 
        module: 'YOUTUBE_NOTIFICATIONS', 
        guildId: guildConfig.guildId,
        guildName: guildConfig.guildName
    };

    try {
        logger.debug(`Verificando notificações YouTube para guild ${guildConfig.guildName}`, context);

        // Busca canais cadastrados para esta guild
        const channelsData = await onYoutubeChannelSchema.find({ guildId: guildConfig.guildId });
        
        if (channelsData.length === 0) {
            logger.silly(`Nenhum canal YouTube cadastrado para ${guildConfig.guildName}`, context);
            return;
        }

        logger.info(`Verificando ${channelsData.length} canal(is) YouTube para guild ${guildConfig.guildName}`, context);

        // Busca canal de notificação configurado para esta guild
        const notificationChannelData = await NotificationChannelsModel.findOne({ 
            guildId: guildConfig.guildId,
            notificationType: 'youtube' 
        });

        if (!notificationChannelData) {
            logger.warn(`Canal de notificação YouTube não configurado para ${guildConfig.guildName}`, context);
            return;
        }

        const discordChannel = client.channels.cache.get(notificationChannelData.channelId);
        
        if (!discordChannel) {
            logger.error(`Canal de notificação YouTube não encontrado ou inacessível para ${guildConfig.guildName}`, {
                ...context,
                channelId: notificationChannelData.channelId
            });
            return;
        }

        // Verifica cada canal YouTube
        for (const channelData of channelsData) {
            await checkYoutubeChannel(channelData, guildConfig, discordChannel, context);
        }

    } catch (error) {
        logger.error(`Erro ao processar notificações YouTube para guild ${guildConfig.guildName}`, context, error);
    }
}

/**
 * Verifica últimos vídeos de um canal YouTube e envia notificação se necessário
 * @param {Object} channelData - Dados do canal YouTube
 * @param {GuildConfig} guildConfig - Configuração da guild
 * @param {TextChannel} discordChannel - Canal onde enviar notificação
 * @param {Object} baseContext - Contexto base para logs
 */
async function checkYoutubeChannel(channelData, guildConfig, discordChannel, baseContext) {
    const channel = channelData.name;
    const channelContext = {
        ...baseContext,
        channel
    };

    try {
        logger.silly(`Verificando último vídeo do canal: ${channel}`, channelContext);

        // Fazendo a requisição para a API DecAPI para pegar o último vídeo
        const latestVideoResponse = await axios.get(`https://decapi.me/youtube/latest_video?user=@${channel}`);

        if (latestVideoResponse.data === 'User not found') {
            logger.warn(`Canal ${channel} não foi encontrado na API`, channelContext);
            botEvent('YOUTUBE_CHANNEL_NOT_FOUND', `Canal ${channel} não encontrado`);
            return;
        }

        // Extraindo informações da resposta da API
        const responseData = latestVideoResponse.data.trim();

        // Separando título e URL do vídeo
        const lastHyphenIndex = responseData.lastIndexOf(' - ');
        if (lastHyphenIndex === -1) {
            logger.warn(`Formato de resposta inválido para o canal ${channel}`, channelContext);
            botEvent('YOUTUBE_INVALID_RESPONSE', `Formato inválido para canal ${channel}`);
            return;
        }

        const title = responseData.substring(0, lastHyphenIndex);
        const videoUrl = responseData.substring(lastHyphenIndex + 3);

        // Extraindo o ID do vídeo da URL
        const videoIdMatch = videoUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        if (!videoIdMatch) {
            logger.warn(`Não foi possível extrair o ID do vídeo para o canal ${channel}`, channelContext);
            botEvent('YOUTUBE_VIDEO_ID_ERROR', `Erro ao extrair ID do vídeo para ${channel}`);
            return;
        }

        const videoId = videoIdMatch[1];
        const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hq720.jpg`;

        logger.silly(`Vídeo encontrado: "${title}" do canal ${channel}`, {
            ...channelContext,
            title,
            videoId
        });

        // Verificando se a notificação já existe NESTA GUILD
        const existingNotification = await onNotificationYoutubeSchema.findOne({ 
            guildId: guildConfig.guildId,
            title: title,
            author: channel
        });

        if (existingNotification) {
            logger.silly(`Notificação YouTube para "${title}" já enviada para ${guildConfig.guildName}`, channelContext);
            return;
        }

        logger.info(`Novo vídeo detectado para ${channel} em ${guildConfig.guildName}`, {
            ...channelContext,
            title,
            videoUrl
        });

        botEvent('YOUTUBE_NEW_VIDEO_DETECTED', `${channel} em ${guildConfig.guildName}: ${title}`);

        // Criando o embed
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: `▶️ YouTube - ${channel}`,
            })
            .setTitle(title)
            .setURL(videoUrl)
            .setDescription(`**${channel}** postou um novo vídeo! 🎥\n\n[Clique aqui para assistir](${videoUrl})`)
            .setImage(thumbnailUrl)
            .setTimestamp()
            .setFooter({ 
                text: `${guildConfig.guildName} | Notificação YouTube`, 
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            });

        // Enviando a notificação
        await discordChannel.send({ embeds: [embed] });
        
        logger.info(`Notificação YouTube enviada para ${channel} em ${guildConfig.guildName}`, {
            ...channelContext,
            title
        });

        botEvent('YOUTUBE_NOTIFICATION_SENT', `${channel} em ${guildConfig.guildName}: ${title}`);

        // Salvando no banco de dados com guildId
        const newNotification = new onNotificationYoutubeSchema({
            guildId: guildConfig.guildId,
            title: title,
            author: channel,
            thumbnail: thumbnailUrl,
            description: `${channel} postou um novo vídeo!`,
            notifiedAt: new Date()
        });

        await newNotification.save();
        databaseEvent('INSERT', 'YoutubeNotifications', true, `Notificação salva para ${channel} em ${guildConfig.guildName}`);

    } catch (channelError) {
        logger.error(`Erro ao processar canal ${channel}`, channelContext, channelError);
        botEvent('YOUTUBE_CHANNEL_ERROR', `Erro ao processar ${channel} em ${guildConfig.guildName}: ${channelError.message}`);
    }
}

/**
 * Agenda verificação automática de notificações YouTube
 */
function scheduleNotificationYoutubeCheck() {
    const context = { module: 'YOUTUBE_NOTIFICATIONS' };

    try {
        // Executa a cada 5 minutos
        cron.schedule('*/5 * * * *', () => {
            logger.debug('Executando verificação automática de YouTube multi-guild', context);
            botEvent('YOUTUBE_CHECK_SCHEDULED', 'Verificação automática de YouTube executada');
            onNotificationYoutube();
        });

        logger.info('Agendador de notificações YouTube multi-guild configurado (a cada 5 minutos)', context);
        botEvent('YOUTUBE_SCHEDULER_CONFIGURED', 'Agendador configurado para executar a cada 5 minutos');

    } catch (error) {
        logger.error('Erro ao configurar agendador de notificações YouTube', context, error);
    }
}

module.exports = { 
    scheduleNotificationYoutubeCheck,
    onNotificationYoutube,
    processGuildYoutubeNotifications
};