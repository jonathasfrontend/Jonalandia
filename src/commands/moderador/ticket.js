const {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    PermissionsBitField,
    StringSelectMenuBuilder
} = require("discord.js");
const { client } = require("../../Client");
const { logger, botEvent } = require('../../logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require("../../utils/checkingComandsExecution");
const TicketConfigModel = require("../../models/ticketConfig");

const TICKET_OPTIONS = [
    { label: 'Tirar dúvidas', value: 'tirarduvida', emoji: '🌞' },
    { label: 'Fazer uma denúncia', value: 'denuncia', emoji: '🚨' },
    { label: 'Enviar sugestões', value: 'sugestao', emoji: '💡' },
    { label: 'Reportar Bug', value: 'reportarbug', emoji: '🐛' },
    { label: 'Minha opção não está aqui! Me ajuda!', value: 'outra', emoji: '<:1598blurplesupport:1402373636513337550>' },
];

async function ticket(interaction) {
    if (!interaction.isCommand()) return;

    const context = {
        module: 'MODERATION',
        command: 'ticket',
        user: interaction.user.tag,
        guild: interaction.guild?.name
    };

    logger.debug('Iniciando comando ticket', context);

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) {
        logger.warn('Comando ticket bloqueado - canal não autorizado', context);
        return;
    }

    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) {
        logger.warn('Comando ticket negado - usuário sem permissão de moderador', context);
        return;
    }

    // Buscar configurações do banco de dados
    const ticketConfig = await TicketConfigModel.findOne({ guildId: interaction.guild.id });
    
    if (!ticketConfig || ticketConfig.channelId === '0' || ticketConfig.categoryId === '0' || ticketConfig.supportRoleId === '0') {
        await interaction.reply({ 
            content: '⚠️ As configurações de tickets não foram definidas! Use o comando `/painel` (página 5) para configurar o sistema de tickets.', 
            ephemeral: true 
        });
        logger.warn('Tentativa de usar comando ticket sem configurações definidas', context);
        return;
    }

    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('ticket')
            .setPlaceholder('Selecione uma opção...')
            .addOptions(TICKET_OPTIONS)
    );

    const criarTicket = new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('Criar Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📩');

    const btnOpenTicket = new ActionRowBuilder().addComponents(criarTicket);

    const embedTicket = new EmbedBuilder()
        .setColor(0xffffff)
        .setTitle('💁 Central de Ajuda de Jonalandia.')
        .setDescription(`
            **Abra um ticket 🎫 para falar com nossa equipe.**
            Use esta seção para tirar dúvidas, relatar problemas ou buscar suporte direto com a equipe do Jonalandia.

            Antes de abrir um ticket, verifique se sua dúvida já foi respondida nos canais comunitários para evitar solicitações desnecessárias.
        `)
        .setImage('https://raw.githubusercontent.com/jonathasfrontend/Jonalandia/refs/heads/main/bgticket.png');

    await interaction.reply({ content: 'Botão enviado!', ephemeral: true });

    const discordChannel1 = client.channels.cache.get(ticketConfig.channelId);
    
    if (!discordChannel1) {
        await interaction.followUp({ 
            content: '⚠️ O canal configurado para tickets não foi encontrado! Verifique as configurações no painel.', 
            ephemeral: true 
        });
        logger.error('Canal de tickets não encontrado', { ...context, channelId: ticketConfig.channelId });
        return;
    }
    
    discordChannel1.send({ embeds: [embedTicket], components: [row] });

    logger.info('Sistema de ticket configurado com sucesso', context);
};

// Listener específico para interações do sistema de tickets
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    // Verificar se a interação é relacionada ao sistema de tickets
    const isTicketInteraction = interaction.customId === 'ticket' ||
        interaction.customId === 'create_ticket' ||
        interaction.customId.startsWith('create_ticket_') ||
        interaction.customId === 'close_ticket';

    if (!isTicketInteraction) return;

    const fecharTicket = new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Fechar Ticket')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔒');

    const btnCloseTicket = new ActionRowBuilder().addComponents(fecharTicket);

    // Tratamento do StringSelectMenu para seleção de categoria do ticket
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket') {
        const selectedValue = interaction.values[0];

        let responseMessage = '';
        let title = '';

        switch (selectedValue) {
            case 'tirarduvida':
                responseMessage = `
                    <:feliz:1402690475634458664> ┃ Para tirar dúvidas gerais sobre Discord ou Bots use os canais de suporte comunitário como <#1253377112380018801>, <#1253378158045040733> acima.
                `;
                break;
            case 'denuncia':
                responseMessage = `
                    <:feliz:1402690475634458664> ┃ Para fazer uma denúncia, vamos precisar do **motivo da denúncia, autores do ocorrido e provas**.

Não crie um ticket de denúncia apenas para testar a ferramenta ou para tirar dúvidas (existem outros espaços para isso!).

Se quiser prosseguir com sua denúncia, crie um atendimento abaixo.
                `;
                break;
            case 'sugestao':
                responseMessage = '<:feliz:1402690475634458664> ┃ Para enviar uma sugestão, utilize o chat. <#1401944421565595648>';
                break;
            case 'reportarbug':
                responseMessage = `
                <:feliz:1402690475634458664> ┃ Para reportar um Bug do Servidor, atente-se as instruções:

Envie o máximo de detalhes sobre ele (incluindo descrição e fotos).

Havendo isso em mãos, crie um ticket abaixo e faça o seu envio.
                `;
                break;
            case 'outra':
                responseMessage = `
                 ⚠️ NÃO use essa aba para tirar dúvidas de Discord e etc... Existem abas comunitárias acima para te ajudar! Use-as com carinho e paciência.

<:feliz:1402690475634458664> Se você tem alguma questão extraordinária que APENAS um Staff pode lhe auxiliar, clique abaixo para criar um Ticket!
                `;
                break;
            default:
                responseMessage = 'Opção inválida selecionada.';
        }

        // Só mostrar o botão "Criar Ticket" para denúncias
        const components = [];
        if (selectedValue === 'denuncia' || selectedValue === 'reportarbug' || selectedValue === 'outra') {
            const criarTicketPersonalizado = new ButtonBuilder()
                .setCustomId(`create_ticket_${selectedValue}`)
                .setLabel('Criar Ticket')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📩');

            const btnCreateTicketRow = new ActionRowBuilder().addComponents(criarTicketPersonalizado);
            components.push(btnCreateTicketRow);
        }

        await interaction.reply({
            content: responseMessage,
            components: components,
            ephemeral: true
        });

        logger.info(`Usuário ${interaction.user.tag} selecionou categoria: ${selectedValue}`, {
            module: 'SUPPORT',
            command: 'ticket_select',
            user: interaction.user.tag,
            guild: interaction.guild?.name,
            category: selectedValue
        });

        return;
    }

    if (interaction.customId === 'create_ticket' || interaction.customId.startsWith('create_ticket_')) {
        const context = {
            module: 'SUPPORT',
            command: 'create_ticket',
            user: interaction.user.tag,
            guild: interaction.guild?.name
        };

        // Buscar configurações do banco de dados
        const ticketConfig = await TicketConfigModel.findOne({ guildId: interaction.guild.id });
        
        if (!ticketConfig || ticketConfig.categoryId === '0' || ticketConfig.supportRoleId === '0') {
            logger.error('Configurações de ticket não encontradas ou incompletas', context);
            return interaction.reply({ 
                content: '⚠️ As configurações de tickets estão incompletas! Entre em contato com um administrador.', 
                ephemeral: true 
            });
        }

        const category = interaction.guild.channels.cache.get(ticketConfig.categoryId);
        if (!category || category.type !== 4) {
            logger.error('Categoria inválida para tickets', { ...context, categoryId: ticketConfig.categoryId });
            return interaction.reply({ content: 'Categoria inválida para tickets. Entre em contato com um administrador.', ephemeral: true });
        }

        const channelName = `ticket-${interaction.user.username}`;
        const existingChannel = interaction.guild.channels.cache.find(channel => channel.name === channelName);
        if (existingChannel) {
            logger.warn(`Tentativa de criar ticket duplicado para ${interaction.user.tag}`, context);
            return interaction.reply({ content: 'Você já possui um ticket aberto.', ephemeral: true });
        }

        try {
            const ticketChannel = await interaction.guild.channels.create({
                name: channelName,
                type: 0,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.AttachFiles,
                            PermissionsBitField.Flags.ReadMessageHistory,
                        ],
                    },
                    {
                        id: ticketConfig.supportRoleId,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.AttachFiles,
                            PermissionsBitField.Flags.ReadMessageHistory,
                        ],
                    },
                ],
            });

            await interaction.reply({ content: `Ticket criado com sucesso: <#${ticketChannel.id}>`, ephemeral: true });

            logger.info(`Ticket criado com sucesso - Canal: ${ticketChannel.name}`, {
                ...context,
                channelId: ticketChannel.id
            });

            botEvent('TICKET_CREATED', `${interaction.user.username} criou ticket no canal ${ticketChannel.name}`);

            // Determinar a categoria do ticket baseada no customId
            let ticketCategory = 'Geral';
            let categoryEmoji = '📩';

            if (interaction.customId.startsWith('create_ticket_')) {
                const categoryValue = interaction.customId.replace('create_ticket_', '');
                const categoryOption = TICKET_OPTIONS.find(option => option.value === categoryValue);
                if (categoryOption) {
                    ticketCategory = categoryOption.label;
                    categoryEmoji = categoryOption.emoji;
                }
            }

            const embedTicket = new EmbedBuilder()
                .setColor(0xffffff)
                .setTitle(`${categoryEmoji} Ticket: ${ticketCategory}`)
                .setDescription(`Olá <@${interaction.user.id}>!\n\nVocê abriu um ticket na categoria: **${ticketCategory}**\n\nO suporte estará com você em breve. Para fechar esse ticket clique em 🔒`)
                .setFooter({ iconURL: client.user.displayAvatarURL({ dynamic: true }), text: `${client.user.tag} - Ticket sem confusão` })
                .setTimestamp();

            await ticketChannel.send({ embeds: [embedTicket], components: [btnCloseTicket] });

        } catch (error) {
            logger.error('Erro ao criar ticket', context, error);
            return interaction.reply({ content: 'Erro ao criar ticket. Tente novamente.', ephemeral: true });
        }
    }

    // Fechar o ticket e deletar o canal
    if (interaction.customId === 'close_ticket') {
        const context = {
            module: 'SUPPORT',
            command: 'close_ticket',
            user: interaction.user.tag,
            guild: interaction.guild?.name
        };

        const channel = interaction.channel;
        await interaction.reply({ content: 'O ticket será fechado e o canal será excluído em 5 segundos.', ephemeral: true });

        logger.info(`Ticket fechado - Canal: ${channel.name}`, {
            ...context,
            channelId: channel.id
        });

        botEvent('TICKET_CLOSED', `${interaction.user.username} fechou ticket ${channel.name}`);

        setTimeout(() => channel.delete(), 5000);
    }
});

module.exports = { ticket };
