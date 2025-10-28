const {
    ActionRowBuilder,
    ButtonBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    ButtonStyle,
    SeparatorSpacingSize,
    ContainerBuilder,
    SectionBuilder,
    ComponentType,
    AttachmentBuilder,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle,
    ModalBuilder,
    EmbedBuilder
} = require('discord.js');
const { Logger, warn, botEvent, erro, info, logger } = require('../../logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');
const ChannelModel = require('../../models/addChannel');
const onTwitchStreamersSchema = require('../../models/streamers');
const onYoutubeChannelSchema = require('../../models/youtubeChannel');
const NotificationChannelsModel = require('../../models/notificationChannels');
const TicketConfigModel = require('../../models/ticketConfig');
const path = require('path');
const { client } = require('../../Client');
const { embedRegra } = require('../../embedsDefault/embedRegra');
const { embedManutencao } = require('../../embedsDefault/embedManutencao');

async function Painel(interaction) {

    if (!interaction.isCommand()) return;

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;

    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) return;

    try {
        const imagemBot = new AttachmentBuilder(path.join(__dirname, '..', '..', '..', 'jonalandia.png'), { name: 'jonalandia.png' });

        // Constantes de paginação
        const TOTAL_PAGES = 5; // Fácil de expandir futuramente

        // Separadores reutilizáveis
        const separatorSmall = new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small });
        const separatorLarge = new SeparatorBuilder({ spacing: SeparatorSpacingSize.Large });
        const separatorLargeInvisible = new SeparatorBuilder({ spacing: SeparatorSpacingSize.Large, divider: false });
        const separatorSmallInvisible = new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: false });

        // Cabeçalho do painel (fixo em todas as páginas)
        const SectionHeader = new SectionBuilder({
            components: [
                { type: ComponentType.TextDisplay, content: '# 🛡️ Painel Jonalandia' },
                { type: ComponentType.TextDisplay, content: '### Painel de gerenciamento do bot Jonalandia.' },
            ],
            accessory: {
                type: ComponentType.Thumbnail,
                media: { url: `attachment://${imagemBot.name}` },
            },
        });

        // Seção de registro de canais (página 1)
        const SectionChannels = new SectionBuilder({
            components: [
                {
                    type: ComponentType.TextDisplay,
                    content: 'Ao clicar no botão voce registra todos os canais de texto do seu servidor ao banco de dados para o gerenciamento do bot.'
                },
            ],
            accessory: {
                type: ComponentType.Button,
                style: ButtonStyle.Success,
                custom_id: 'add_channels_db',
                label: 'Adicionar Canais',
            },
        });

        // Selects reutilizáveis
        const selectChannelMenuRole = new ChannelSelectMenuBuilder({
            customId: 'select_regra_channel',
            placeholder: 'Selecione o canal para enviar as regras',
        });
        const selectChannelRoleRow = new ActionRowBuilder({ components: [selectChannelMenuRole] });

        const selectChannelMenuMaintenance = new ChannelSelectMenuBuilder({
            customId: 'select_manutencao_channel',
            placeholder: 'Selecione o canal para enviar manutenção',
        });
        const selectChannelMaintenanceRow = new ActionRowBuilder({ components: [selectChannelMenuMaintenance] });

        const selectChannelMenuAddChannelEspecifico = new ChannelSelectMenuBuilder({
            customId: 'select_add_channel_especifico',
            placeholder: 'Selecione o canal para adicionar um canal específico',
        });
        const selectChannelMenuAddChannelEspecificoRow = new ActionRowBuilder({ components: [selectChannelMenuAddChannelEspecifico] });

        const selectChannelMenuRemoveEspecifico = new ChannelSelectMenuBuilder({
            customId: 'select_remove_channel_especifico',
            placeholder: 'Selecione o canal para remover um canal específico',
        });
        const selectChannelMenuRemoveEspecificoRow = new ActionRowBuilder({ components: [selectChannelMenuRemoveEspecifico] });

        const selectChannelMenuAddChannelNotificationTwitch = new ChannelSelectMenuBuilder({
            customId: 'select_add_channel_notification_twitch',
            placeholder: 'Selecione o canal para adicionar notificações da Twitch',
        });
        const selectChannelMenuAddChannelNotificationTwitchRow = new ActionRowBuilder({ components: [selectChannelMenuAddChannelNotificationTwitch] });

        const selectChannelMenuAddChannelNotificationYoutuber = new ChannelSelectMenuBuilder({
            customId: 'select_add_channel_notification_youtuber',
            placeholder: 'Selecione o canal para adicionar notificações do YouTube',
        });
        const selectChannelMenuAddChannelNotificationYoutuberRow = new ActionRowBuilder({ components: [selectChannelMenuAddChannelNotificationYoutuber] });

        const selectChannelMenuAddChannelNotificationFreeGames = new ChannelSelectMenuBuilder({
            customId: 'select_add_channel_notification_free_games',
            placeholder: 'Selecione o canal para adicionar notificações do Free Games',
        });
        const selectChannelMenuAddChannelNotificationFreeGamesRow = new ActionRowBuilder({ components: [selectChannelMenuAddChannelNotificationFreeGames] });

        const selectChannelMenuAddChannelNotificationWelcome = new ChannelSelectMenuBuilder({
            customId: 'select_add_channel_notification_welcome',
            placeholder: 'Selecione o canal para adicionar notificações de boas-vindas',
        });
        const selectChannelMenuAddChannelNotificationWelcomeRow = new ActionRowBuilder({ components: [selectChannelMenuAddChannelNotificationWelcome] });

        const selectChannelMenuAddChannelNotificationGoodbye = new ChannelSelectMenuBuilder({
            customId: 'select_add_channel_notification_goodbye',
            placeholder: 'Selecione o canal para adicionar notificações de despedida',
        });
        const selectChannelMenuAddChannelNotificationGoodbyeRow = new ActionRowBuilder({ components: [selectChannelMenuAddChannelNotificationGoodbye] });

        // Selects para configuração de tickets
        const selectChannelMenuTicket = new ChannelSelectMenuBuilder({
            customId: 'select_ticket_channel',
            placeholder: 'Selecione o canal para o painel de tickets',
        });
        const selectChannelMenuTicketRow = new ActionRowBuilder({ components: [selectChannelMenuTicket] });

        const selectCategoryMenuTicket = new ChannelSelectMenuBuilder({
            customId: 'select_ticket_category',
            placeholder: 'Selecione a categoria para criar os tickets',
        });
        const selectCategoryMenuTicketRow = new ActionRowBuilder({ components: [selectCategoryMenuTicket] });

        const selectRoleMenuTicketSupport = new RoleSelectMenuBuilder({
            customId: 'select_ticket_support_role',
            placeholder: 'Selecione o cargo de suporte',
        });
        const selectRoleMenuTicketSupportRow = new ActionRowBuilder({ components: [selectRoleMenuTicketSupport] });

        // Seção de streamers com botões e selects de canal (página 3)
        const SectionStreamersTwitch = new SectionBuilder({
            components: [
                { type: ComponentType.TextDisplay, content: '### Cadastrar streamer da Twitch' },
                { type: ComponentType.TextDisplay, content: 'Configure o canal de notificação e o streamer da Twitch.' },
            ],
            accessory: {
                type: ComponentType.Button,
                style: ButtonStyle.Primary,
                custom_id: 'open_modal_twitch',
                label: 'Adicionar Twitch',
            },
        });

        const SectionStreamersYoutube = new SectionBuilder({
            components: [
                { type: ComponentType.TextDisplay, content: '### Cadastrar canal do YouTube' },
                { type: ComponentType.TextDisplay, content: 'Configure o canal de notificação e o canal do YouTube.' },
            ],
            accessory: {
                type: ComponentType.Button,
                style: ButtonStyle.Danger,
                custom_id: 'open_modal_youtube',
                label: 'Adicionar YouTube',
            },
        });

        // Controles de paginação
        const buildPaginationControls = (currentPage, totalPages) => {
            const hasPrev = currentPage > 1;
            const hasNext = currentPage < totalPages;

            const prevButton = new ButtonBuilder({
                custom_id: hasPrev ? `goto_page:${currentPage - 1}` : 'goto_page:disabled_prev',
                style: ButtonStyle.Secondary,
                label: '◀',
                disabled: !hasPrev,
            });
            const nextButton = new ButtonBuilder({
                custom_id: hasNext ? `goto_page:${currentPage + 1}` : 'goto_page:disabled_next',
                style: ButtonStyle.Secondary,
                label: '▶',
                disabled: !hasNext,
            });

            const buttonsRow = new ActionRowBuilder({ components: [prevButton, nextButton] });

            return [
                new TextDisplayBuilder({ content: `Página ${currentPage}/${totalPages}` }),
                buttonsRow,
            ];
        };

        // Build do container conforme página
        const buildContainer = (page) => {
            const components = [SectionHeader, separatorSmall];

            if (page === 1) {
                components.push(
                    new TextDisplayBuilder({ content: '## 🗨️ Registro de canais' }),
                    SectionChannels,
                    separatorSmallInvisible,
                    new TextDisplayBuilder({ content: '## Adiciona um canal específico!' }),
                    new TextDisplayBuilder({ content: 'Selecione um canal específico para adicionar ao banco de dados para o gerenciamento do bot.' }),
                    selectChannelMenuAddChannelEspecificoRow,
                    separatorSmallInvisible,
                    new TextDisplayBuilder({ content: '## Remover um canal específico!' }),
                    new TextDisplayBuilder({ content: 'Selecione um canal específico para remover do banco de dados.' }),
                    selectChannelMenuRemoveEspecificoRow,
                );
            }

            if (page === 2) {
                components.push(
                    new TextDisplayBuilder({ content: '## 📦 Enviar embeds' }),
                    new TextDisplayBuilder({ content: 'Escolha um canal para enviar os embeds padrão.' }),
                    new TextDisplayBuilder({ content: '### Enviar Regras' }),
                    selectChannelRoleRow,
                    separatorSmallInvisible,
                    new TextDisplayBuilder({ content: '### Enviar Manutenção' }),
                    selectChannelMaintenanceRow,
                );
            }

            if (page === 3) {
                components.push(
                    new TextDisplayBuilder({ content: '## 🎮 Streamers' }),
                    new TextDisplayBuilder({ content: 'Adicione streamers da Twitch e canais do YouTube para receber notificações.' }),
                    separatorSmallInvisible,
                    SectionStreamersTwitch,
                    selectChannelMenuAddChannelNotificationTwitchRow,
                    separatorSmallInvisible,
                    SectionStreamersYoutube,
                    selectChannelMenuAddChannelNotificationYoutuberRow,
                );
            }

            if (page === 4) {
                components.push(
                    new TextDisplayBuilder({ content: '## 🔔 Notificações e Eventos' }),
                    new TextDisplayBuilder({ content: 'Configure os canais para notificações automáticas e eventos do servidor.' }),
                    separatorSmallInvisible,
                    new TextDisplayBuilder({ content: '### 🎮 Canal de Jogos Gratuitos' }),
                    new TextDisplayBuilder({ content: 'Receba notificações de novos jogos gratuitos disponíveis.' }),
                    selectChannelMenuAddChannelNotificationFreeGamesRow,
                    separatorSmallInvisible,
                    new TextDisplayBuilder({ content: '### 👋 Canal de Boas-vindas' }),
                    new TextDisplayBuilder({ content: 'Canal onde serão enviadas mensagens de boas-vindas para novos membros.' }),
                    selectChannelMenuAddChannelNotificationWelcomeRow,
                    separatorSmallInvisible,
                    new TextDisplayBuilder({ content: '### 👋 Canal de Despedida' }),
                    new TextDisplayBuilder({ content: 'Canal onde serão enviadas mensagens de despedida quando membros saírem.' }),
                    selectChannelMenuAddChannelNotificationGoodbyeRow,
                );
            }

            if (page === 5) {
                components.push(
                    new TextDisplayBuilder({ content: '## 🎫 Configuração de Tickets' }),
                    new TextDisplayBuilder({ content: 'Configure o sistema de tickets do servidor.' }),
                    separatorSmallInvisible,
                    new TextDisplayBuilder({ content: '### 📌 Canal do Painel de Tickets' }),
                    new TextDisplayBuilder({ content: 'Canal onde será enviado o painel para os usuários criarem tickets.' }),
                    selectChannelMenuTicketRow,
                    separatorSmallInvisible,
                    new TextDisplayBuilder({ content: '### 📁 Categoria dos Tickets' }),
                    new TextDisplayBuilder({ content: 'Categoria onde os canais de tickets serão criados.' }),
                    selectCategoryMenuTicketRow,
                    separatorSmallInvisible,
                    new TextDisplayBuilder({ content: '### 👔 Cargo de Suporte' }),
                    new TextDisplayBuilder({ content: 'Cargo que terá acesso aos tickets criados.' }),
                    selectRoleMenuTicketSupportRow,
                );
            }

            components.push(separatorLarge);
            // Controles de paginação ao final
            components.push(...buildPaginationControls(page, TOTAL_PAGES));

            return new ContainerBuilder({ accent_color: 0xffffff, components });
        };

        // Registrar listeners uma única vez por processo
        registerPainelListenersOnce();

        // Responder com a página 1 por padrão
        await interaction.reply({
            flags: ["IsComponentsV2"],
            components: [buildContainer(1)],
            files: [imagemBot],
        });

    } catch (error) {
        Logger.error(`Erro ao executar o comando Painel: ${error}`);
        await interaction.reply({
            content: 'Ocorreu um erro ao executar o comando.',
            flags: [64]
        });
    }


}

// Controle de registro de listeners para evitar múltiplas inscrições
let painelListenersRegistered = false;

function registerPainelListenersOnce() {
    if (painelListenersRegistered) return;
    painelListenersRegistered = true;

    // Aumenta o limite de listeners para evitar o warning
    client.setMaxListeners(20);

    // Handler unificado para todas as interações do painel
    client.on('interactionCreate', async (interaction) => {
        try {
            // Select de regras
            if (interaction.isChannelSelectMenu() && interaction.customId === 'select_regra_channel') {
                const channelId = interaction.values[0];
                const channel = interaction.guild.channels.cache.get(channelId);
                if (channel) {
                    await channel.send({ embeds: [embedRegra()] });
                }

                await interaction.reply({
                    content: `Mensagem de regras enviada para o canal <#${channelId}> com sucesso!`,
                    flags: [64],
                });
                return;
            }

            // Select de manutenção
            if (interaction.isChannelSelectMenu() && interaction.customId === 'select_manutencao_channel') {
                const channelId = interaction.values[0];
                const channel = interaction.guild.channels.cache.get(channelId);
                if (channel) {
                    await channel.send({ embeds: [embedManutencao()] });
                }

                await interaction.reply({
                    content: `Mensagem de manutenção enviada para o canal <#${channelId}> com sucesso!`,
                    flags: [64],
                });
                return;
            }

            // Botão de adicionar todos os canais
            if (interaction.isButton() && interaction.customId === 'add_channels_db') {
                await interaction.deferReply({ flags: [64] });

                const guild = interaction.guild;
                const textChannels = guild.channels.cache.filter(channel => channel.type === 0); // Apenas canais de texto
                const channelsToAdd = textChannels.map(channel => ({
                    channelId: channel.id,
                    guildId: guild.id,
                    channelName: channel.name,
                    channelType: channel.type,
                    guildName: channel.guild.name,
                }));

                await ChannelModel.insertMany(channelsToAdd, { ordered: false }).catch(err => {
                    if (err.code !== 11000) throw err; // Ignora duplicados
                });

                // verifica se todos os canais foram adicionados
                const addedChannels = await ChannelModel.find({ guildId: guild.id });
                if (addedChannels.length !== textChannels.size) {
                    Logger.warn(`Nem todos os canais foram adicionados ao banco de dados. Esperado: ${textChannels.size}, Adicionado: ${addedChannels.length}`);
                }

                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('Canais Adicionados')
                    .setDescription(`Foram adicionados ${textChannels.size} canais de texto ao banco de dados.`)
                    .setTimestamp();

                await interaction.editReply({
                    embeds: [embed],
                });
                return;
            }

            // select para adicionar canal específico
            if (interaction.isChannelSelectMenu() && interaction.customId === 'select_add_channel_especifico') {
                await interaction.deferReply({ flags: [64] });
                const guild = interaction.guild;
                const channelId = interaction.values[0];
                const specificChannel = guild.channels.cache.get(channelId);
                if (!specificChannel || specificChannel.type !== 0) {
                    await interaction.editReply('Por favor, selecione um canal de texto válido.');
                    Logger.warn(`Tentativa de registrar canal inválido: ${specificChannel ? specificChannel.id : 'Nenhum canal selecionado'}`);
                    return;
                }
                const channelData = {
                    channelId: specificChannel.id,
                    guildId: guild.id,
                    channelName: specificChannel.name,
                    channelType: specificChannel.type,
                    guildName: specificChannel.guild.name,
                };
                await ChannelModel.create(channelData).catch(err => {
                    if (err.code === 11000) {
                        interaction.editReply("Este canal já está registrado.");
                        Logger.warn(`Tentativa de registrar canal já existente: ${specificChannel.id}`);
                        return;
                    }
                });

                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('Canal Adicionado')
                    .setDescription(`O canal <#${specificChannel.id}> foi adicionado ao banco de dados.`)
                    .setTimestamp();

                await interaction.editReply({
                    embeds: [embed],
                });
                return;
            }

            // select para remover canal específico
            if (interaction.isChannelSelectMenu() && interaction.customId === 'select_remove_channel_especifico') {
                await interaction.deferReply({ flags: [64] });
                const guild = interaction.guild;
                const channelId = interaction.values[0];
                const specificChannel = guild.channels.cache.get(channelId);
                if (!specificChannel || specificChannel.type !== 0) {
                    await interaction.editReply('Por favor, selecione um canal de texto válido.');
                    Logger.warn(`Tentativa de remover canal inválido: ${specificChannel ? specificChannel.id : 'Nenhum canal selecionado'}`);
                    return;
                }
                const deleteResult = await ChannelModel.deleteOne({ channelId: specificChannel.id, guildId: guild.id });
                if (deleteResult.deletedCount === 0) {
                    await interaction.editReply("Este canal não está registrado no banco de dados.");
                    Logger.warn(`Tentativa de remover canal não existente: ${specificChannel.id}`);
                    return;
                }
                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('Canal Removido')
                    .setDescription(`O canal <#${specificChannel.id}> foi removido do banco de dados.`)
                    .setTimestamp();
                await interaction.editReply({
                    embeds: [embed],
                });
                return;
            }

            // select para adicionar canal de notificação Twitch
            if (interaction.isChannelSelectMenu() && interaction.customId === 'select_add_channel_notification_twitch') {
                await interaction.deferReply({ flags: [64] });
                const guild = interaction.guild;
                const channelId = interaction.values[0];
                const selectedChannel = guild.channels.cache.get(channelId);

                if (!selectedChannel || selectedChannel.type !== 0) {
                    await interaction.editReply('Por favor, selecione um canal de texto válido.');
                    Logger.warn(`Tentativa de registrar canal de notificação Twitch inválido: ${selectedChannel ? selectedChannel.id : 'Nenhum canal selecionado'}`);
                    return;
                }

                try {
                    // Atualiza ou cria o canal de notificação Twitch
                    await NotificationChannelsModel.findOneAndUpdate(
                        { guildId: guild.id, notificationType: 'twitch' },
                        {
                            channelId: selectedChannel.id,
                            channelName: selectedChannel.name,
                            guildId: guild.id,
                            notificationType: 'twitch'
                        },
                        { upsert: true, new: true }
                    );

                    const embed = new EmbedBuilder()
                        .setColor('Purple')
                        .setTitle('Canal de Notificação Twitch Configurado')
                        .setDescription(`O canal <#${selectedChannel.id}> foi configurado para receber notificações da Twitch.`)
                        .setTimestamp();

                    await interaction.editReply({ embeds: [embed] });
                    Logger.info(`Canal de notificação Twitch configurado: ${selectedChannel.id} (${selectedChannel.name})`);
                } catch (error) {
                    Logger.error(`Erro ao configurar canal de notificação Twitch: ${error}`);
                    await interaction.editReply('Ocorreu um erro ao configurar o canal de notificação.');
                }
                return;
            }

            // select para adicionar canal de notificação YouTube
            if (interaction.isChannelSelectMenu() && interaction.customId === 'select_add_channel_notification_youtuber') {
                await interaction.deferReply({ flags: [64] });
                const guild = interaction.guild;
                const channelId = interaction.values[0];
                const selectedChannel = guild.channels.cache.get(channelId);

                if (!selectedChannel || selectedChannel.type !== 0) {
                    await interaction.editReply('Por favor, selecione um canal de texto válido.');
                    Logger.warn(`Tentativa de registrar canal de notificação YouTube inválido: ${selectedChannel ? selectedChannel.id : 'Nenhum canal selecionado'}`);
                    return;
                }

                try {
                    // Atualiza ou cria o canal de notificação YouTube
                    await NotificationChannelsModel.findOneAndUpdate(
                        { guildId: guild.id, notificationType: 'youtube' },
                        {
                            channelId: selectedChannel.id,
                            channelName: selectedChannel.name,
                            guildId: guild.id,
                            notificationType: 'youtube'
                        },
                        { upsert: true, new: true }
                    );

                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle('Canal de Notificação YouTube Configurado')
                        .setDescription(`O canal <#${selectedChannel.id}> foi configurado para receber notificações do YouTube.`)
                        .setTimestamp();

                    await interaction.editReply({ embeds: [embed] });
                    Logger.info(`Canal de notificação YouTube configurado: ${selectedChannel.id} (${selectedChannel.name})`);
                } catch (error) {
                    Logger.error(`Erro ao configurar canal de notificação YouTube: ${error}`);
                    await interaction.editReply('Ocorreu um erro ao configurar o canal de notificação.');
                }
                return;
            }

            // select para adicionar canal de notificação Free Games
            if (interaction.isChannelSelectMenu() && interaction.customId === 'select_add_channel_notification_free_games') {
                await interaction.deferReply({ flags: [64] });
                const guild = interaction.guild;
                const channelId = interaction.values[0];
                const selectedChannel = guild.channels.cache.get(channelId);

                if (!selectedChannel || selectedChannel.type !== 0) {
                    await interaction.editReply('Por favor, selecione um canal de texto válido.');
                    Logger.warn(`Tentativa de registrar canal de notificação Free Games inválido: ${selectedChannel ? selectedChannel.id : 'Nenhum canal selecionado'}`);
                    return;
                }

                try {
                    // Atualiza ou cria o canal de notificação Free Games
                    await NotificationChannelsModel.findOneAndUpdate(
                        { guildId: guild.id, notificationType: 'free_games' },
                        {
                            channelId: selectedChannel.id,
                            channelName: selectedChannel.name,
                            guildId: guild.id,
                            notificationType: 'free_games'
                        },
                        { upsert: true, new: true }
                    );

                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setTitle('Canal de Notificação de Jogos Gratuitos Configurado')
                        .setDescription(`O canal <#${selectedChannel.id}> foi configurado para receber notificações de jogos gratuitos.`)
                        .setTimestamp();

                    await interaction.editReply({ embeds: [embed] });
                    Logger.info(`Canal de notificação Free Games configurado: ${selectedChannel.id} (${selectedChannel.name})`);
                } catch (error) {
                    Logger.error(`Erro ao configurar canal de notificação Free Games: ${error}`);
                    await interaction.editReply('Ocorreu um erro ao configurar o canal de notificação.');
                }
                return;
            }

            // select para adicionar canal de notificação Welcome
            if (interaction.isChannelSelectMenu() && interaction.customId === 'select_add_channel_notification_welcome') {
                await interaction.deferReply({ flags: [64] });
                const guild = interaction.guild;
                const channelId = interaction.values[0];
                const selectedChannel = guild.channels.cache.get(channelId);

                if (!selectedChannel || selectedChannel.type !== 0) {
                    await interaction.editReply('Por favor, selecione um canal de texto válido.');
                    Logger.warn(`Tentativa de registrar canal de notificação Welcome inválido: ${selectedChannel ? selectedChannel.id : 'Nenhum canal selecionado'}`);
                    return;
                }

                try {
                    // Atualiza ou cria o canal de notificação Welcome
                    await NotificationChannelsModel.findOneAndUpdate(
                        { guildId: guild.id, notificationType: 'welcome' },
                        {
                            channelId: selectedChannel.id,
                            channelName: selectedChannel.name,
                            guildId: guild.id,
                            notificationType: 'welcome'
                        },
                        { upsert: true, new: true }
                    );

                    const embed = new EmbedBuilder()
                        .setColor('Blue')
                        .setTitle('Canal de Boas-vindas Configurado')
                        .setDescription(`O canal <#${selectedChannel.id}> foi configurado para receber mensagens de boas-vindas.`)
                        .setTimestamp();

                    await interaction.editReply({ embeds: [embed] });
                    Logger.info(`Canal de notificação Welcome configurado: ${selectedChannel.id} (${selectedChannel.name})`);
                } catch (error) {
                    Logger.error(`Erro ao configurar canal de notificação Welcome: ${error}`);
                    await interaction.editReply('Ocorreu um erro ao configurar o canal de notificação.');
                }
                return;
            }

            // select para adicionar canal de notificação Goodbye
            if (interaction.isChannelSelectMenu() && interaction.customId === 'select_add_channel_notification_goodbye') {
                await interaction.deferReply({ flags: [64] });
                const guild = interaction.guild;
                const channelId = interaction.values[0];
                const selectedChannel = guild.channels.cache.get(channelId);

                if (!selectedChannel || selectedChannel.type !== 0) {
                    await interaction.editReply('Por favor, selecione um canal de texto válido.');
                    Logger.warn(`Tentativa de registrar canal de notificação Goodbye inválido: ${selectedChannel ? selectedChannel.id : 'Nenhum canal selecionado'}`);
                    return;
                }

                try {
                    // Atualiza ou cria o canal de notificação Goodbye
                    await NotificationChannelsModel.findOneAndUpdate(
                        { guildId: guild.id, notificationType: 'goodbye' },
                        {
                            channelId: selectedChannel.id,
                            channelName: selectedChannel.name,
                            guildId: guild.id,
                            notificationType: 'goodbye'
                        },
                        { upsert: true, new: true }
                    );

                    const embed = new EmbedBuilder()
                        .setColor('Orange')
                        .setTitle('Canal de Despedida Configurado')
                        .setDescription(`O canal <#${selectedChannel.id}> foi configurado para receber mensagens de despedida.`)
                        .setTimestamp();

                    await interaction.editReply({ embeds: [embed] });
                    Logger.info(`Canal de notificação Goodbye configurado: ${selectedChannel.id} (${selectedChannel.name})`);
                } catch (error) {
                    Logger.error(`Erro ao configurar canal de notificação Goodbye: ${error}`);
                    await interaction.editReply('Ocorreu um erro ao configurar o canal de notificação.');
                }
                return;
            }

            // select para configurar canal do painel de tickets
            if (interaction.isChannelSelectMenu() && interaction.customId === 'select_ticket_channel') {
                await interaction.deferReply({ flags: [64] });
                const guild = interaction.guild;
                const channelId = interaction.values[0];
                const selectedChannel = guild.channels.cache.get(channelId);

                if (!selectedChannel || selectedChannel.type !== 0) {
                    await interaction.editReply('Por favor, selecione um canal de texto válido.');
                    Logger.warn(`Tentativa de registrar canal de ticket inválido: ${selectedChannel ? selectedChannel.id : 'Nenhum canal selecionado'}`);
                    return;
                }

                try {
                    // Busca ou cria a configuração do ticket
                    let ticketConfig = await TicketConfigModel.findOne({ guildId: guild.id });
                    
                    if (!ticketConfig) {
                        ticketConfig = new TicketConfigModel({
                            guildId: guild.id,
                            channelId: selectedChannel.id,
                            categoryId: '0', // Valor padrão até ser configurado
                            supportRoleId: '0' // Valor padrão até ser configurado
                        });
                    } else {
                        ticketConfig.channelId = selectedChannel.id;
                    }
                    
                    await ticketConfig.save();

                    const embed = new EmbedBuilder()
                        .setColor('Blue')
                        .setTitle('Canal do Painel de Tickets Configurado')
                        .setDescription(`O canal <#${selectedChannel.id}> foi configurado para o painel de tickets.`)
                        .setTimestamp();

                    await interaction.editReply({ embeds: [embed] });
                    Logger.info(`Canal do painel de tickets configurado: ${selectedChannel.id} (${selectedChannel.name})`);
                } catch (error) {
                    Logger.error(`Erro ao configurar canal do painel de tickets: ${error}`);
                    await interaction.editReply('Ocorreu um erro ao configurar o canal do painel de tickets.');
                }
                return;
            }

            // select para configurar categoria dos tickets
            if (interaction.isChannelSelectMenu() && interaction.customId === 'select_ticket_category') {
                await interaction.deferReply({ flags: [64] });
                const guild = interaction.guild;
                const categoryId = interaction.values[0];
                const selectedCategory = guild.channels.cache.get(categoryId);

                if (!selectedCategory || selectedCategory.type !== 4) {
                    await interaction.editReply('Por favor, selecione uma categoria válida.');
                    Logger.warn(`Tentativa de registrar categoria de ticket inválida: ${selectedCategory ? selectedCategory.id : 'Nenhuma categoria selecionada'}`);
                    return;
                }

                try {
                    // Busca ou cria a configuração do ticket
                    let ticketConfig = await TicketConfigModel.findOne({ guildId: guild.id });
                    
                    if (!ticketConfig) {
                        ticketConfig = new TicketConfigModel({
                            guildId: guild.id,
                            channelId: '0', // Valor padrão até ser configurado
                            categoryId: selectedCategory.id,
                            supportRoleId: '0' // Valor padrão até ser configurado
                        });
                    } else {
                        ticketConfig.categoryId = selectedCategory.id;
                    }
                    
                    await ticketConfig.save();

                    const embed = new EmbedBuilder()
                        .setColor('Purple')
                        .setTitle('Categoria dos Tickets Configurada')
                        .setDescription(`A categoria **${selectedCategory.name}** foi configurada para criar os tickets.`)
                        .setTimestamp();

                    await interaction.editReply({ embeds: [embed] });
                    Logger.info(`Categoria dos tickets configurada: ${selectedCategory.id} (${selectedCategory.name})`);
                } catch (error) {
                    Logger.error(`Erro ao configurar categoria dos tickets: ${error}`);
                    await interaction.editReply('Ocorreu um erro ao configurar a categoria dos tickets.');
                }
                return;
            }

            // select para configurar cargo de suporte
            if (interaction.isRoleSelectMenu() && interaction.customId === 'select_ticket_support_role') {
                await interaction.deferReply({ flags: [64] });
                const guild = interaction.guild;
                const roleId = interaction.values[0];
                const selectedRole = guild.roles.cache.get(roleId);

                if (!selectedRole) {
                    await interaction.editReply('Por favor, selecione um cargo válido.');
                    Logger.warn(`Tentativa de registrar cargo de suporte inválido: ${roleId}`);
                    return;
                }

                try {
                    // Busca ou cria a configuração do ticket
                    let ticketConfig = await TicketConfigModel.findOne({ guildId: guild.id });
                    
                    if (!ticketConfig) {
                        ticketConfig = new TicketConfigModel({
                            guildId: guild.id,
                            channelId: '0', // Valor padrão até ser configurado
                            categoryId: '0', // Valor padrão até ser configurado
                            supportRoleId: selectedRole.id
                        });
                    } else {
                        ticketConfig.supportRoleId = selectedRole.id;
                    }
                    
                    await ticketConfig.save();

                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setTitle('Cargo de Suporte Configurado')
                        .setDescription(`O cargo <@&${selectedRole.id}> foi configurado para ter acesso aos tickets.`)
                        .setTimestamp();

                    await interaction.editReply({ embeds: [embed] });
                    Logger.info(`Cargo de suporte configurado: ${selectedRole.id} (${selectedRole.name})`);
                } catch (error) {
                    Logger.error(`Erro ao configurar cargo de suporte: ${error}`);
                    await interaction.editReply('Ocorreu um erro ao configurar o cargo de suporte.');
                }
                return;
            }

            // Navegação por botões de página
            if (interaction.isButton() && interaction.customId.startsWith('goto_page:')) {
                const pageStr = interaction.customId.split(':')[1];
                const targetPage = parseInt(pageStr, 10);
                if (isNaN(targetPage)) return;

                // Reconstroi o container na página solicitada
                // Reconstroi o container na página solicitada
                const imagemBot = new AttachmentBuilder(path.join(__dirname, '..', '..', '..', 'jonalandia.png'), { name: 'jonalandia.png' });

                // Funções auxiliares replicadas de escopo acima (mínimo necessário)
                const TOTAL_PAGES = 5;
                const separatorSmall = new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small });
                const separatorLarge = new SeparatorBuilder({ spacing: SeparatorSpacingSize.Large });
                const separatorLargeInvisible = new SeparatorBuilder({ spacing: SeparatorSpacingSize.Large, divider: false });
                const separatorSmallInvisible = new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: false });

                const SectionHeader = new SectionBuilder({
                    components: [
                        { type: ComponentType.TextDisplay, content: '# 🛡️ Painel Jonalandia' },
                        { type: ComponentType.TextDisplay, content: '### Painel de gerenciamento do bot Jonalandia.' },
                    ],
                    accessory: { type: ComponentType.Thumbnail, media: { url: `attachment://${imagemBot.name}` } },
                });

                const SectionChannels = new SectionBuilder({
                    components: [
                        { type: ComponentType.TextDisplay, content: '## Registro de canais!' },
                        { type: ComponentType.TextDisplay, content: 'Ao clicar no botão voce registra todos os canais de texto do seu servidor ao banco de dados para o gerenciamento do bot.' },
                    ],
                    accessory: { type: ComponentType.Button, style: ButtonStyle.Success, custom_id: 'add_channels_db', label: 'Adicionar Canais' },
                });

                const selectChannelMenuRole = new ChannelSelectMenuBuilder({ customId: 'select_regra_channel', placeholder: 'Selecione o canal para enviar as regras' });
                const selectChannelRoleRow = new ActionRowBuilder({ components: [selectChannelMenuRole] });
                const selectChannelMenuMaintenance = new ChannelSelectMenuBuilder({ customId: 'select_manutencao_channel', placeholder: 'Selecione o canal para enviar manutenção' });
                const selectChannelMaintenanceRow = new ActionRowBuilder({ components: [selectChannelMenuMaintenance] });
                const selectChannelMenuAddChannelEspecifico = new ChannelSelectMenuBuilder({ customId: 'select_add_channel_especifico', placeholder: 'Selecione o canal para adicionar um canal específico' });
                const selectChannelMenuAddChannelEspecificoRow = new ActionRowBuilder({ components: [selectChannelMenuAddChannelEspecifico] });
                const selectChannelMenuRemoveEspecifico = new ChannelSelectMenuBuilder({ customId: 'select_remove_channel_especifico', placeholder: 'Selecione o canal para remover um canal específico' });
                const selectChannelMenuRemoveEspecificoRow = new ActionRowBuilder({ components: [selectChannelMenuRemoveEspecifico] });
                const selectChannelMenuAddChannelNotificationTwitch = new ChannelSelectMenuBuilder({ customId: 'select_add_channel_notification_twitch', placeholder: 'Selecione o canal notificações da Twitch' });
                const selectChannelMenuAddChannelNotificationTwitchRow = new ActionRowBuilder({ components: [selectChannelMenuAddChannelNotificationTwitch] });
                const selectChannelMenuAddChannelNotificationYoutuber = new ChannelSelectMenuBuilder({ customId: 'select_add_channel_notification_youtuber', placeholder: 'Selecione o canal notificações do YouTube', });
                const selectChannelMenuAddChannelNotificationYoutuberRow = new ActionRowBuilder({ components: [selectChannelMenuAddChannelNotificationYoutuber] });

                const selectChannelMenuAddChannelNotificationFreeGames = new ChannelSelectMenuBuilder({ customId: 'select_add_channel_notification_free_games', placeholder: 'Selecione o canal para jogos gratuitos' });
                const selectChannelMenuAddChannelNotificationFreeGamesRow = new ActionRowBuilder({ components: [selectChannelMenuAddChannelNotificationFreeGames] });

                const selectChannelMenuAddChannelNotificationWelcome = new ChannelSelectMenuBuilder({ customId: 'select_add_channel_notification_welcome', placeholder: 'Selecione o canal de boas-vindas' });
                const selectChannelMenuAddChannelNotificationWelcomeRow = new ActionRowBuilder({ components: [selectChannelMenuAddChannelNotificationWelcome] });

                const selectChannelMenuAddChannelNotificationGoodbye = new ChannelSelectMenuBuilder({ customId: 'select_add_channel_notification_goodbye', placeholder: 'Selecione o canal de despedida' });
                const selectChannelMenuAddChannelNotificationGoodbyeRow = new ActionRowBuilder({ components: [selectChannelMenuAddChannelNotificationGoodbye] });

                // Selects para configuração de tickets
                const selectChannelMenuTicket = new ChannelSelectMenuBuilder({ customId: 'select_ticket_channel', placeholder: 'Selecione o canal para o painel de tickets' });
                const selectChannelMenuTicketRow = new ActionRowBuilder({ components: [selectChannelMenuTicket] });

                const selectCategoryMenuTicket = new ChannelSelectMenuBuilder({ customId: 'select_ticket_category', placeholder: 'Selecione a categoria para criar os tickets' });
                const selectCategoryMenuTicketRow = new ActionRowBuilder({ components: [selectCategoryMenuTicket] });

                const selectRoleMenuTicketSupport = new RoleSelectMenuBuilder({ customId: 'select_ticket_support_role', placeholder: 'Selecione o cargo de suporte' });
                const selectRoleMenuTicketSupportRow = new ActionRowBuilder({ components: [selectRoleMenuTicketSupport] });

                const SectionStreamersTwitch = new SectionBuilder({
                    components: [
                        { type: ComponentType.TextDisplay, content: '### Cadastrar streamer da Twitch' },
                        { type: ComponentType.TextDisplay, content: 'Configure o canal de notificação e o streamer da Twitch.' },
                    ],
                    accessory: {
                        type: ComponentType.Button,
                        style: ButtonStyle.Primary,
                        custom_id: 'open_modal_twitch',
                        label: 'Adicionar Twitch',
                    },
                });

                const SectionStreamersYoutube = new SectionBuilder({
                    components: [
                        { type: ComponentType.TextDisplay, content: '### Cadastrar canal do YouTube' },
                        { type: ComponentType.TextDisplay, content: 'Configure o canal de notificação e o canal do YouTube.' },
                    ],
                    accessory: {
                        type: ComponentType.Button,
                        style: ButtonStyle.Danger,
                        custom_id: 'open_modal_youtube',
                        label: 'Adicionar YouTube',
                    },
                });

                const buildPaginationControls = (currentPage, totalPages) => {
                    const hasPrev = currentPage > 1;
                    const hasNext = currentPage < totalPages;
                    const prevButton = new ButtonBuilder({ custom_id: hasPrev ? `goto_page:${currentPage - 1}` : 'goto_page:disabled_prev', style: ButtonStyle.Secondary, label: '◀', disabled: !hasPrev });
                    const nextButton = new ButtonBuilder({ custom_id: hasNext ? `goto_page:${currentPage + 1}` : 'goto_page:disabled_next', style: ButtonStyle.Secondary, label: '▶', disabled: !hasNext });

                    const buttonsRow = new ActionRowBuilder({ components: [prevButton, nextButton] });
                    return [new TextDisplayBuilder({ content: `Página ${currentPage}/${totalPages}` }), buttonsRow];
                };

                const buildContainer = (page) => {
                    const components = [SectionHeader, separatorSmall];
                    if (page === 1) {
                        components.push(
                            new TextDisplayBuilder({ content: '## 🗨️ Canais' }),
                            SectionChannels,
                            separatorSmallInvisible,
                            new TextDisplayBuilder({ content: '## Adiciona um canal específico!' }),
                            new TextDisplayBuilder({ content: 'Selecione um canal específico para adicionar ao banco de dados para o gerenciamento do bot.' }),
                            selectChannelMenuAddChannelEspecificoRow,
                            separatorSmallInvisible,
                            new TextDisplayBuilder({ content: '## Remover um canal específico!' }),
                            new TextDisplayBuilder({ content: 'Selecione um canal específico para remover do banco de dados.' }),
                            selectChannelMenuRemoveEspecificoRow,
                        );
                    }

                    if (page === 2) {
                        components.push(
                            new TextDisplayBuilder({ content: '## 📦 Enviar embeds' }),
                            new TextDisplayBuilder({ content: 'Escolha um canal para enviar os embeds padrão.' }),
                            new TextDisplayBuilder({ content: '### Enviar Regras' }),
                            selectChannelRoleRow,
                            separatorSmallInvisible,
                            new TextDisplayBuilder({ content: '### Enviar Manutenção' }),
                            selectChannelMaintenanceRow,
                        );
                    }

                    if (page === 3) {
                        components.push(
                            new TextDisplayBuilder({ content: '## 🎮 Streamers' }),
                            new TextDisplayBuilder({ content: 'Adicione streamers da Twitch e canais do YouTube para receber notificações.' }),
                            separatorSmallInvisible,
                            SectionStreamersTwitch,
                            selectChannelMenuAddChannelNotificationTwitchRow,
                            separatorSmallInvisible,
                            SectionStreamersYoutube,
                            selectChannelMenuAddChannelNotificationYoutuberRow,
                        );
                    }

                    if (page === 4) {
                        components.push(
                            new TextDisplayBuilder({ content: '## 🔔 Notificações e Eventos' }),
                            new TextDisplayBuilder({ content: 'Configure os canais para notificações automáticas e eventos do servidor.' }),
                            separatorSmallInvisible,
                            new TextDisplayBuilder({ content: '### 🎮 Canal de Jogos Gratuitos' }),
                            new TextDisplayBuilder({ content: 'Receba notificações de novos jogos gratuitos disponíveis.' }),
                            selectChannelMenuAddChannelNotificationFreeGamesRow,
                            separatorSmallInvisible,
                            new TextDisplayBuilder({ content: '### 👋 Canal de Boas-vindas' }),
                            new TextDisplayBuilder({ content: 'Canal onde serão enviadas mensagens de boas-vindas para novos membros.' }),
                            selectChannelMenuAddChannelNotificationWelcomeRow,
                            separatorSmallInvisible,
                            new TextDisplayBuilder({ content: '### 👋 Canal de Despedida' }),
                            new TextDisplayBuilder({ content: 'Canal onde serão enviadas mensagens de despedida quando membros saírem.' }),
                            selectChannelMenuAddChannelNotificationGoodbyeRow,
                        );
                    }

                    if (page === 5) {
                        components.push(
                            new TextDisplayBuilder({ content: '## 🎫 Configuração de Tickets' }),
                            new TextDisplayBuilder({ content: 'Configure o sistema de tickets do servidor.' }),
                            separatorSmallInvisible,
                            new TextDisplayBuilder({ content: '### 📌 Canal do Painel de Tickets' }),
                            new TextDisplayBuilder({ content: 'Canal onde será enviado o painel para os usuários criarem tickets.' }),
                            selectChannelMenuTicketRow,
                            separatorSmallInvisible,
                            new TextDisplayBuilder({ content: '### 📁 Categoria dos Tickets' }),
                            new TextDisplayBuilder({ content: 'Categoria onde os canais de tickets serão criados.' }),
                            selectCategoryMenuTicketRow,
                            separatorSmallInvisible,
                            new TextDisplayBuilder({ content: '### 👔 Cargo de Suporte' }),
                            new TextDisplayBuilder({ content: 'Cargo que terá acesso aos tickets criados.' }),
                            selectRoleMenuTicketSupportRow,
                        );
                    }

                    components.push(separatorLarge);
                    components.push(...buildPaginationControls(page, TOTAL_PAGES));
                    return new ContainerBuilder({ accent_color: 0xffffff, components });
                };

                await interaction.update({ components: [buildContainer(targetPage)] });
                return;
            }

            // Listener para abrir modal Twitch
            if (interaction.isButton() && interaction.customId === 'open_modal_twitch') {
                const modal = new ModalBuilder()
                    .setCustomId('modal_add_twitch')
                    .setTitle('Adicionar Streamer Twitch');

                const streamerNameInput = new TextInputBuilder()
                    .setCustomId('twitch_streamer_name')
                    .setLabel('Nome do streamer na Twitch')
                    .setPlaceholder('Ex: gaules')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const row1 = new ActionRowBuilder().addComponents(streamerNameInput);
                modal.addComponents(row1);

                await interaction.showModal(modal);
                return;
            }

            // Listener para abrir modal YouTube
            if (interaction.isButton() && interaction.customId === 'open_modal_youtube') {
                const modal = new ModalBuilder()
                    .setCustomId('modal_add_youtube')
                    .setTitle('Adicionar Canal YouTube');

                const channelNameInput = new TextInputBuilder()
                    .setCustomId('youtube_channel_name')
                    .setLabel('Nome/ID do canal no YouTube')
                    .setPlaceholder('Ex: @CanalExemplo ou UCxxxxx')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const row1 = new ActionRowBuilder().addComponents(channelNameInput);
                modal.addComponents(row1);

                await interaction.showModal(modal);
                return;
            }

            // Listener para processar modal Twitch
            if (interaction.isModalSubmit() && interaction.customId === 'modal_add_twitch') {
                const streamerName = interaction.fields.getTextInputValue('twitch_streamer_name');

                const existingStreamer = await onTwitchStreamersSchema.findOne({ name: streamerName });
                if (existingStreamer) {
                    warn(`O streamer ${existingStreamer.name} já está cadastrado no banco de dados.`);
                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setAuthor({
                            name: client.user.username,
                            iconURL: client.user.displayAvatarURL({ dynamic: true }),
                        })
                        .setTitle('Streamer já cadastrado')
                        .setDescription(`O streamer ${existingStreamer.name} já está cadastrado no banco de dados.`)
                        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                        .setTimestamp()
                        .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const newStreamer = {
                    name: streamerName,
                }

                await onTwitchStreamersSchema.create(newStreamer);

                const embed = new EmbedBuilder()
                    .setColor('#ffffff')
                    .setAuthor({
                        name: client.user.username,
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    })
                    .setTitle('Streamer cadastrado com sucesso.')
                    .setDescription(`Streamer: ${streamerName}`)
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
                await interaction.reply({ embeds: [embed], ephemeral: true });

                await interaction.reply({
                    content: `✅ Streamer **${streamerName}** da Twitch adicionado com sucesso!`,
                    flags: [64],
                });

                Logger.info(`Streamer Twitch adicionado: ${streamerName}`);
                return;
            }

            // Listener para processar modal YouTube
            if (interaction.isModalSubmit() && interaction.customId === 'modal_add_youtube') {
                const channelName = interaction.fields.getTextInputValue('youtube_channel_name');

                const existingChannel = await onYoutubeChannelSchema.findOne({ name: channelName });
                if (existingChannel) {
                    warn(`O canal ${channelName} já está cadastrado no banco de dados.`);

                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setAuthor({
                            name: client.user.username,
                            iconURL: client.user.displayAvatarURL({ dynamic: true }),
                        })
                        .setTitle('Canal já cadastrado')
                        .setDescription(`O canal ${channelName} já está cadastrado no banco de dados.`)
                        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                        .setTimestamp()
                        .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                // Aqui você pode adicionar a lógica para salvar no banco de dados
                // Por exemplo: await saveChannelYouTube(channelName, interaction.guild.id);

                const newStreamer = {
                    name: channelName,
                }
                await onYoutubeChannelSchema.create(newStreamer);

                const embed = new EmbedBuilder()
                    .setColor('#ffffff')
                    .setAuthor({
                        name: client.user.username,
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    })
                    .setTitle('Canal cadastrado com sucesso.')
                    .setDescription(`Canal: ${channelName}`)
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
                await interaction.reply({ embeds: [embed], ephemeral: true });

                await interaction.reply({
                    content: `✅ Canal **${channelName}** do YouTube adicionado com sucesso!`,
                    flags: [64],
                });

                Logger.info(`Canal YouTube adicionado: ${channelName}`);
                return;
            }

        } catch (err) {
            Logger.error(`Erro no handler de interações do painel: ${err}`);
        }
    });
}

module.exports = { Painel };
