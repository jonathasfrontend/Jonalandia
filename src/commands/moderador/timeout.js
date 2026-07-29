const { EmbedBuilder } = require('discord.js');
const { client } = require("../../Client");
const { logger, commandExecuted, securityEvent } = require('../../logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function timeout(interaction) {
    if (!interaction.isCommand()) return;

    const { options, member } = interaction;
    const context = { module: 'MODERATION', command: 'timeout', user: interaction.user.tag, guild: interaction.guild?.name };

    const authorized = await checkingComandChannelBlocked(interaction);
    if (!authorized) return;
    const modAuthorized = await checkingComandExecuntionModerador(interaction);
    if (!modAuthorized) return;

    try {
        await interaction.deferReply({ ephemeral: true });
        const userToTimeout = options.getUser('usuario');
        const guildMember = interaction.guild.members.cache.get(userToTimeout.id);

        if (!guildMember) {
            return interaction.editReply({ content: 'Usuário não encontrado no servidor.' });
        }

        if (userToTimeout.id === interaction.guild.ownerId || guildMember.permissions.has('Administrator')) {
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor('#FF0000').setTitle('⚠️ Falhou').setDescription(`Não pode aplicar timeout em ${userToTimeout.tag} (dono/admin).`).setTimestamp()]
            });
        }

        saveUserInfractions(
            interaction.guild.id, userToTimeout.id, userToTimeout.tag, userToTimeout.displayAvatarURL({ dynamic: true }),
            guildMember.user.createdAt, guildMember.joinedAt, 'timeouts',
            `Timeout de 10 minutos em ${userToTimeout.tag}`, member.user.tag
        );

        await guildMember.timeout(10 * 60 * 1000, 'Timeout aplicado via comando.');

        const embed = new EmbedBuilder()
            .setColor('#ff0000').setTitle('Timeout aplicado')
            .setDescription(`${userToTimeout.tag} recebeu timeout de 10 minutos.`)
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

        await interaction.editReply({ embeds: [embed] });
        commandExecuted('timeout', interaction.user, interaction.guild, true);
        securityEvent('USER_TIMEOUT', userToTimeout, interaction.guild, `Timeout por ${interaction.user.tag}`);
    } catch (error) {
        logger.error('Erro ao aplicar timeout', context, error);
        commandExecuted('timeout', interaction.user, interaction.guild, false);
    }
}

module.exports = { timeout };
