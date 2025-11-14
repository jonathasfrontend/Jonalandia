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
  EmbedBuilder,
} = require('discord.js');
const { Logger } = require('../../logger');
const {
  checkingComandChannelBlocked,
  checkingComandExecuntionModerador,
} = require('../../utils/checkingComandsExecution');
const ChannelModel = require('../../database/models/addChannel');
const onTwitchStreamersSchema = require('../../database/models/streamers');
const onYoutubeChannelSchema = require('../../database/models/youtubeChannel');
const NotificationChannelsModel = require('../../database/models/notificationChannels');
const TicketConfigModel = require('../../database/models/ticketConfig');
const RolePermissionsModel = require('../../database/models/rolePermissions');
const path = require('path');
const { client } = require('../../Client');
const { embedRegra } = require('../../embedsDefault/embedRegra');
const { embedManutencao } = require('../../embedsDefault/embedManutencao');

// =====================================================
// CONFIGURAÇÕES E CONSTANTES
// =====================================================

const PANEL_CONFIG = {
  TOTAL_PAGES: 6,
  IMAGE_PATH: path.join(__dirname, '..', '..', '..', 'jonalandia.png'),
  IMAGE_NAME: 'jonalandia.png',
  ACCENT_COLOR: 0xffffff,
  MAX_LISTENERS: 20,
};

const EMBED_COLORS = {
  SUCCESS: 'Green',
  ERROR: 'Red',
  INFO: 'Blue',
  WARNING: 'Orange',
  TWITCH: 'Purple',
  YOUTUBE: 'Red',
};

// Variável de controle para registro único de listeners
let painelListenersRegistered = false;

// =====================================================
// FACTORY: CRIAÇÃO DE COMPONENTES REUTILIZÁVEIS
// =====================================================

/**
 * Cria separadores reutilizáveis para economia de memória
 */
const createSeparators = () => ({
  small: new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small }),
  large: new SeparatorBuilder({ spacing: SeparatorSpacingSize.Large }),
  smallInvisible: new SeparatorBuilder({
    spacing: SeparatorSpacingSize.Small,
    divider: false,
  }),
  largeInvisible: new SeparatorBuilder({
    spacing: SeparatorSpacingSize.Large,
    divider: false,
  }),
});

/**
 * Cria o cabeçalho do painel (fixo em todas as páginas)
 */
const createHeaderSection = (imageName) => {
  return new SectionBuilder({
    components: [
      { type: ComponentType.TextDisplay, content: '# 🛡️ Painel Jonalandia' },
      {
        type: ComponentType.TextDisplay,
        content: '### Painel de gerenciamento do bot Jonalandia.',
      },
    ],
    accessory: {
      type: ComponentType.Thumbnail,
      media: { url: `attachment://${imageName}` },
    },
  });
};

/**
 * Cria a seção de registro de canais
 */
const createChannelsSection = () => {
  return new SectionBuilder({
    components: [
      {
        type: ComponentType.TextDisplay,
        content:
          'Ao clicar no botão você registra todos os canais de texto do seu servidor no banco de dados para o gerenciamento do bot.',
      },
    ],
    accessory: {
      type: ComponentType.Button,
      style: ButtonStyle.Success,
      custom_id: 'add_channels_db',
      label: 'Adicionar Canais',
    },
  });
};

/**
 * Cria seção de streamers
 */
const createStreamersSection = (platform) => {
  const config = {
    twitch: {
      title: '### Cadastrar streamer da Twitch',
      description: 'Configure o canal de notificação e o streamer da Twitch.',
      style: ButtonStyle.Primary,
      customId: 'open_modal_twitch',
      label: 'Adicionar Twitch',
    },
    youtube: {
      title: '### Cadastrar canal do YouTube',
      description: 'Configure o canal de notificação e o canal do YouTube.',
      style: ButtonStyle.Danger,
      customId: 'open_modal_youtube',
      label: 'Adicionar YouTube',
    },
  };

  const { title, description, style, customId, label } = config[platform];

  return new SectionBuilder({
    components: [
      { type: ComponentType.TextDisplay, content: title },
      { type: ComponentType.TextDisplay, content: description },
    ],
    accessory: {
      type: ComponentType.Button,
      style,
      custom_id: customId,
      label,
    },
  });
};

/**
 * Cria menus de seleção de canal com configuração unificada
 */
const createChannelSelectMenu = (customId, placeholder) => {
  const menu = new ChannelSelectMenuBuilder({ customId, placeholder });
  return new ActionRowBuilder({ components: [menu] });
};

/**
 * Cria controles de paginação
 */
const createPaginationControls = (currentPage, totalPages) => {
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const prevButton = new ButtonBuilder({
    custom_id: hasPrev
      ? `goto_page:${currentPage - 1}`
      : 'goto_page:disabled_prev',
    style: ButtonStyle.Secondary,
    label: '◀',
    disabled: !hasPrev,
  });

  const nextButton = new ButtonBuilder({
    custom_id: hasNext
      ? `goto_page:${currentPage + 1}`
      : 'goto_page:disabled_next',
    style: ButtonStyle.Secondary,
    label: '▶',
    disabled: !hasNext,
  });

  return [
    new TextDisplayBuilder({ content: `Página ${currentPage}/${totalPages}` }),
    new ActionRowBuilder({ components: [prevButton, nextButton] }),
  ];
};

/**
 * Cria embed de resposta padronizado
 */
const createResponseEmbed = (color, title, description) => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
};

// =====================================================
// BUILDERS: CONSTRUÇÃO DE PÁGINAS DO PAINEL
// =====================================================

/**
 * Constrói componentes da página 1 (Canais)
 */
const buildPage1Components = (selects) => [
  new TextDisplayBuilder({ content: '## 🗨️ Registro de canais' }),
  createChannelsSection(),
  selects.separators.smallInvisible,
  new TextDisplayBuilder({ content: '## Adicionar canal específico' }),
  new TextDisplayBuilder({
    content:
      'Selecione um canal específico para adicionar ao banco de dados.',
  }),
  selects.addChannelEspecifico,
  selects.separators.smallInvisible,
  new TextDisplayBuilder({ content: '## Remover canal específico' }),
  new TextDisplayBuilder({
    content: 'Selecione um canal específico para remover do banco de dados.',
  }),
  selects.removeChannelEspecifico,
];

/**
 * Constrói componentes da página 2 (Embeds)
 */
const buildPage2Components = (selects) => [
  new TextDisplayBuilder({ content: '## 📦 Enviar embeds' }),
  new TextDisplayBuilder({
    content: 'Escolha um canal para enviar os embeds padrão.',
  }),
  new TextDisplayBuilder({ content: '### Enviar Regras' }),
  selects.regras,
  selects.separators.smallInvisible,
  new TextDisplayBuilder({ content: '### Enviar Manutenção' }),
  selects.manutencao,
];

/**
 * Constrói componentes da página 3 (Streamers)
 */
const buildPage3Components = (selects) => [
  new TextDisplayBuilder({ content: '## 🎮 Streamers' }),
  new TextDisplayBuilder({
    content:
      'Adicione streamers da Twitch e canais do YouTube para receber notificações.',
  }),
  selects.separators.smallInvisible,
  createStreamersSection('twitch'),
  selects.notificationTwitch,
  selects.separators.smallInvisible,
  createStreamersSection('youtube'),
  selects.notificationYoutube,
];

/**
 * Constrói componentes da página 4 (Notificações e Eventos)
 */
const buildPage4Components = (selects) => [
  new TextDisplayBuilder({ content: '## 🔔 Notificações e Eventos' }),
  new TextDisplayBuilder({
    content:
      'Configure os canais para notificações automáticas e eventos do servidor.',
  }),
  selects.separators.smallInvisible,
  new TextDisplayBuilder({ content: '### 🎮 Canal de Jogos Gratuitos' }),
  new TextDisplayBuilder({
    content: 'Receba notificações de novos jogos gratuitos disponíveis.',
  }),
  selects.notificationFreeGames,
  selects.separators.smallInvisible,
  new TextDisplayBuilder({ content: '### 👋 Canal de Boas-vindas' }),
  new TextDisplayBuilder({
    content:
      'Canal onde serão enviadas mensagens de boas-vindas para novos membros.',
  }),
  selects.notificationWelcome,
  selects.separators.smallInvisible,
  new TextDisplayBuilder({ content: '### 👋 Canal de Despedida' }),
  new TextDisplayBuilder({
    content:
      'Canal onde serão enviadas mensagens de despedida quando membros saírem.',
  }),
  selects.notificationGoodbye,
];

/**
 * Constrói componentes da página 5 (Tickets)
 */
const buildPage5Components = (selects) => [
  new TextDisplayBuilder({ content: '## 🎫 Configuração de Tickets' }),
  new TextDisplayBuilder({
    content: 'Configure o sistema de tickets do servidor.',
  }),
  selects.separators.smallInvisible,
  new TextDisplayBuilder({ content: '### 📌 Canal do Painel de Tickets' }),
  new TextDisplayBuilder({
    content:
      'Canal onde será enviado o painel para os usuários criarem tickets.',
  }),
  selects.ticketChannel,
  selects.separators.smallInvisible,
  new TextDisplayBuilder({ content: '### 📁 Categoria dos Tickets' }),
  new TextDisplayBuilder({
    content: 'Categoria onde os canais de tickets serão criados.',
  }),
  selects.ticketCategory,
  selects.separators.smallInvisible,
  new TextDisplayBuilder({ content: '### 👔 Cargo de Suporte' }),
  new TextDisplayBuilder({
    content: 'Cargo que terá acesso aos tickets criados.',
  }),
  selects.ticketSupportRole,
];

/**
 * Constrói componentes da página 6 (Cargos de Permissões)
 */
const buildPage6Components = (selects) => [
  new TextDisplayBuilder({ content: '## 🔐 Configuração de Cargos' }),
  new TextDisplayBuilder({
    content: 'Configure os cargos de moderação e imunidade do bot.',
  }),
  selects.separators.smallInvisible,
  new TextDisplayBuilder({ content: '### 🛡️ Cargo de Moderador' }),
  new TextDisplayBuilder({
    content:
      'Cargo que terá permissão para executar comandos de moderação do bot.',
  }),
  selects.moderatorRole,
  selects.separators.smallInvisible,
  new TextDisplayBuilder({ content: '### 🛡️ Cargo Imune a Punições' }),
  new TextDisplayBuilder({
    content:
      'Cargo que será imune às punições automáticas do bot (anti-flood, anti-spam, etc).',
  }),
  selects.immuneRole,
];

/**
 * Constrói o container completo de uma página
 */
const buildPageContainer = (page, header, selects) => {
  const components = [header, selects.separators.small];

  // Adiciona componentes específicos por página
  const pageBuilders = {
    1: () => components.push(...buildPage1Components(selects)),
    2: () => components.push(...buildPage2Components(selects)),
    3: () => components.push(...buildPage3Components(selects)),
    4: () => components.push(...buildPage4Components(selects)),
    5: () => components.push(...buildPage5Components(selects)),
    6: () => components.push(...buildPage6Components(selects)),
  };

  if (pageBuilders[page]) {
    pageBuilders[page]();
  }

  // Adiciona controles de paginação
  components.push(selects.separators.large);
  components.push(
    ...createPaginationControls(page, PANEL_CONFIG.TOTAL_PAGES)
  );

  return new ContainerBuilder({
    accent_color: PANEL_CONFIG.ACCENT_COLOR,
    components,
  });
};

/**
 * Cria todos os menus de seleção necessários
 */
const createAllSelects = () => {
  const separators = createSeparators();

  return {
    separators,
    regras: createChannelSelectMenu(
      'select_regra_channel',
      'Selecione o canal para enviar as regras'
    ),
    manutencao: createChannelSelectMenu(
      'select_manutencao_channel',
      'Selecione o canal para enviar manutenção'
    ),
    addChannelEspecifico: createChannelSelectMenu(
      'select_add_channel_especifico',
      'Selecione o canal para adicionar'
    ),
    removeChannelEspecifico: createChannelSelectMenu(
      'select_remove_channel_especifico',
      'Selecione o canal para remover'
    ),
    notificationTwitch: createChannelSelectMenu(
      'select_add_channel_notification_twitch',
      'Selecione o canal para notificações da Twitch'
    ),
    notificationYoutube: createChannelSelectMenu(
      'select_add_channel_notification_youtuber',
      'Selecione o canal para notificações do YouTube'
    ),
    notificationFreeGames: createChannelSelectMenu(
      'select_add_channel_notification_free_games',
      'Selecione o canal para jogos gratuitos'
    ),
    notificationWelcome: createChannelSelectMenu(
      'select_add_channel_notification_welcome',
      'Selecione o canal de boas-vindas'
    ),
    notificationGoodbye: createChannelSelectMenu(
      'select_add_channel_notification_goodbye',
      'Selecione o canal de despedida'
    ),
    ticketChannel: createChannelSelectMenu(
      'select_ticket_channel',
      'Selecione o canal para o painel de tickets'
    ),
    ticketCategory: createChannelSelectMenu(
      'select_ticket_category',
      'Selecione a categoria para criar os tickets'
    ),
    ticketSupportRole: new ActionRowBuilder({
      components: [
        new RoleSelectMenuBuilder({
          customId: 'select_ticket_support_role',
          placeholder: 'Selecione o cargo de suporte',
        }),
      ],
    }),
    moderatorRole: new ActionRowBuilder({
      components: [
        new RoleSelectMenuBuilder({
          customId: 'select_moderator_role',
          placeholder: 'Selecione o cargo de moderador',
        }),
      ],
    }),
    immuneRole: new ActionRowBuilder({
      components: [
        new RoleSelectMenuBuilder({
          customId: 'select_immune_role',
          placeholder: 'Selecione o cargo imune a punições',
        }),
      ],
    }),
  };
};

// =====================================================
// HANDLERS: PROCESSAMENTO DE INTERAÇÕES
// =====================================================

/**
 * Handler para seleção de canal de regras
 */
const handleRegrasChannel = async (interaction) => {
  const channelId = interaction.values[0];
  const channel = interaction.guild.channels.cache.get(channelId);

  if (channel) {
    await channel.send({ embeds: [embedRegra()] });
  }

  await interaction.reply({
    content: `Mensagem de regras enviada para o canal <#${channelId}> com sucesso!`,
    flags: [64],
  });
};

/**
 * Handler para seleção de canal de manutenção
 */
const handleManutencaoChannel = async (interaction) => {
  const channelId = interaction.values[0];
  const channel = interaction.guild.channels.cache.get(channelId);

  if (channel) {
    await channel.send({ embeds: [embedManutencao()] });
  }

  await interaction.reply({
    content: `Mensagem de manutenção enviada para o canal <#${channelId}> com sucesso!`,
    flags: [64],
  });
};

/**
 * Handler para adicionar todos os canais ao banco de dados
 */
const handleAddAllChannels = async (interaction) => {
  await interaction.deferReply({ flags: [64] });

  const guild = interaction.guild;
  const textChannels = guild.channels.cache.filter(
    (channel) => channel.type === 0
  );

  const channelsToAdd = textChannels.map((channel) => ({
    channelId: channel.id,
    guildId: guild.id,
    channelName: channel.name,
    channelType: channel.type,
    guildName: guild.name,
  }));

  try {
    await ChannelModel.insertMany(channelsToAdd, { ordered: false });
  } catch (err) {
    if (err.code !== 11000) throw err; // Ignora duplicados
  }

  const addedChannels = await ChannelModel.find({ guildId: guild.id });
  if (addedChannels.length !== textChannels.size) {
    Logger.warn(
      `Nem todos os canais foram adicionados. Esperado: ${textChannels.size}, Adicionado: ${addedChannels.length}`
    );
  }

  const embed = createResponseEmbed(
    EMBED_COLORS.SUCCESS,
    'Canais Adicionados',
    `Foram adicionados ${textChannels.size} canais de texto ao banco de dados.`
  );

  await interaction.editReply({ embeds: [embed] });
};

/**
 * Handler para adicionar canal específico
 */
const handleAddSpecificChannel = async (interaction) => {
  await interaction.deferReply({ flags: [64] });

  const guild = interaction.guild;
  const channelId = interaction.values[0];
  const specificChannel = guild.channels.cache.get(channelId);

  if (!specificChannel || specificChannel.type !== 0) {
    await interaction.editReply('Por favor, selecione um canal de texto válido.');
    Logger.warn(
      `Tentativa de registrar canal inválido: ${
        specificChannel ? specificChannel.id : 'Nenhum'
      }`
    );
    return;
  }

  try {
    const channelData = {
      channelId: specificChannel.id,
      guildId: guild.id,
      channelName: specificChannel.name,
      channelType: specificChannel.type,
      guildName: guild.name,
    };

    await ChannelModel.create(channelData);

    const embed = createResponseEmbed(
      EMBED_COLORS.SUCCESS,
      'Canal Adicionado',
      `O canal <#${specificChannel.id}> foi adicionado ao banco de dados.`
    );

    await interaction.editReply({ embeds: [embed] });
    Logger.info(`Canal adicionado: ${specificChannel.name} (${specificChannel.id})`);
  } catch (err) {
    if (err.code === 11000) {
      await interaction.editReply('Este canal já está registrado.');
      Logger.warn(`Canal já existente: ${specificChannel.id}`);
    } else {
      throw err;
    }
  }
};

/**
 * Handler para remover canal específico
 */
const handleRemoveSpecificChannel = async (interaction) => {
  await interaction.deferReply({ flags: [64] });

  const guild = interaction.guild;
  const channelId = interaction.values[0];
  const specificChannel = guild.channels.cache.get(channelId);

  if (!specificChannel || specificChannel.type !== 0) {
    await interaction.editReply('Por favor, selecione um canal de texto válido.');
    Logger.warn(
      `Tentativa de remover canal inválido: ${
        specificChannel ? specificChannel.id : 'Nenhum'
      }`
    );
    return;
  }

  const deleteResult = await ChannelModel.deleteOne({
    channelId: specificChannel.id,
    guildId: guild.id,
  });

  if (deleteResult.deletedCount === 0) {
    await interaction.editReply('Este canal não está registrado no banco de dados.');
    Logger.warn(`Canal não existente: ${specificChannel.id}`);
    return;
  }

  const embed = createResponseEmbed(
    EMBED_COLORS.SUCCESS,
    'Canal Removido',
    `O canal <#${specificChannel.id}> foi removido do banco de dados.`
  );

  await interaction.editReply({ embeds: [embed] });
  Logger.info(`Canal removido: ${specificChannel.name} (${specificChannel.id})`);
};

/**
 * Handler genérico para configurar canais de notificação
 */
const handleNotificationChannelConfig = async (
  interaction,
  notificationType,
  config
) => {
  await interaction.deferReply({ flags: [64] });

  const guild = interaction.guild;
  const channelId = interaction.values[0];
  const selectedChannel = guild.channels.cache.get(channelId);

  if (!selectedChannel || selectedChannel.type !== 0) {
    await interaction.editReply('Por favor, selecione um canal de texto válido.');
    Logger.warn(
      `Canal de notificação ${notificationType} inválido: ${
        selectedChannel ? selectedChannel.id : 'Nenhum'
      }`
    );
    return;
  }

  try {
    await NotificationChannelsModel.findOneAndUpdate(
      { guildId: guild.id, notificationType },
      {
        channelId: selectedChannel.id,
        channelName: selectedChannel.name,
        guildId: guild.id,
        notificationType,
      },
      { upsert: true, new: true }
    );

    const embed = createResponseEmbed(
      config.color,
      config.title,
      `O canal <#${selectedChannel.id}> foi configurado para ${config.description}.`
    );

    await interaction.editReply({ embeds: [embed] });
    Logger.info(
      `Canal de notificação ${notificationType} configurado: ${selectedChannel.id}`
    );
  } catch (error) {
    Logger.error(`Erro ao configurar canal de notificação ${notificationType}: ${error}`);
    await interaction.editReply('Ocorreu um erro ao configurar o canal de notificação.');
  }
};

/**
 * Handler para configuração de tickets
 */
const handleTicketConfig = async (interaction, configType, value) => {
  await interaction.deferReply({ flags: [64] });

  const guild = interaction.guild;

  try {
    let ticketConfig = await TicketConfigModel.findOne({ guildId: guild.id });

    if (!ticketConfig) {
      ticketConfig = new TicketConfigModel({
        guildId: guild.id,
        channelId: '0',
        categoryId: '0',
        supportRoleId: '0',
      });
    }

    ticketConfig[configType] = value;
    await ticketConfig.save();

    const configs = {
      channelId: {
        color: EMBED_COLORS.INFO,
        title: 'Canal do Painel de Tickets Configurado',
        description: `O canal <#${value}> foi configurado para o painel de tickets.`,
      },
      categoryId: {
        color: EMBED_COLORS.TWITCH,
        title: 'Categoria dos Tickets Configurada',
        description: `A categoria foi configurada para criar os tickets.`,
      },
      supportRoleId: {
        color: EMBED_COLORS.SUCCESS,
        title: 'Cargo de Suporte Configurado',
        description: `O cargo <@&${value}> foi configurado para ter acesso aos tickets.`,
      },
    };

    const config = configs[configType];
    const embed = createResponseEmbed(
      config.color,
      config.title,
      config.description
    );

    await interaction.editReply({ embeds: [embed] });
    Logger.info(`Ticket ${configType} configurado: ${value}`);
  } catch (error) {
    Logger.error(`Erro ao configurar ticket ${configType}: ${error}`);
    await interaction.editReply('Ocorreu um erro ao configurar o ticket.');
  }
};

/**
 * Handler para configuração de cargos de permissões
 */
const handleRolePermissionsConfig = async (interaction, roleType, roleId) => {
  await interaction.deferReply({ flags: [64] });

  const guild = interaction.guild;
  const role = guild.roles.cache.get(roleId);

  if (!role) {
    await interaction.editReply('Cargo inválido selecionado.');
    Logger.warn(`Cargo inválido selecionado: ${roleId}`);
    return;
  }

  try {
    let roleConfig = await RolePermissionsModel.findOne({ guildId: guild.id });

    if (!roleConfig) {
      roleConfig = new RolePermissionsModel({
        guildId: guild.id,
        guildName: guild.name,
      });
    }

    if (roleType === 'moderator') {
      roleConfig.moderatorRoleId = roleId;
      roleConfig.moderatorRoleName = role.name;
    } else if (roleType === 'immune') {
      roleConfig.immuneRoleId = roleId;
      roleConfig.immuneRoleName = role.name;
    }

    await roleConfig.save();

    const configs = {
      moderator: {
        color: EMBED_COLORS.SUCCESS,
        title: 'Cargo de Moderador Configurado',
        description: `O cargo <@&${roleId}> foi configurado como cargo de moderador.`,
      },
      immune: {
        color: EMBED_COLORS.WARNING,
        title: 'Cargo Imune Configurado',
        description: `O cargo <@&${roleId}> foi configurado como cargo imune a punições.`,
      },
    };

    const config = configs[roleType];
    const embed = createResponseEmbed(
      config.color,
      config.title,
      config.description
    );

    await interaction.editReply({ embeds: [embed] });
    Logger.info(`Cargo de ${roleType} configurado: ${role.name} (${roleId})`);
  } catch (error) {
    Logger.error(`Erro ao configurar cargo de ${roleType}: ${error}`);
    await interaction.editReply('Ocorreu um erro ao configurar o cargo.');
  }
};

/**
 * Handler para navegação entre páginas
 */
const handlePageNavigation = async (interaction) => {
  const pageStr = interaction.customId.split(':')[1];
  const targetPage = parseInt(pageStr, 10);

  if (isNaN(targetPage)) return;

  const header = createHeaderSection(PANEL_CONFIG.IMAGE_NAME);
  const selects = createAllSelects();
  const container = buildPageContainer(targetPage, header, selects);

  await interaction.update({ components: [container] });
};

/**
 * Handler para modal de Twitch
 */
const handleTwitchModal = async (interaction) => {
  const modal = new ModalBuilder()
    .setCustomId('modal_add_twitch')
    .setTitle('Adicionar Streamer Twitch');

  const streamerNameInput = new TextInputBuilder()
    .setCustomId('twitch_streamer_name')
    .setLabel('Nome do streamer na Twitch')
    .setPlaceholder('Ex: gaules')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const row = new ActionRowBuilder().addComponents(streamerNameInput);
  modal.addComponents(row);

  await interaction.showModal(modal);
};

/**
 * Handler para modal de YouTube
 */
const handleYoutubeModal = async (interaction) => {
  const modal = new ModalBuilder()
    .setCustomId('modal_add_youtube')
    .setTitle('Adicionar Canal YouTube');

  const channelNameInput = new TextInputBuilder()
    .setCustomId('youtube_channel_name')
    .setLabel('Nome/ID do canal no YouTube')
    .setPlaceholder('Ex: @CanalExemplo ou UCxxxxx')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const row = new ActionRowBuilder().addComponents(channelNameInput);
  modal.addComponents(row);

  await interaction.showModal(modal);
};

/**
 * Handler para submit do modal Twitch
 */
const handleTwitchModalSubmit = async (interaction) => {
  const streamerName =
    interaction.fields.getTextInputValue('twitch_streamer_name');

  const existingStreamer = await onTwitchStreamersSchema.findOne({
    name: streamerName,
  });

  if (existingStreamer) {
    const embed = createResponseEmbed(
      EMBED_COLORS.ERROR,
      'Streamer já cadastrado',
      `O streamer ${streamerName} já está cadastrado no banco de dados.`
    ).setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
    Logger.warn(`Streamer já cadastrado: ${streamerName}`);
    return;
  }

  await onTwitchStreamersSchema.create({ name: streamerName });

  const embed = createResponseEmbed(
    EMBED_COLORS.SUCCESS,
    'Streamer cadastrado com sucesso',
    `Streamer: ${streamerName}`
  ).setAuthor({
    name: client.user.username,
    iconURL: client.user.displayAvatarURL({ dynamic: true }),
  });

  await interaction.reply({ embeds: [embed], ephemeral: true });
  Logger.info(`Streamer Twitch adicionado: ${streamerName}`);
};

/**
 * Handler para submit do modal YouTube
 */
const handleYoutubeModalSubmit = async (interaction) => {
  const channelName =
    interaction.fields.getTextInputValue('youtube_channel_name');

  const existingChannel = await onYoutubeChannelSchema.findOne({
    name: channelName,
  });

  if (existingChannel) {
    const embed = createResponseEmbed(
      EMBED_COLORS.ERROR,
      'Canal já cadastrado',
      `O canal ${channelName} já está cadastrado no banco de dados.`
    ).setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
    Logger.warn(`Canal YouTube já cadastrado: ${channelName}`);
    return;
  }

  await onYoutubeChannelSchema.create({ name: channelName });

  const embed = createResponseEmbed(
    EMBED_COLORS.SUCCESS,
    'Canal cadastrado com sucesso',
    `Canal: ${channelName}`
  ).setAuthor({
    name: client.user.username,
    iconURL: client.user.displayAvatarURL({ dynamic: true }),
  });

  await interaction.reply({ embeds: [embed], ephemeral: true });
  Logger.info(`Canal YouTube adicionado: ${channelName}`);
};

// =====================================================
// REGISTRO DE LISTENERS (UMA ÚNICA VEZ)
// =====================================================

/**
 * Registra todos os listeners de interação do painel
 * Utiliza um Map para otimizar o roteamento de handlers
 */
function registerPainelListeners() {
  if (painelListenersRegistered) return;
  painelListenersRegistered = true;

  client.setMaxListeners(PANEL_CONFIG.MAX_LISTENERS);

  // Map de handlers por tipo de interação
  const channelSelectHandlers = new Map([
    ['select_regra_channel', handleRegrasChannel],
    ['select_manutencao_channel', handleManutencaoChannel],
    ['select_add_channel_especifico', handleAddSpecificChannel],
    ['select_remove_channel_especifico', handleRemoveSpecificChannel],
    [
      'select_add_channel_notification_twitch',
      (i) =>
        handleNotificationChannelConfig(i, 'twitch', {
          color: EMBED_COLORS.TWITCH,
          title: 'Canal de Notificação Twitch Configurado',
          description: 'receber notificações da Twitch',
        }),
    ],
    [
      'select_add_channel_notification_youtuber',
      (i) =>
        handleNotificationChannelConfig(i, 'youtube', {
          color: EMBED_COLORS.YOUTUBE,
          title: 'Canal de Notificação YouTube Configurado',
          description: 'receber notificações do YouTube',
        }),
    ],
    [
      'select_add_channel_notification_free_games',
      (i) =>
        handleNotificationChannelConfig(i, 'free_games', {
          color: EMBED_COLORS.SUCCESS,
          title: 'Canal de Jogos Gratuitos Configurado',
          description: 'receber notificações de jogos gratuitos',
        }),
    ],
    [
      'select_add_channel_notification_welcome',
      (i) =>
        handleNotificationChannelConfig(i, 'welcome', {
          color: EMBED_COLORS.INFO,
          title: 'Canal de Boas-vindas Configurado',
          description: 'receber mensagens de boas-vindas',
        }),
    ],
    [
      'select_add_channel_notification_goodbye',
      (i) =>
        handleNotificationChannelConfig(i, 'goodbye', {
          color: EMBED_COLORS.WARNING,
          title: 'Canal de Despedida Configurado',
          description: 'receber mensagens de despedida',
        }),
    ],
    [
      'select_ticket_channel',
      (i) => handleTicketConfig(i, 'channelId', i.values[0]),
    ],
    [
      'select_ticket_category',
      (i) => handleTicketConfig(i, 'categoryId', i.values[0]),
    ],
  ]);

  const buttonHandlers = new Map([
    ['add_channels_db', handleAddAllChannels],
    ['open_modal_twitch', handleTwitchModal],
    ['open_modal_youtube', handleYoutubeModal],
  ]);

  const modalHandlers = new Map([
    ['modal_add_twitch', handleTwitchModalSubmit],
    ['modal_add_youtube', handleYoutubeModalSubmit],
  ]);

  const roleSelectHandlers = new Map([
    [
      'select_ticket_support_role',
      (i) => handleTicketConfig(i, 'supportRoleId', i.values[0]),
    ],
    [
      'select_moderator_role',
      (i) => handleRolePermissionsConfig(i, 'moderator', i.values[0]),
    ],
    [
      'select_immune_role',
      (i) => handleRolePermissionsConfig(i, 'immune', i.values[0]),
    ],
  ]);

  // Handler unificado de interações
  client.on('interactionCreate', async (interaction) => {
    try {
      // Channel Select Menus
      if (interaction.isChannelSelectMenu()) {
        const handler = channelSelectHandlers.get(interaction.customId);
        if (handler) {
          await handler(interaction);
          return;
        }
      }

      // Buttons
      if (interaction.isButton()) {
        // Navegação de páginas
        if (interaction.customId.startsWith('goto_page:')) {
          await handlePageNavigation(interaction);
          return;
        }

        const handler = buttonHandlers.get(interaction.customId);
        if (handler) {
          await handler(interaction);
          return;
        }
      }

      // Modal Submits
      if (interaction.isModalSubmit()) {
        const handler = modalHandlers.get(interaction.customId);
        if (handler) {
          await handler(interaction);
          return;
        }
      }

      // Role Select Menus
      if (interaction.isRoleSelectMenu()) {
        const handler = roleSelectHandlers.get(interaction.customId);
        if (handler) {
          await handler(interaction);
          return;
        }
      }
    } catch (error) {
      Logger.error(`Erro no handler de interações do painel: ${error}`);
      
      // Tenta responder ao usuário em caso de erro
      const errorMessage = {
        content: 'Ocorreu um erro ao processar sua solicitação.',
        flags: [64],
      };

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(errorMessage).catch(() => {});
      } else {
        await interaction.reply(errorMessage).catch(() => {});
      }
    }
  });
}

// =====================================================
// FUNÇÃO PRINCIPAL DO COMANDO PAINEL
// =====================================================

/**
 * Executa o comando /painel
 */
async function Painel(interaction) {
  if (!interaction.isCommand()) return;

  // Verificações de autorização
  const authorizedChannel = await checkingComandChannelBlocked(interaction);
  if (!authorizedChannel) return;

  const authorizedModerador = await checkingComandExecuntionModerador(interaction);
  if (!authorizedModerador) return;

  try {
    // Registra listeners uma única vez
    registerPainelListeners();

    // Cria componentes
    const imagemBot = new AttachmentBuilder(PANEL_CONFIG.IMAGE_PATH, {
      name: PANEL_CONFIG.IMAGE_NAME,
    });

    const header = createHeaderSection(PANEL_CONFIG.IMAGE_NAME);
    const selects = createAllSelects();
    const container = buildPageContainer(1, header, selects);

    // Responde com a página 1
    await interaction.reply({
      flags: ['IsComponentsV2'],
      components: [container],
      files: [imagemBot],
    });

    Logger.info(
      `Painel aberto por ${interaction.user.tag} em ${interaction.guild.name}`
    );
  } catch (error) {
    Logger.error(`Erro ao executar o comando Painel: ${error}`);
    
    const errorResponse = {
      content: 'Ocorreu um erro ao executar o comando.',
      flags: [64],
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.editReply(errorResponse);
    } else {
      await interaction.reply(errorResponse);
    }
  }
}

// =====================================================
// EXPORTAÇÃO
// =====================================================

module.exports = { Painel };
