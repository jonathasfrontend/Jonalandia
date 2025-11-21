const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const GameNotification = require('../../database/models/gameNotification');
const NotificationChannelsModel = require('../../database/models/notificationChannels');
const GuildConfig = require('../../database/models/guildConfig');
const { client } = require('../../Client');
const { logger, botEvent, databaseEvent } = require('../../logger');

/**
 * Verifica jogos gratuitos e notifica todas as guilds ativas configuradas
 */
async function onNotificationFreeGames() {
    const context = { module: 'FREE_GAMES_NOTIFICATIONS' };
    
    logger.debug('Iniciando verificação de jogos gratuitos multi-guild', context);

    try {
        logger.debug('Fazendo requisição para API de jogos gratuitos', context);
        const response = await axios.get('https://www.freetogame.com/api/games?platform=pc');
        const games = response.data;

        if (!games || games.length === 0) {
            logger.warn('Nenhum jogo encontrado na API', context);
            return;
        }

        logger.info(`${games.length} jogos encontrados na API`, context);

        // Busca todas as guilds ativas que têm notificação de jogos gratuitos configurada
        const activeGuilds = await GuildConfig.find({ isActive: true });
        
        if (activeGuilds.length === 0) {
            logger.debug('Nenhuma guild ativa encontrada', context);
            return;
        }

        logger.info(`Processando jogos gratuitos para ${activeGuilds.length} guild(s) ativa(s)`, context);

        // Seleciona 3 jogos aleatórios para verificar
        const selectedGames = games.sort(() => 0.5 - Math.random()).slice(0, 3);
        logger.debug(`${selectedGames.length} jogos selecionados para verificação`, context);

        // Processa cada jogo
        for (const game of selectedGames) {
            await processGameNotification(game, activeGuilds, context);
        }

        logger.debug('Verificação de jogos gratuitos multi-guild concluída', context);

    } catch (error) {
        logger.error('Erro na verificação de jogos gratuitos', context, error);
        botEvent('FREE_GAMES_ERROR', `Erro geral: ${error.message}`);
    }
}

/**
 * Processa notificação de um jogo para todas as guilds ativas
 * @param {Object} game - Dados do jogo da API
 * @param {Array<GuildConfig>} activeGuilds - Lista de guilds ativas
 * @param {Object} baseContext - Contexto base para logs
 */
async function processGameNotification(game, activeGuilds, baseContext) {
    const gameContext = {
        ...baseContext,
        gameId: game.id,
        gameTitle: game.title
    };

    try {
        logger.debug(`Processando jogo: ${game.title}`, gameContext);

        // Processa cada guild que tem canal de notificação configurado
        for (const guildConfig of activeGuilds) {
            const guildContext = {
                ...gameContext,
                guildId: guildConfig.guildId,
                guildName: guildConfig.guildName
            };

            try {
                // Busca canal de notificação para esta guild
                const notificationChannelData = await NotificationChannelsModel.findOne({ 
                    guildId: guildConfig.guildId,
                    notificationType: 'free_games' 
                });

                if (!notificationChannelData) {
                    logger.silly(`Canal de notificação de jogos gratuitos não configurado para ${guildConfig.guildName}`, guildContext);
                    continue;
                }

                const discordChannel = client.channels.cache.get(notificationChannelData.channelId);
                
                if (!discordChannel) {
                    logger.warn(`Canal de notificação não encontrado ou inacessível para ${guildConfig.guildName}`, {
                        ...guildContext,
                        channelId: notificationChannelData.channelId
                    });
                    continue;
                }

                // Verifica se jogo já foi notificado NESTA GUILD
                const existingNotification = await GameNotification.findOne({ 
                    guildId: guildConfig.guildId,
                    title: game.title
                });

                if (existingNotification) {
                    logger.silly(`Jogo "${game.title}" já notificado para ${guildConfig.guildName}`, guildContext);
                    continue;
                }

                logger.info(`Novo jogo gratuito para notificar em ${guildConfig.guildName}: ${game.title}`, guildContext);
                botEvent('FREE_GAME_DETECTED', `Novo jogo em ${guildConfig.guildName}: ${game.title}`);

                // Cria embed de notificação
                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle(`🎮 ${game.title}`)
                    .setDescription(game.short_description || 'Jogo gratuito disponível!')
                    .addFields(
                        { name: '🎯 Gênero', value: game.genre || 'Não especificado', inline: true },
                        { name: '💻 Plataforma', value: game.platform || 'PC', inline: true },
                        { name: '📅 Lançamento', value: game.release_date || 'Não especificado', inline: true },
                    )
                    .setURL(game.game_url || 'https://www.freetogame.com')
                    .setImage(game.thumbnail || null)
                    .setTimestamp()
                    .setFooter({ 
                        text: `${guildConfig.guildName} | Jogo Gratuito!`,
                        iconURL: client.user.displayAvatarURL({ dynamic: true })
                    });

                // Envia notificação
                await discordChannel.send({ embeds: [embed] });
                
                logger.info(`Notificação de jogo gratuito enviada em ${guildConfig.guildName}: ${game.title}`, guildContext);
                botEvent('FREE_GAME_NOTIFICATION_SENT', `${game.title} notificado em ${guildConfig.guildName}`);

                // Salva registro da notificação com guildId
                const newNotification = new GameNotification({
                    guildId: guildConfig.guildId,
                    title: game.title,
                    genre: game.genre || 'Não especificado',
                    platform: game.platform || 'PC',
                    release_date: game.release_date || 'Não especificado',
                    createdAt: new Date()
                });

                await newNotification.save();
                databaseEvent('INSERT', 'GameNotifications', true, `Jogo salvo para ${guildConfig.guildName}: ${game.title}`);

            } catch (guildError) {
                logger.error(`Erro ao processar jogo para guild ${guildConfig.guildName}`, guildContext, guildError);
                botEvent('FREE_GAME_GUILD_ERROR', `Erro em ${guildConfig.guildName}: ${guildError.message}`);
            }
        }

    } catch (gameError) {
        logger.error(`Erro ao processar jogo: ${game.title}`, gameContext, gameError);
        botEvent('FREE_GAME_PROCESS_ERROR', `Erro ao processar ${game.title}: ${gameError.message}`);
    }
}

/**
 * Agenda verificação automática de jogos gratuitos
 */
function scheduleonNotificationFreeGamesCheck() {
    const context = { module: 'FREE_GAMES_NOTIFICATIONS' };
    
    try {
        // Executa a cada 6 horas para evitar spam (jogos gratuitos não mudam tão frequentemente)
        cron.schedule('0 */6 * * *', () => { 
            logger.debug('Executando verificação automática de jogos gratuitos multi-guild', context);
            botEvent('FREE_GAMES_CHECK_SCHEDULED', 'Verificação automática de jogos gratuitos executada');
            onNotificationFreeGames();
        });

        logger.info('Agendador de notificações de jogos gratuitos multi-guild configurado (a cada 6 horas)', context);
        botEvent('FREE_GAMES_SCHEDULER_CONFIGURED', 'Agendador configurado para executar a cada 6 horas');

    } catch (error) {
        logger.error('Erro ao configurar agendador de notificações de jogos gratuitos', context, error);
    }
}

module.exports = { 
    scheduleonNotificationFreeGamesCheck,
    onNotificationFreeGames,
    processGameNotification
};
