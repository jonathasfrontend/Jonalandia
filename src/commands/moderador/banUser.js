const { EmbedBuilder } = require('discord.js');
const { client } = require('../../Client');
const { logger, commandExecuted, securityEvent } = require('../../logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');
const { db } = require('../../database/service');
const punishmentConfig = require('../../config/punishmentConfig.json');
const { setStandardFooter } = require('../../utils/embedFooter');

async function banUser(interaction) {
    if (!interaction.isCommand()) return;

    const { options, member } = interaction;
    const context = { module: 'MODERATION', command: 'banir', user: interaction.user.tag, guild: interaction.guild?.name };

    const authorized = await checkingComandChannelBlocked(interaction);
    if (!authorized) return;
    const modAuthorized = await checkingComandExecuntionModerador(interaction);
    if (!modAuthorized) return;

    try {
        await interaction.deferReply({ ephemeral: true });
        const userToBan = options.getUser('usuario');
        const duration = options.getString('duracao');
        const memberToBan = await interaction.guild.members.fetch(userToBan.id);

        let unbanDate = null;
        let durationText = punishmentConfig.ban.permanentLabel || 'permanente';

        if (duration) {
            const durationConfig = punishmentConfig.ban.durations.find(d => d.value === duration);
            if (durationConfig) {
                unbanDate = new Date(Date.now() + durationConfig.ms);
                durationText = durationConfig.value;
            }
        }

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Você foi banido')
            .setDescription(unbanDate
                ? `Banido temporariamente por **${durationText}**. Expira em ${unbanDate.toLocaleString('pt-BR')}.`
                : 'Você foi banido permanentemente.');
        setStandardFooter(embed, client, `Banido por ${member.user.tag}`);

        try {
            await userToBan.send({ embeds: [embed] });
        } catch (dmError) {
            logger.warn(`DM não enviada para ${userToBan.tag}`, context, dmError);
        }

        const reason = unbanDate
            ? `Banido temporariamente (${durationText})`
            : 'Banido permanentemente';

        await saveUserInfractions(
            interaction.guild.id, userToBan.id, userToBan.tag, userToBan.displayAvatarURL({ dynamic: true }),
            userToBan.createdAt, memberToBan.joinedAt, 'bans', reason, member.user.tag
        );

        await memberToBan.ban({ reason: "Para dúvidas, fale com o dono do servidor." });

        if (unbanDate) {
            await db.tempBans.create({
                userId: userToBan.id, username: userToBan.tag, guildId: interaction.guild.id,
                bannedBy: member.user.tag, banReason: reason, unbanDate, duration: durationText
            });
        }

        securityEvent('USER_BANNED', userToBan, interaction.guild, `Banido por ${member.user.tag}${unbanDate ? ` (${durationText})` : ''}`);

        const replyEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(unbanDate ? 'Banido Temporariamente' : 'Usuário Banido')
            .setDescription(unbanDate
                ? `${userToBan.tag} banido por ${durationText}. Expira: ${unbanDate.toLocaleString('pt-BR')}`
                : `${userToBan.tag} banido com sucesso.`);
        setStandardFooter(replyEmbed, client, `Ação: ${member.user.tag}`);

        await interaction.editReply({ embeds: [replyEmbed] });

        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
        if (logChannel) logChannel.send(`🔨 ${userToBan.tag} foi banido${unbanDate ? ` (${durationText})` : ''}.`);

        commandExecuted('banir', interaction.user, interaction.guild, true);
    } catch (error) {
        logger.error('Erro ao banir usuario', context, error);
        commandExecuted('banir', interaction.user, interaction.guild, false);
        const errMsg = { content: 'Erro ao banir o usuário.' };
        if (interaction.deferred) await interaction.editReply(errMsg);
        else if (!interaction.replied) await interaction.reply(errMsg);
    }
}

module.exports = { banUser };
