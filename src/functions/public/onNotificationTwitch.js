const { client } = require("../../Client");
const { logger, botEvent } = require('../../logger');
const { db } = require('../../database/service');
const axios = require('axios');
const { EmbedBuilder } = require("discord.js");
const cron = require('node-cron');
const { setStandardFooter } = require('../../utils/embedFooter');

async function onNotificationTwitch() {
    try {
        const activeGuilds = await db.guilds.getAllActive();
        for (const guildConfig of activeGuilds) {
            await processGuildTwitchNotifications(guildConfig);
        }
    } catch (error) {
        logger.error('Erro nas notificações Twitch', { module: 'TWITCH' }, error);
    }
}

async function processGuildTwitchNotifications(guildConfig) {
    const context = { module: 'TWITCH', guildId: guildConfig.guildId, guildName: guildConfig.guildName };

    try {
        const streamersData = await db.streamers.find({ guildId: guildConfig.guildId });
        if (streamersData.length === 0) return;

        const notificationChannelData = await db.notificationChannels.findOne({ guildId: guildConfig.guildId, notificationType: 'twitch' });
        if (!notificationChannelData) return;

        const discordChannel = client.channels.cache.get(notificationChannelData.channelId);
        if (!discordChannel) return;

        for (const streamerData of streamersData) {
            await checkStreamerStatus(streamerData.name, guildConfig, discordChannel, context);
        }
    } catch (error) {
        logger.error(`Erro na guild ${guildConfig.guildName}`, context, error);
    }
}

async function checkStreamerStatus(streamer, guildConfig, discordChannel, baseContext) {
    const streamerContext = { ...baseContext, streamer };

    try {
        const [uptimeRes, avatarRes, titleRes, gameRes] = await Promise.all([
            axios.get(`https://decapi.me/twitch/uptime/${streamer}`),
            axios.get(`https://decapi.me/twitch/avatar/${streamer}`),
            axios.get(`https://decapi.me/twitch/title/${streamer}`),
            axios.get(`https://decapi.me/twitch/game/${streamer}`)
        ]);

        if (uptimeRes.data === `${streamer} is offline`) return;
        if (uptimeRes.status === 429) return;

        const existing = await db.twitchNotifications.findOne({ guildId: guildConfig.guildId, title: titleRes.data, streamer });
        if (existing) return;

        const embed = new EmbedBuilder()
            .setColor('Blurple').setAuthor({ name: `🟣 Twitch - ${streamer}`, iconURL: avatarRes.data })
            .setTitle(titleRes.data).setURL(`https://twitch.tv/${streamer}`)
            .setThumbnail(avatarRes.data)
            .setDescription(`**${streamer}** está online!\n\n[Assistir](https://twitch.tv/${streamer})`)
            .addFields(
                { name: '🎮 Jogando', value: gameRes.data || 'Não definido', inline: true },
                { name: '⏱️ Online', value: uptimeRes.data, inline: true }
            );
        setStandardFooter(embed, client, `${guildConfig.guildName} | Twitch`);

        await discordChannel.send({ embeds: [embed] });
        await db.twitchNotifications.create({ guildId: guildConfig.guildId, title: titleRes.data, streamer, image: avatarRes.data, gamer: gameRes.data });

        logger.info(`Notificação Twitch: ${streamer} ao vivo`, streamerContext);
    } catch (error) {
        if (error.response?.status !== 404 && error.response?.status !== 429) {
            logger.error(`Erro no streamer ${streamer}`, streamerContext, error);
        }
    }
}

function scheduleNotificationTwitchCheck() {
    cron.schedule('*/3 * * * *', () => {
        onNotificationTwitch();
    });
    logger.info('Agendador Twitch iniciado (3min)');
}

module.exports = { scheduleNotificationTwitchCheck, onNotificationTwitch, processGuildTwitchNotifications };
