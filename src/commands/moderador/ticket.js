const {
    EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder,
    PermissionsBitField, StringSelectMenuBuilder
} = require("discord.js");
const { client } = require("../../Client");
const { logger, botEvent } = require('../../logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require("../../utils/checkingComandsExecution");
const { db } = require("../../database/service");

const TICKET_OPTIONS = [
    { label: 'Tirar dúvidas', value: 'tirarduvida', emoji: '🌞' },
    { label: 'Fazer uma denúncia', value: 'denuncia', emoji: '🚨' },
    { label: 'Enviar sugestões', value: 'sugestao', emoji: '💡' },
    { label: 'Reportar Bug', value: 'reportarbug', emoji: '🐛' },
    { label: 'Minha opção não está aqui! Me ajuda!', value: 'outra', emoji: '<:1598blurplesupport:1402373636513337550>' },
];

async function ticket(interaction) {
    if (!interaction.isCommand()) return;

    const authorized = await checkingComandChannelBlocked(interaction);
    if (!authorized) return;
    const modAuthorized = await checkingComandExecuntionModerador(interaction);
    if (!modAuthorized) return;

    const ticketConfig = await db.tickets.findOne({ guildId: interaction.guild.id });

    if (!ticketConfig || !ticketConfig.channelId || ticketConfig.channelId === '0') {
        return interaction.reply({ content: '⚠️ Configure o sistema de tickets no `/painel` (página 5).', ephemeral: true });
    }

    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('ticket').setPlaceholder('Selecione uma opção...')
            .addOptions(TICKET_OPTIONS)
    );

    const embedTicket = new EmbedBuilder()
        .setColor(0xffffff).setTitle('💁 Central de Ajuda de Jonalandia.')
        .setDescription('**Abra um ticket 🎫 para falar com nossa equipe.**\nUse para tirar dúvidas, relatar problemas ou buscar suporte.')
        .setImage('https://raw.githubusercontent.com/jonathasfrontend/Jonalandia/refs/heads/main/bgticket.png');

    const discordChannel = client.channels.cache.get(ticketConfig.channelId);
    if (!discordChannel) {
        return interaction.reply({ content: '⚠️ Canal de tickets não encontrado. Verifique o painel.', ephemeral: true });
    }

    await discordChannel.send({ embeds: [embedTicket], components: [row] });
    await interaction.reply({ content: '✅ Painel de tickets enviado!', ephemeral: true });
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    const isTicket = ['ticket', 'create_ticket', 'close_ticket'].includes(interaction.customId) ||
        interaction.customId.startsWith('create_ticket_');
    if (!isTicket) return;

    const fecharTicket = new ButtonBuilder().setCustomId('close_ticket').setLabel('Fechar Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒');
    const btnClose = new ActionRowBuilder().addComponents(fecharTicket);

    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket') {
        const value = interaction.values[0];
        const messages = {
            tirarduvida: '<:feliz:1402690475634458664> Para dúvidas, use os canais comunitários.',
            denuncia: '<:feliz:1402690475634458664> Para denunciar, tenha provas e crie um ticket abaixo.',
            sugestao: '<:feliz:1402690475634458664> Use o chat <#1401944421565595648> para sugestões.',
            reportarbug: '<:feliz:1402690475634458664> Descreva o bug com detalhes e crie um ticket.',
            outr: '⚠️ Se apenas um staff pode ajudar, clique abaixo.',
        };

        const components = [];
        if (['denuncia', 'reportarbug', 'outra'].includes(value)) {
            components.push(new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`create_ticket_${value}`).setLabel('Criar Ticket').setStyle(ButtonStyle.Primary).setEmoji('📩')
            ));
        }

        await interaction.reply({ content: messages[value] || 'Opção selecionada.', components, ephemeral: true });
        return;
    }

    if (interaction.customId === 'create_ticket' || interaction.customId.startsWith('create_ticket_')) {
        const ticketConfig = await db.tickets.findOne({ guildId: interaction.guild.id });
        if (!ticketConfig || !ticketConfig.categoryId || ticketConfig.categoryId === '0') {
            return interaction.reply({ content: 'Configuração de tickets incompleta.', ephemeral: true });
        }

        const category = interaction.guild.channels.cache.get(ticketConfig.categoryId);
        if (!category || category.type !== 4) {
            return interaction.reply({ content: 'Categoria inválida.', ephemeral: true });
        }

        const channelName = `ticket-${interaction.user.username}`;
        if (interaction.guild.channels.cache.find(c => c.name === channelName)) {
            return interaction.reply({ content: 'Você já tem um ticket aberto.', ephemeral: true });
        }

        try {
            const ticketChannel = await interaction.guild.channels.create({
                name: channelName, type: 0, parent: category.id,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.ReadMessageHistory] },
                    { id: ticketConfig.supportRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.ReadMessageHistory] },
                ],
            });

            await interaction.reply({ content: `Ticket criado: <#${ticketChannel.id}>`, ephemeral: true });

            const embedTicket = new EmbedBuilder()
                .setColor(0xffffff).setTitle('📩 Ticket')
                .setDescription(`Olá <@${interaction.user.id}>!\n\nO suporte estará com você em breve.`)
                .setFooter({ text: client.user.tag }).setTimestamp();
            await ticketChannel.send({ embeds: [embedTicket], components: [btnClose] });
        } catch (error) {
            logger.error('Erro ao criar ticket', { module: 'SUPPORT' }, error);
            return interaction.reply({ content: 'Erro ao criar ticket.', ephemeral: true });
        }
    }

    if (interaction.customId === 'close_ticket') {
        const channel = interaction.channel;
        await interaction.reply({ content: 'Fechando ticket em 5 segundos...', ephemeral: true });
        setTimeout(() => channel.delete(), 5000);
    }
});

module.exports = { ticket };
