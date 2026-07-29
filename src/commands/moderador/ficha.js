const { EmbedBuilder } = require('discord.js');
const { db } = require('../../database/service');
const { client } = require("../../Client");
const { Logger } = require('../../logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function Ficha(interaction) {
    const { options, guild } = interaction;
    if (!interaction.isCommand() && !interaction.isUserContextMenuCommand()) return;

    const authorized = await checkingComandChannelBlocked(interaction);
    if (!authorized) return;
    const modAuthorized = await checkingComandExecuntionModerador(interaction);
    if (!modAuthorized) return;

    try {
        await interaction.deferReply();
        const userOption = interaction.targetUser || options.getUser('usuario');
        if (!userOption) return interaction.editReply({ content: '❌ Usuário inválido.', ephemeral: true });

        const userId = userOption.id;
        const user = await client.users.fetch(userId);
        const member = await guild.members.fetch(userId);

        if (!user || !member) return interaction.editReply({ content: '❌ Usuário não encontrado.', ephemeral: true });

        const infractionData = await db.infractions.findByGuildAndUser(guild.id, userId);

        const formatDuration = (ms) => {
            const s = Math.floor(ms / 1000);
            const m = Math.floor(s / 60);
            const h = Math.floor(m / 60);
            const d = Math.floor(h / 24);
            if (d > 365) return `${Math.floor(d / 365)} anos`;
            if (d > 30) return `${Math.floor(d / 30)} meses`;
            if (d > 0) return `${d} dias`;
            if (h > 0) return `${h} horas`;
            if (m > 0) return `${m} minutos`;
            return `${s} segundos`;
        };

        const now = new Date();
        const embed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setTitle(`Perfil de ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👤 Nome', value: user.tag, inline: true },
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '📅 Conta', value: `${user.createdAt.toLocaleDateString('pt-BR')} (há ${formatDuration(now - user.createdAt)})`, inline: true },
                { name: '📅 Entrou', value: `${member.joinedAt.toLocaleDateString('pt-BR')} (há ${formatDuration(now - member.joinedAt)})`, inline: true }
            );

        if (infractionData) {
            const inf = typeof infractionData.infractions === 'object' ? infractionData.infractions : {};
            const logs = Array.isArray(infractionData.logs) ? infractionData.logs : [];
            embed.addFields({
                name: '📊 Infrações',
                value: `🗣️ Inapropriado: ${inf.inappropriateLanguage || 0}\n⏳ Timeouts: ${inf.timeouts || 0}\n🔇 Kick Voz: ${inf.voiceChannelKicks || 0}\n🚪 Expulsões: ${inf.expulsion || 0}\n🚫 Bans: ${inf.bans || 0}\n🔓 Unbans: ${inf.unbans || 0}\n💬 Flood: ${inf.floodTimeouts || 0}\n📁 Arq. Bloq.: ${inf.blockedFiles || 0}\n🔗 Links: ${inf.serverLinksPosted || 0}\n⚠️ Warns: ${inf.warns || 0}`,
                inline: false
            });
            const recentLogs = logs.slice(-5).map(l => `**${l.type}:** ${l.reason} (por ${l.moderator})`);
            embed.addFields({ name: '📜 Logs', value: recentLogs.length > 0 ? recentLogs.join('\n') : 'Nenhum log.', inline: false });
        } else {
            embed.addFields({ name: '📊 Infrações', value: 'Nenhum registro.', inline: false });
        }

        await interaction.editReply({ embeds: [embed] });
        Logger.info(`Ficha executada para ${user.tag}`);
    } catch (error) {
        Logger.error('Erro na ficha:', error);
        try { await interaction.editReply({ content: '❌ Erro ao buscar dados.' }); } catch (e) {}
    }
}

module.exports = { Ficha };
