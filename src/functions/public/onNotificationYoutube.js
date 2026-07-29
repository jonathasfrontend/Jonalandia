const { client } = require("../../Client");
const { logger, botEvent } = require('../../logger');
const { db } = require('../../database/service');
const axios = require('axios');
const { EmbedBuilder } = require("discord.js");
const cron = require('node-cron');

async function onNotificationYoutube() {
    try {
        const activeGuilds = await db.guilds.getAllActive();
        for (const guildConfig of activeGuilds) {
            await processGuildYoutubeNotifications(guildConfig);
        }
    } catch (error) {
        logger.error('Erro nas notificações YouTube', { module: 'YOUTUBE' }, error);
    }
}

async function processGuildYoutubeNotifications(guildConfig) {
    const context = { module: 'YOUTUBE', guildId: guildConfig.guildId, guildName: guildConfig.guildName };

    try {
        const channelsData = await db.youtubeChannels.find({ guildId: guildConfig.guildId });
        if (channelsData.length === 0) return;

        const notificationChannelData = await db.notificationChannels.findOne({ guildId: guildConfig.guildId, notificationType: 'youtube' });
        if (!notificationChannelData) return;

        const discordChannel = client.channels.cache.get(notificationChannelData.channelId);
        if (!discordChannel) return;

        for (const channelData of channelsData) {
            await checkYoutubeChannel(channelData.name, guildConfig, discordChannel, context);
        }
    } catch (error) {
        logger.error(`Erro na guild ${guildConfig.guildName}`, context, error);
    }
}

async function checkYoutubeChannel(channel, guildConfig, discordChannel, baseContext) {
    const channelContext = { ...baseContext, channel };

    try {
        const response = await axios.get(`https://decapi.me/youtube/latest_video?user=@${channel}`);
        if (response.data === 'User not found') return;

        const data = response.data.trim();
        const lastHyphen = data.lastIndexOf(' - ');
        if (lastHyphen === -1) return;

        const title = data.substring(0, lastHyphen);
        const videoUrl = data.substring(lastHyphen + 3);
        const videoIdMatch = videoUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        if (!videoIdMatch) return;

        const videoId = videoIdMatch[1];
        const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hq720.jpg`;

        const existing = await db.youtubeNotifications.findOne({ guildId: guildConfig.guildId, title, author: channel });
        if (existing) return;

        const embed = new EmbedBuilder()
            .setColor('Red').setAuthor({ name: `▶️ YouTube - ${channel}` })
            .setTitle(title).setURL(videoUrl)
            .setDescription(`**${channel}** postou um novo vídeo!\n\n[Assistir](${videoUrl})`)
            .setImage(thumbnailUrl).setTimestamp()
            .setFooter({ text: `${guildConfig.guildName} | YouTube`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

        await discordChannel.send({ embeds: [embed] });
        await db.youtubeNotifications.create({ guildId: guildConfig.guildId, title, author: channel, thumbnail: thumbnailUrl, description: `${channel} postou vídeo` });

        logger.info(`Notificação YouTube enviada: ${channel} - ${title}`, channelContext);
    } catch (error) {
        if (error.response?.status !== 404) {
            logger.error(`Erro no canal ${channel}`, channelContext, error);
        }
    }
}

function scheduleNotificationYoutubeCheck() {
    cron.schedule('*/5 * * * *', () => {
        onNotificationYoutube();
    });
    logger.info('Agendador YouTube iniciado (5min)');
}

module.exports = { scheduleNotificationYoutubeCheck, onNotificationYoutube, processGuildYoutubeNotifications };
