const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const { db } = require('../../database/service');
const { client } = require('../../Client');
const { logger } = require('../../logger');

async function onNotificationFreeGames() {
    try {
        const response = await axios.get('https://www.freetogame.com/api/games?platform=pc');
        const games = response.data;
        if (!games || games.length === 0) return;

        const activeGuilds = await db.guilds.getAllActive();
        const selectedGames = games.sort(() => 0.5 - Math.random()).slice(0, 3);

        for (const game of selectedGames) {
            await processGameNotification(game, activeGuilds);
        }
    } catch (error) {
        logger.error('Erro nos jogos gratuitos', { module: 'FREE_GAMES' }, error);
    }
}

async function processGameNotification(game, activeGuilds) {
    for (const guildConfig of activeGuilds) {
        try {
            const notification = await db.notificationChannels.findOne({ guildId: guildConfig.guildId, notificationType: 'free_games' });
            if (!notification) continue;

            const discordChannel = client.channels.cache.get(notification.channelId);
            if (!discordChannel) continue;

            const existing = await db.gameNotifications.findOne({ guildId: guildConfig.guildId, title: game.title });
            if (existing) continue;

            const embed = new EmbedBuilder()
                .setColor('Green').setTitle(`🎮 ${game.title}`)
                .setDescription(game.short_description || 'Jogo gratuito disponível!')
                .addFields(
                    { name: '🎯 Gênero', value: game.genre || 'N/E', inline: true },
                    { name: '💻 Plataforma', value: game.platform || 'PC', inline: true },
                    { name: '📅 Lançamento', value: game.release_date || 'N/E', inline: true }
                ).setURL(game.game_url || 'https://www.freetogame.com')
                .setImage(game.thumbnail || null).setTimestamp()
                .setFooter({ text: `${guildConfig.guildName} | Jogo Grátis`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

            await discordChannel.send({ embeds: [embed] });
            await db.gameNotifications.create({ guildId: guildConfig.guildId, title: game.title, genre: game.genre || 'N/E', platform: game.platform || 'PC', release_date: game.release_date || 'N/E' });

            logger.info(`Jogo gratuito notificado: ${game.title} em ${guildConfig.guildName}`);
        } catch (error) {
            logger.error(`Erro ao notificar jogo para ${guildConfig.guildName}`, { guildId: guildConfig.guildId }, error);
        }
    }
}

function scheduleonNotificationFreeGamesCheck() {
    cron.schedule('0 */6 * * *', () => {
        onNotificationFreeGames();
    });
    logger.info('Agendador de jogos gratuitos iniciado (6h)');
}

module.exports = { scheduleonNotificationFreeGamesCheck, onNotificationFreeGames, processGameNotification };
