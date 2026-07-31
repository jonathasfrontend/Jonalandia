const { EmbedBuilder } = require('discord.js');
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
        this.userMessages = new Map();

        // Armazena avisos dados aos usuários: { count, lastAt }
        this.userWarnings = new Map();

        // Armazena cooldowns de avisos
        this.warningCooldowns = new Map();
    }

    /**
     * Adiciona uma nova mensagem para o usuário
     * @param {string} userId - ID do usuário
     * @param {number} timestamp - Timestamp da mensagem
     * @returns {number} Número de mensagens na janela de tempo
     */
    addMessage(userId, timestamp = Date.now()) {
        const cutoff = timestamp - config.timeWindow;
        let messages = this.userMessages.get(userId);

        if (!messages) {
            messages = [];
            this.userMessages.set(userId, messages);
        }

        // Remove mensagens antigas do início (timestamps em ordem crescente)
        while (messages.length > 0 && messages[0] <= cutoff) {
            messages.shift();
        }

        messages.push(timestamp);

        return messages.length;
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
        let count = 0;
        for (let i = messages.length - 1; i >= 0 && messages[i] > cutoff; i--) {
            count++;
        }

        return count;
    }

    /**
     * Adiciona um aviso ao usuário
     * @param {string} userId - ID do usuário
     * @returns {number} Número total de avisos após adicionar
     */
    addWarning(userId) {
        const warning = this.userWarnings.get(userId);
        const baseCount = this.isWarningDecayed(warning) ? 0 : (warning?.count || 0);
        const newCount = baseCount + 1;

        this.userWarnings.set(userId, { count: newCount, lastAt: Date.now() });

        return newCount;
    }

    /**
     * Obtém o número de avisos do usuário (reseta se estiver fora do período de validade)
     * @param {string} userId - ID do usuário
     * @returns {number} Número de avisos
     */
    getWarnings(userId) {
        const warning = this.userWarnings.get(userId);
        if (!warning) return 0;

        if (this.isWarningDecayed(warning)) {
            this.userWarnings.delete(userId);
            return 0;
        }

        return warning.count;
    }

    /**
     * Verifica se os avisos do usuário expiraram
     * @param {{ count: number, lastAt: number }} warning - Dados do aviso
     * @returns {boolean} True se os avisos expiraram
     */
    isWarningDecayed(warning) {
        return !!warning && config.warningResetTime > 0 && (Date.now() - warning.lastAt) > config.warningResetTime;
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
        const messageCutoff = now - config.timeWindow;

        for (const [userId, messages] of this.userMessages.entries()) {
            while (messages.length > 0 && messages[0] <= messageCutoff) {
                messages.shift();
            }
            if (messages.length === 0) {
                this.userMessages.delete(userId);
            }
        }

        for (const [userId, warning] of this.userWarnings.entries()) {
            if (now - warning.lastAt > config.warningResetTime) {
                this.userWarnings.delete(userId);
            }
        }

        for (const [userId, cooldownEnd] of this.warningCooldowns.entries()) {
            if (now > cooldownEnd) {
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
 * @param {string} action - Ação tomada ('timeout' ou 'warning')
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
 * Aplica timeout por flood persistente
 */
async function handleFloodTimeout(message, author, member, guild, messageCount, context) {
    logger.info(`Aplicando timeout para ${author.tag} por flood persistente`, context);

    const timeoutMinutes = Math.floor(config.timeoutDuration / 60000);
    const reasonFlood = `Timeout por flood de mensagens (${messageCount} mensagens em ${config.timeWindow / 1000}s)`;
    const reasonTimeout = `O usuário ${author.tag} recebeu um timeout de ${timeoutMinutes} minutos.`;
    const reasonWarns = `O usuário ${author.tag} recebeu um aviso.`;

    const floodId = await registerInfraction(guild.id, author, member, 'floodTimeouts', reasonFlood);
    await registerInfraction(guild.id, author, member, 'timeouts', reasonTimeout);
    await registerInfraction(guild.id, author, member, 'warns', reasonWarns);

    try {
        await member.timeout(config.timeoutDuration, 'Flood de mensagens - Sistema automático');

        const timeoutEmbed = createTimeoutEmbed(author);
        await message.reply({ embeds: [timeoutEmbed] });

        const dmEmbed = createTimeoutEmbed(author, floodId);
        try {
            await author.send({ embeds: [dmEmbed] });
        } catch (dmError) {
            logger.warn(`Erro ao enviar DM para ${author.tag}`, context, dmError);
        }

        await sendLogNotification(author, 'timeout', messageCount);

        securityEvent('ANTI_FLOOD_TIMEOUT', author, guild, `${messageCount} mensagens em ${config.timeWindow / 1000}s`);

        logger.info(`Timeout aplicado com sucesso para ${author.tag}`, {
            ...context,
            duration: `${timeoutMinutes} minutos`
        });

        floodData.clearUser(author.id);

    } catch (timeoutError) {
        logger.error(`Erro ao aplicar timeout para ${author.tag}`, context, timeoutError);
        securityEvent('TIMEOUT_FAILED', author, guild, timeoutError.message);
    }
}

/**
 * Envia aviso de flood
 */
async function handleFloodWarning(message, author, member, guild, messageCount, context) {
    const newWarnings = floodData.addWarning(author.id);
    floodData.setWarningCooldown(author.id);

    logger.info(`Enviando aviso ${newWarnings}/${config.maxWarnings} para ${author.tag}`, context);

    const warningReason = `Aviso por flood de mensagens (${messageCount} mensagens em ${config.timeWindow / 1000}s)`;
    const warningId = await registerInfraction(guild.id, author, member, 'floodWarning', warningReason);

    try {
        const warningEmbed = createWarningEmbed(author, newWarnings);
        await message.reply({ embeds: [warningEmbed] });

        const dmWarningEmbed = createWarningEmbed(author, newWarnings, warningId);
        try {
            await author.send({ embeds: [dmWarningEmbed] });
        } catch (dmError) {
            logger.warn(`Erro ao enviar DM de aviso para ${author.tag}`, context, dmError);
        }

        await sendLogNotification(author, 'warning', messageCount);

        securityEvent('ANTI_FLOOD_WARNING', author, guild, `Aviso ${newWarnings}/${config.maxWarnings}`);

        logger.info(`Aviso enviado para ${author.tag}`, {
            ...context,
            warnings: newWarnings,
            maxWarnings: config.maxWarnings
        });

    } catch (warningError) {
        logger.error(`Erro ao enviar aviso para ${author.tag}`, context, warningError);
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

        // Dentro do limite permitido, sem punição
        if (messageCount <= config.maxMessages) return;

        const warnings = floodData.getWarnings(author.id);

        logger.warn(`Flood detectado para ${author.tag}: ${messageCount} mensagens`, {
            ...context,
            messageCount,
            warnings
        });

        if (warnings >= config.maxWarnings) {
            await handleFloodTimeout(message, author, member, guild, messageCount, context);
        } else if (!floodData.isInWarningCooldown(author.id)) {
            await handleFloodWarning(message, author, member, guild, messageCount, context);
        } else {
            logger.debug(`Usuário ${author.tag} em cooldown de aviso`, context);
        }

    } catch (error) {
        logger.error('Erro no sistema anti-flood', context, error);
    }
}

module.exports = { antiFloodChat };
