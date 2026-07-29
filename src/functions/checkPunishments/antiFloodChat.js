const { Collection, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { client } = require("../../Client");
const { logger, securityEvent, databaseEvent } = require('../../logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');
const { isUserImmune } = require('../../utils/checkUserImmune');
const configData = require('../../config/punishmentConfig.json');

const config = configData.antiFlood || {};

/**
 * Armazenamento temporário de dados dos usuários
 */
class UserFloodData {
    constructor() {
        // Armazena timestamps das mensagens por usuário
        this.userMessages = new Collection();

        // Armazena avisos dados aos usuários
        this.userWarnings = new Collection();

        // Armazena cooldowns de avisos
        this.warningCooldowns = new Collection();
    }

    /**
     * Adiciona uma nova mensagem para o usuário
     * @param {string} userId - ID do usuário
     * @param {number} timestamp - Timestamp da mensagem
     */
    addMessage(userId, timestamp = Date.now()) {
        if (!this.userMessages.has(userId)) {
            this.userMessages.set(userId, []);
        }

        const messages = this.userMessages.get(userId);
        messages.push(timestamp);

        // Remove mensagens antigas (fora da janela de tempo)
        const cutoff = timestamp - config.timeWindow;
        const recentMessages = messages.filter(msgTime => msgTime > cutoff);

        this.userMessages.set(userId, recentMessages);

        return recentMessages.length;
    }

    /**
     * Obtém o número de mensagens recentes do usuário
     * @param {string} userId - ID do usuário
     * @returns {number} Número de mensagens na janela de tempo
     */
    getRecentMessageCount(userId) {
        const messages = this.userMessages.get(userId);
        if (!messages) return 0;

        const cutoff = Date.now() - config.timeWindow;
        return messages.filter(msgTime => msgTime > cutoff).length;
    }

    /**
     * Adiciona um aviso ao usuário
     * @param {string} userId - ID do usuário
     */
    addWarning(userId) {
        const warnings = this.userWarnings.get(userId) || 0;
        this.userWarnings.set(userId, warnings + 1);
        return warnings + 1;
    }

    /**
     * Obtém o número de avisos do usuário
     * @param {string} userId - ID do usuário
     * @returns {number} Número de avisos
     */
    getWarnings(userId) {
        return this.userWarnings.get(userId) || 0;
    }

    /**
     * Verifica se o usuário está em cooldown de aviso
     * @param {string} userId - ID do usuário
     * @returns {boolean} True se estiver em cooldown
     */
    isInWarningCooldown(userId) {
        const cooldownEnd = this.warningCooldowns.get(userId);
        if (!cooldownEnd) return false;

        if (Date.now() > cooldownEnd) {
            this.warningCooldowns.delete(userId);
            return false;
        }

        return true;
    }

    /**
     * Define cooldown de aviso para o usuário
     * @param {string} userId - ID do usuário
     */
    setWarningCooldown(userId) {
        this.warningCooldowns.set(userId, Date.now() + config.warningCooldown);
    }

    /**
     * Limpa todos os dados do usuário
     * @param {string} userId - ID do usuário
     */
    clearUser(userId) {
        this.userMessages.delete(userId);
        this.userWarnings.delete(userId);
        this.warningCooldowns.delete(userId);
    }

    /**
     * Limpeza automática de dados antigos (executar periodicamente)
     */
    cleanup() {
        const now = Date.now();
        const cutoff = now - (config.timeWindow * 2); // Manter dados por 2x a janela de tempo

        // Limpar mensagens antigas
        for (const [userId, messages] of this.userMessages.entries()) {
            const recentMessages = messages.filter(msgTime => msgTime > cutoff);
            if (recentMessages.length === 0) {
                this.userMessages.delete(userId);
            } else {
                this.userMessages.set(userId, recentMessages);
            }
        }

        // Limpar avisos antigos (após 1 hora)
        const warningCutoff = now - (60 * 60 * 1000);
        for (const [userId, timestamp] of this.warningCooldowns.entries()) {
            if (timestamp < warningCutoff) {
                this.userWarnings.delete(userId);
                this.warningCooldowns.delete(userId);
            }
        }
    }
}

// Instância global dos dados de flood
const floodData = new UserFloodData();

// Limpeza automática a cada 5 minutos
setInterval(() => {
    floodData.cleanup();
}, 5 * 60 * 1000);

/**
 * Cria embed de aviso para flood
 * @param {User} user - Usuário que fez flood
 * @param {number} warnings - Número de avisos
 * @param {string} infractionId - UUID da infração
 * @returns {EmbedBuilder} Embed de aviso
 */
function createWarningEmbed(user, warnings, infractionId = null) {
    const remainingWarnings = config.maxWarnings - warnings;

    const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('<:feliz:1402690475634458664> ⚠️ Aviso - Flood Detectado')
        .setDescription(
            `${user}, você está enviando mensagens muito rapidamente!\n\n` +
            `**Avisos:** ${warnings}/${config.maxWarnings}\n` +
            `**Restam:** ${remainingWarnings} aviso(s) antes do timeout\n\n` +
            `Por favor, diminua a velocidade das suas mensagens.`
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({
            text: `Sistema Anti-Flood • ${client.user.tag}`,
            iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

    if (infractionId) {
        embed.addFields({ name: '🆔 ID da Infração', value: `\`${infractionId}\``, inline: true });
    }

    return embed;
}

/**
 * Cria embed de timeout por flood
 * @param {User} user - Usuário que levou timeout
 * @param {string} infractionId - UUID da infração
 * @returns {EmbedBuilder} Embed de timeout
 */
function createTimeoutEmbed(user, infractionId = null) {
    const timeoutMinutes = Math.floor(config.timeoutDuration / 60000);

    const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('<:affs:1402695937175846912> 🔇 Timeout Aplicado - Flood de Mensagens')
        .setDescription(
            `${user} foi temporariamente silenciado por **${timeoutMinutes} minutos** ` +
            `devido ao flood de mensagens.\n\n` +
            `**Motivo:** Excesso de mensagens em pouco tempo\n` +
            `**Duração:** ${timeoutMinutes} minutos\n\n` +
            `Leia as regras do servidor para evitar futuras punições.`
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({
            text: `Sistema Anti-Flood • ${client.user.tag}`,
            iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

    if (infractionId) {
        embed.addFields({ name: '🆔 ID da Infração', value: `\`${infractionId}\``, inline: true });
    }

    return embed;
}

/**
 * Registra infração no banco de dados
 * @param {User} user - Usuário que cometeu a infração
 * @param {GuildMember} member - Membro do servidor
 * @param {string} type - Tipo da infração
 * @param {string} reason - Motivo da infração
 * @returns {string|null} UUID da infração ou null se falhou
 */
async function registerInfraction(guildId, user, member, type, reason) {
    try {
        const infractionId = await saveUserInfractions(
            guildId,
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

/**
 * Envia notificação para o canal de logs
 * @param {User} user - Usuário
 * @param {string} action - Ação tomada
 * @param {number} messageCount - Número de mensagens
 */
async function sendLogNotification(user, action, messageCount) {
    const logChannelId = process.env.CHANNEL_ID_LOGS_INFO_BOT;
    if (!logChannelId) return;

    const logChannel = client.channels.cache.get(logChannelId);
    if (!logChannel) {
        logger.warn('Canal de logs não encontrado', {
            module: 'ANTI_FLOOD',
            channelId: logChannelId
        });
        return;
    }

    try {
        const embed = new EmbedBuilder()
            .setColor(action === 'timeout' ? '#FF0000' : '#FFA500')
            .setTitle(`🛡️ Anti-Flood - ${action === 'timeout' ? 'Timeout' : 'Aviso'}`)
            .addFields(
                { name: 'Usuário', value: `${user} (${user.tag})`, inline: true },
                { name: 'Ação', value: action === 'timeout' ? 'Timeout aplicado' : 'Aviso enviado', inline: true },
                { name: 'Mensagens', value: `${messageCount} em ${config.timeWindow / 1000}s`, inline: true }
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });

    } catch (error) {
        logger.error('Erro ao enviar notificação para logs', {
            module: 'ANTI_FLOOD',
            error: error.message
        });
    }
}

/**
 * Função principal do sistema Anti-Flood
 * @param {Message} message - Mensagem do Discord
 */
async function antiFloodChat(message) {
    // Verificações básicas
    if (!message.inGuild()) return;
    if (message.author.bot) return;

    const { author, member, guild } = message;
    const context = {
        module: 'ANTI_FLOOD',
        user: author.tag,
        guild: guild?.name,
        userId: author.id
    };

    // Verificar se o usuário é imune ao anti-flood
    if (await isUserImmune(member)) {
        logger.info(`Usuário ${author.tag} é imune ao anti-flood`, context);
        return;
    }

    try {
        // Adicionar mensagem e obter contagem
        const messageCount = floodData.addMessage(author.id);

        logger.debug(`Mensagem registrada para ${author.tag}: ${messageCount}/${config.maxMessages}`, context);

        // Verificar se ultrapassou o limite
        if (messageCount > config.maxMessages) {
            const warnings = floodData.getWarnings(author.id);

            logger.warn(`Flood detectado para ${author.tag}: ${messageCount} mensagens`, {
                ...context,
                messageCount,
                warnings
            });

            // Se já tem avisos suficientes, aplicar timeout
            if (warnings >= config.maxWarnings) {
                logger.info(`Aplicando timeout para ${author.tag} por flood persistente`, context);

                // Registrar infração de timeout
                const reasonFlood = `Timeout por flood de mensagens (${messageCount} mensagens em ${config.timeWindow / 1000}s)`;
                const typeFlood = 'floodTimeouts';
                const reasonTimeout = `O usuário ${message.author.tag} recebeu um timeout de 5 minutos.`;
                const typeTimeout = 'timeouts';
                const reasonWarns = `O usuário ${message.author.tag} recebeu um aviso.`;
                const typeWarns = 'warns';

                const floodId = await registerInfraction(guild.id, author, member, typeFlood, reasonFlood);
                const timeoutId = await registerInfraction(message.guild.id, message.author, message.member, typeTimeout, reasonTimeout);
                const warnsId = await registerInfraction(message.guild.id, message.author, message.member, typeWarns, reasonWarns);


                try {
                    // Aplicar timeout
                    await member.timeout(configData.timeoutLevel.low.timeoutDuration, 'Flood de mensagens - Sistema automático');

                    // Criar e enviar embed de timeout
                    const timeoutEmbed = createTimeoutEmbed(author);
                    await message.reply({ embeds: [timeoutEmbed] });

                    // Criar embed para DM com UUID
                    const dmEmbed = createTimeoutEmbed(author, floodId);
                    try {
                        await author.send({ embeds: [dmEmbed] });
                    } catch (dmError) {
                        logger.warn(`Erro ao enviar DM para ${author.tag}`, context, dmError);
                    }

                    // Enviar log
                    await sendLogNotification(author, 'timeout', messageCount);

                    // Registrar eventos de segurança
                    securityEvent('ANTI_FLOOD_TIMEOUT', author, guild, `${messageCount} mensagens em ${config.timeWindow / 1000}s`);

                    logger.info(`Timeout aplicado com sucesso para ${author.tag}`, {
                        ...context,
                        duration: `${config.timeoutDuration / 60000} minutos`
                    });

                    // Limpar dados do usuário
                    floodData.clearUser(author.id);

                } catch (timeoutError) {
                    logger.error(`Erro ao aplicar timeout para ${author.tag}`, context, timeoutError);
                    securityEvent('TIMEOUT_FAILED', author, guild, timeoutError.message);
                }

            } else {
                // Dar aviso se não estiver em cooldown
                if (!floodData.isInWarningCooldown(author.id)) {
                    const newWarnings = floodData.addWarning(author.id);
                    floodData.setWarningCooldown(author.id);

                    logger.info(`Enviando aviso ${newWarnings}/${config.maxWarnings} para ${author.tag}`, context);

                    // Registrar infração de aviso
                    const warningReason = `Aviso por flood de mensagens (${messageCount} mensagens em ${config.timeWindow / 1000}s)`;
                    const warningId = await registerInfraction(guild.id, author, member, 'floodWarning', warningReason);

                    try {
                        // Criar e enviar embed de aviso
                        const warningEmbed = createWarningEmbed(author, newWarnings);
                        await message.reply({ embeds: [warningEmbed] });

                        // Criar embed para DM com UUID
                        const dmWarningEmbed = createWarningEmbed(author, newWarnings, warningId);
                        try {
                            await author.send({ embeds: [dmWarningEmbed] });
                        } catch (dmError) {
                            logger.warn(`Erro ao enviar DM de aviso para ${author.tag}`, context, dmError);
                        }

                        // Enviar log
                        await sendLogNotification(author, 'warning', messageCount);

                        // Registrar evento de segurança
                        securityEvent('ANTI_FLOOD_WARNING', author, guild, `Aviso ${newWarnings}/${config.maxWarnings}`);

                        logger.info(`Aviso enviado para ${author.tag}`, {
                            ...context,
                            warnings: newWarnings,
                            maxWarnings: config.maxWarnings
                        });

                    } catch (warningError) {
                        logger.error(`Erro ao enviar aviso para ${author.tag}`, context, warningError);
                    }
                } else {
                    logger.debug(`Usuário ${author.tag} em cooldown de aviso`, context);
                }
            }
        }

    } catch (error) {
        logger.error('Erro no sistema anti-flood', context, error);
    }
}

/**
 * Função para recarregar configurações do arquivo JSON
 * @returns {boolean} True se recarregou com sucesso
 */
function reloadConfig() {
    try {
        const newConfig = loadConfiguration();
        CONFIG = newConfig;

        logger.info('Configurações do anti-flood recarregadas do arquivo', {
            module: 'ANTI_FLOOD',
            newConfig: CONFIG
        });

        return true;
    } catch (error) {
        logger.error('Erro ao recarregar configurações do anti-flood', {
            module: 'ANTI_FLOOD',
            error: error.message
        });

        return false;
    }
}

/**
 * Função para obter estatísticas do sistema (útil para debug/monitoramento)
 * @returns {Object} Estatísticas do sistema
 */
function getFloodStats() {
    return {
        config: CONFIG,
        activeUsers: floodData.userMessages.size,
        usersWithWarnings: floodData.userWarnings.size,
        usersInCooldown: floodData.warningCooldowns.size
    };
}

/**
 * Função para ajustar configurações em tempo real (para testes/ajustes)
 * CUIDADO: Use apenas para desenvolvimento/teste
 * @param {Object} newConfig - Novas configurações
 */
function updateConfig(newConfig) {
    Object.assign(CONFIG, newConfig);
    logger.info('Configurações do anti-flood atualizadas em tempo real', {
        module: 'ANTI_FLOOD',
        newConfig: CONFIG
    });
}

module.exports = {
    antiFloodChat,
    getFloodStats,
    updateConfig,
    reloadConfig
};
