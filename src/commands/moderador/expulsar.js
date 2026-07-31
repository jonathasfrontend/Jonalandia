const { EmbedBuilder } = require('discord.js');
const { client } = require("../../Client");
const { logger } = require('../../logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');
const { setStandardFooter } = require('../../utils/embedFooter');

async function expulsar(interaction) {
    if (!interaction.isCommand()) return;

    const { options } = interaction;

    const authorized = await checkingComandChannelBlocked(interaction);
    if (!authorized) return;
    const modAuthorized = await checkingComandExecuntionModerador(interaction);
    if (!modAuthorized) return;

    try {
        await interaction.deferReply({ ephemeral: true });
        const userToKick = options.getUser('usuario');
        const targetMember = await interaction.guild.members.fetch(userToKick.id);

        try {
            await userToKick.send("Você foi expulso do servidor Jonalandia.");
        } catch (dmError) {
            logger.warn(`DM não enviada para ${userToKick.tag}`);
        }

        saveUserInfractions(
            interaction.guild.id, userToKick.id, userToKick.tag, userToKick.displayAvatarURL({ dynamic: true }),
            userToKick.createdAt, targetMember.joinedAt, 'expulsion',
            `Expulso do servidor`, client.user.tag
        );

        await targetMember.kick("Para dúvidas, fale com o dono do servidor.");

        const embed = new EmbedBuilder()
            .setColor('#ff0000').setTitle('Expulsão aplicada')
            .setDescription(`${userToKick.tag} foi expulso.`);
        setStandardFooter(embed, client, `Por: ${client.user.tag}`);

        await interaction.editReply({ embeds: [embed] });

        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
        if (logChannel) logChannel.send(`🚪 Expulsão aplicada em ${userToKick.tag}.`);

        logger.info(`Expulsão aplicada em ${userToKick.tag}.`);
    } catch (error) {
        logger.error('Erro ao expulsar:', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        if (logChannel) logChannel.send(`Erro ao expulsar: ${error.message}`);
    }
}

module.exports = { expulsar };
