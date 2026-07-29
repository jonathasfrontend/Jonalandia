const { EmbedBuilder } = require('discord.js');
const { db } = require('../../database/service');
const { logger, commandExecuted } = require('../../logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function listTempBans(interaction) {
    if (!interaction.isCommand()) return;

    const context = { module: 'MODERATION', command: 'listbans', user: interaction.user.tag, guild: interaction.guild?.name };

    const authorized = await checkingComandChannelBlocked(interaction);
    if (!authorized) return;
    const modAuthorized = await checkingComandExecuntionModerador(interaction);
    if (!modAuthorized) return;

    try {
        await interaction.deferReply({ ephemeral: true });
        const activeBans = await db.tempBans.findByGuildId(interaction.guild.id);

        const embed = new EmbedBuilder()
            .setColor('Orange')
            .setTitle('📋 Bans Temporários Ativos');

        if (activeBans.length === 0) {
            embed.setDescription('Nenhum ban temporário ativo.');
        } else {
            embed.setDescription(`Total: **${activeBans.length}**`);
            const fields = activeBans.slice(0, 25).map((b, i) => ({
                name: `${i + 1}. ${b.username}`,
                value: `**Duração:** ${b.duration}\n**Expira:** <t:${Math.floor(new Date(b.unbanDate).getTime() / 1000)}:R>`,
                inline: true
            }));
            embed.addFields(fields);
        }

        await interaction.editReply({ embeds: [embed] });
        commandExecuted('listbans', interaction.user, interaction.guild, true);
    } catch (error) {
        logger.error('Erro ao listar bans', context, error);
        commandExecuted('listbans', interaction.user, interaction.guild, false);
    }
}

module.exports = { listTempBans };
