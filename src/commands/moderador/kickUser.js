const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { client } = require("../../Client");
const { logger, securityEvent } = require('../../logger');
const { saveUserInfractions } = require("../../utils/saveUserInfractions");
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require("../../utils/checkingComandsExecution");

async function kickUser(interaction) {
    if (!interaction.isCommand()) return;

    const { options, member, guild } = interaction;
    const context = { module: 'MODERATION', command: 'kickuser', user: interaction.user.tag, guild: guild?.name };

    const authorized = await checkingComandChannelBlocked(interaction);
    if (!authorized) return;
    const modAuthorized = await checkingComandExecuntionModerador(interaction);
    if (!modAuthorized) return;

    try {
        await interaction.deferReply({ ephemeral: true });
        const userToKick = options.getUser('usuario');
        if (!userToKick) return interaction.reply({ content: "Selecione um usuário.", ephemeral: true });

        const memberToKick = guild.members.cache.get(userToKick.id);
        if (!memberToKick) return interaction.editReply({ content: "Usuário não está no servidor." });
        if (!interaction.member.voice?.channel) return interaction.editReply({ content: "Você precisa estar em um canal de voz." });
        if (!memberToKick.voice?.channel) return interaction.editReply({ content: "O usuário não está em canal de voz." });
        if (memberToKick.voice.channel.id !== interaction.member.voice.channel.id) return interaction.editReply({ content: "O usuário não está no mesmo canal." });

        const botMember = guild.members.cache.get(client.user.id);
        if (!botMember.permissions.has(PermissionFlagsBits.MoveMembers)) return interaction.editReply({ content: "Não tenho permissão MOVE_MEMBERS." });

        await saveUserInfractions(
            guild.id, userToKick.id, userToKick.tag, userToKick.displayAvatarURL({ dynamic: true }),
            userToKick.createdAt, memberToKick.joinedAt, 'voiceChannelKicks',
            `Expulso do canal de voz`, member.user.tag
        );

        await memberToKick.voice.disconnect();

        const embed = new EmbedBuilder()
            .setColor('Red').setTitle('🚪 Usuário expulso do canal de voz')
            .setDescription(`${userToKick.tag} foi expulso do canal de voz.`)
            .setTimestamp().setFooter({ text: `Por ${member.user.tag}` });

        await interaction.editReply({ embeds: [embed] });
        securityEvent('VOICE_KICK', userToKick, guild, `Expulso do canal de voz por ${member.user.tag}`);
    } catch (error) {
        logger.error('Erro no kickuser', context, error);
        try { await interaction.editReply({ content: 'Erro ao expulsar do canal de voz.' }); } catch (e) {}
    }
}

module.exports = { kickUser };
