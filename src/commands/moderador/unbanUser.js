const { EmbedBuilder } = require('discord.js');
const { client } = require('../../Client');
const { logger, commandExecuted, securityEvent } = require('../../logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');
const { db } = require('../../database/service');
const { setStandardFooter } = require('../../utils/embedFooter');

async function unbanUser(interaction) {
    if (!interaction.isCommand()) return;

    const { options, member } = interaction;
    const context = { module: 'MODERATION', command: 'desbanir', user: interaction.user.tag, guild: interaction.guild?.name };

    const authorized = await checkingComandChannelBlocked(interaction);
    if (!authorized) return;
    const modAuthorized = await checkingComandExecuntionModerador(interaction);
    if (!modAuthorized) return;

    try {
        const userToUnban = options.getUser('usuario');
        const banList = await interaction.guild.bans.fetch();

        if (!banList.has(userToUnban.id)) {
            return interaction.reply({ embeds: [setStandardFooter(new EmbedBuilder().setColor('Yellow').setDescription('Este usuário não está banido.'), client)], ephemeral: true });
        }

        await interaction.guild.members.unban(userToUnban.id, 'Desbanido via comando');

        const activeTempBan = await db.tempBans.findOne({ userId: userToUnban.id, guildId: interaction.guild.id, isActive: true });
        if (activeTempBan) {
            await db.tempBans.update(activeTempBan.id, { isActive: false });
        }

        try {
            await userToUnban.send('Você foi desbanido do servidor.');
        } catch (dmError) {
            logger.warn(`DM não enviada para ${userToUnban.tag}`, context, dmError);
        }

        saveUserInfractions(
            interaction.guild.id, userToUnban.id, userToUnban.tag, userToUnban.displayAvatarURL({ dynamic: true }),
            userToUnban.createdAt, userToUnban.joinedAt, 'unbans', 'Desbanido', member.user.tag
        );

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`${userToUnban.tag} foi desbanido com sucesso!`);
        setStandardFooter(embed, client);
        await interaction.reply({ embeds: [embed], ephemeral: true });

        commandExecuted('desbanir', interaction.user, interaction.guild, true);
        securityEvent('USER_UNBANNED', userToUnban, interaction.guild, `Desbanido por ${interaction.user.tag}`);
    } catch (error) {
        logger.error('Erro ao desbanir', context, error);
        commandExecuted('desbanir', interaction.user, interaction.guild, false);
    }
}

module.exports = { unbanUser };
