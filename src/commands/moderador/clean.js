const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { checkingComandExecuntionModerador, checkingComandChannelBlocked } = require("../../utils/checkingComandsExecution");

async function clean(interaction) {
    if (!interaction.isCommand()) return;

    const isAuthorized = await checkingComandChannelBlocked(interaction);
    if (!isAuthorized) return;
    const isMod = await checkingComandExecuntionModerador(interaction);
    if (!isMod) return;

    const { options } = interaction;
    const tipoLimpeza = options.getString('tipo');
    const numeroMensagens = options.getInteger('quantidade');

    if (numeroMensagens <= 0 || numeroMensagens > 100) {
        return interaction.reply({
            embeds: [new EmbedBuilder().setColor('White').setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) }).setDescription('O número deve estar entre 1 e 100.').setTimestamp().setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })],
            ephemeral: true
        });
    }

    try {
        if (tipoLimpeza === 'usuario') {
            const usuario = options.getUser('usuario');
            if (!usuario) return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('Especifique um usuário.')], ephemeral: true });

            const fetched = await interaction.channel.messages.fetch({ limit: 100 });
            const userMessages = fetched.filter(msg => msg.author.id === usuario.id).first(numeroMensagens);

            if (userMessages.length === 0) return interaction.reply({ embeds: [new EmbedBuilder().setColor('Yellow').setDescription(`Nenhuma mensagem de ${usuario.tag}.`)], ephemeral: true });

            await interaction.channel.bulkDelete(userMessages);
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xffffff).setDescription(`✅ ${userMessages.length} mensagens de ${usuario.tag} deletadas.`).setTimestamp()], ephemeral: true });
            const log = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            if (log) log.send(`🧹 ${userMessages.length} mensagens de ${usuario.tag} deletadas por ${interaction.user.tag}.`);
        } else {
            const fetched = await interaction.channel.messages.fetch({ limit: numeroMensagens });
            await interaction.channel.bulkDelete(fetched);
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xffffff).setDescription(`✅ ${numeroMensagens} mensagens deletadas.`).setTimestamp()], ephemeral: true });
            const log = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            if (log) log.send(`🧹 ${numeroMensagens} mensagens deletadas por ${interaction.user.tag}.`);
        }
    } catch (error) {
        let msg = 'Erro ao deletar mensagens.';
        if (error.rawError?.message?.includes('under 14 days old')) msg = 'Só pode deletar mensagens com menos de 14 dias.';
        else if (error.message.includes('Missing Permissions')) msg = 'Bot sem permissão.';
        await interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription(msg).setTimestamp()], ephemeral: true });
    }
}

module.exports = { clean };
