const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  AttachmentBuilder,
  ChannelSelectMenuBuilder,
  RoleSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const { Logger } = require('../../logger');
const { db } = require('../../database/service');
const { invalidateGuildCache } = require('../../utils/cache');
const path = require('path');
const { client } = require('../../Client');
const { embedRegra } = require('../../embedsDefault/embedRegra');
const { embedManutencao } = require('../../embedsDefault/embedManutencao');

const PANEL_CONFIG = {
  TOTAL_PAGES: 6,
  IMAGE_PATH: path.join(__dirname, '..', '..', '..', 'jonalandia.png'),
  IMAGE_NAME: 'jonalandia.png',
  ACCENT_COLOR: 0xffffff,
};

const EMBED_COLORS = {
  SUCCESS: 'Green',
  ERROR: 'Red',
  INFO: 'Blue',
  WARNING: 'Orange',
  TWITCH: 'Purple',
  YOUTUBE: 'Red',
};

let painelListenersRegistered = false;

async function checkPainelPermissions(interaction) {
  const { guild, member, user } = interaction;
  if (guild.ownerId === user.id) return true;
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;

  try {
    const roleConfig = await db.rolePermissions.findOne({ guildId: guild.id });
    if (roleConfig?.moderatorRoleId && member.roles.cache.has(roleConfig.moderatorRoleId)) return true;
  } catch (error) {
    Logger.error(`[PAINEL] Erro ao verificar cargo de moderador: ${error}`);
  }

  await interaction.reply({
    content: '❌ **Acesso Negado**\n\nVocê não tem permissão para executar este comando.\n\n**Permissões necessárias:**\n• Ser o dono do servidor\n• Ter permissão de Administrador\n• Possuir o cargo de Moderador configurado no painel',
    flags: [64],
  });
  return false;
}

function createResponseEmbed(color, title, description) {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

function makeChannelSelect(customId, placeholder) {
  return new ActionRowBuilder({
    components: [new ChannelSelectMenuBuilder({ customId, placeholder })]
  });
}

function makeRoleSelect(customId, placeholder) {
  return new ActionRowBuilder({
    components: [new RoleSelectMenuBuilder({ customId, placeholder })]
  });
}

function makePaginationRow(currentPage, totalPages) {
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  return new ActionRowBuilder({
    components: [
      new ButtonBuilder({ custom_id: hasPrev ? `goto_page:${currentPage - 1}` : 'goto_page:disabled_prev', style: ButtonStyle.Secondary, label: '◀', disabled: !hasPrev }),
      new ButtonBuilder({ custom_id: hasNext ? `goto_page:${currentPage + 1}` : 'goto_page:disabled_next', style: ButtonStyle.Secondary, label: '▶', disabled: !hasNext }),
    ]
  });
}

function buildPage(page, imageName) {
  const rows = [];

  const introRow = new ActionRowBuilder({
    components: [
      new ButtonBuilder({ custom_id: 'panel_header', style: ButtonStyle.Secondary, label: `🛡️ Painel Jonalandia - Página ${page}/6`, disabled: true }),
    ]
  });
  rows.push(introRow);

  switch (page) {
    case 1:
      rows.push(makeChannelSelect('select_regra_channel', '📦 Enviar Regras para...'));
      rows.push(makeChannelSelect('select_manutencao_channel', '📦 Enviar Manutenção para...'));
      rows.push(new ActionRowBuilder({
        components: [new ButtonBuilder({ custom_id: 'add_channels_db', style: ButtonStyle.Success, label: '📝 Registrar Todos os Canais' })]
      }));
      rows.push(makeChannelSelect('select_add_channel_especifico', '➕ Adicionar Canal Específico'));
      rows.push(makeChannelSelect('select_remove_channel_especifico', '➖ Remover Canal Específico'));
      break;

    case 2:
      rows.push(makeChannelSelect('select_regra_channel', '📦 Enviar Regras para...'));
      rows.push(makeChannelSelect('select_manutencao_channel', '📦 Enviar Manutenção para...'));
      break;

    case 3:
      rows.push(new ActionRowBuilder({
        components: [new ButtonBuilder({ custom_id: 'open_modal_twitch', style: ButtonStyle.Primary, label: '🎮 Adicionar Streamer Twitch' })]
      }));
      rows.push(makeChannelSelect('select_add_channel_notification_twitch', '📢 Canal Notif. Twitch'));
      rows.push(new ActionRowBuilder({
        components: [new ButtonBuilder({ custom_id: 'open_modal_youtube', style: ButtonStyle.Danger, label: '📺 Adicionar Canal YouTube' })]
      }));
      rows.push(makeChannelSelect('select_add_channel_notification_youtuber', '📢 Canal Notif. YouTube'));
      break;

    case 4:
      rows.push(makeChannelSelect('select_add_channel_notification_free_games', '🎮 Canal Jogos Gratuitos'));
      rows.push(makeChannelSelect('select_add_channel_notification_welcome', '👋 Canal de Boas-vindas'));
      rows.push(makeChannelSelect('select_add_channel_notification_goodbye', '👋 Canal de Despedida'));
      break;

    case 5:
      rows.push(makeChannelSelect('select_ticket_channel', '📌 Canal Painel de Tickets'));
      rows.push(makeChannelSelect('select_ticket_category', '📁 Categoria dos Tickets'));
      rows.push(makeRoleSelect('select_ticket_support_role', '👔 Cargo de Suporte'));
      break;

    case 6:
      rows.push(makeRoleSelect('select_moderator_role', '🛡️ Cargo de Moderador'));
      rows.push(makeRoleSelect('select_immune_role', '🛡️ Cargo Imune'));
      rows.push(makeRoleSelect('select_new_member_role', '👋 Cargo Novo Membro'));
      break;
  }

  rows.push(makePaginationRow(page, PANEL_CONFIG.TOTAL_PAGES));
  return rows;
}

async function Painel(interaction) {
  if (!interaction.isCommand()) return;

  const hasPermission = await checkPainelPermissions(interaction);
  if (!hasPermission) return;

  try {
    registerPainelListeners();

    const imagemBot = new AttachmentBuilder(PANEL_CONFIG.IMAGE_PATH, { name: PANEL_CONFIG.IMAGE_NAME });
    const rows = buildPage(1, PANEL_CONFIG.IMAGE_NAME);

    await interaction.reply({
      flags: ['IsComponentsV2'],
      components: rows,
      files: [imagemBot],
    });

    Logger.info(`Painel aberto por ${interaction.user.tag} em ${interaction.guild.name}`);
  } catch (error) {
    Logger.error(`Erro ao executar o comando Painel: ${error}`);
    const msg = { content: 'Ocorreu um erro ao executar o comando.', flags: [64] };
    if (interaction.replied || interaction.deferred) await interaction.editReply(msg);
    else await interaction.reply(msg);
  }
}

function registerPainelListeners() {
  if (painelListenersRegistered) return;
  painelListenersRegistered = true;

  client.on('interactionCreate', async (interaction) => {
    try {
      if (interaction.isButton()) {
        if (interaction.customId.startsWith('goto_page:')) {
          const page = parseInt(interaction.customId.split(':')[1], 10);
          if (!isNaN(page)) {
            await interaction.update({ components: buildPage(page, PANEL_CONFIG.IMAGE_NAME) });
          }
          return;
        }

        if (interaction.customId === 'add_channels_db') {
          await interaction.deferReply({ flags: [64] });
          const guild = interaction.guild;
          const textChannels = guild.channels.cache.filter(ch => ch.type === 0);
          const channelsToAdd = textChannels.map(ch => ({
            channelId: ch.id,
            guildId: guild.id,
            channelName: ch.name,
            channelType: ch.type,
            guildName: guild.name,
          }));
          await db.channels.createMany(channelsToAdd);
          invalidateGuildCache(guild.id);
          const embed = createResponseEmbed(EMBED_COLORS.SUCCESS, 'Canais Adicionados', `${textChannels.size} canais de texto registrados.`);
          await interaction.editReply({ embeds: [embed] });
          return;
        }

        if (interaction.customId === 'open_modal_twitch') {
          const modal = new ModalBuilder().setCustomId('modal_add_twitch').setTitle('Adicionar Streamer Twitch');
          modal.addComponents(new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('twitch_streamer_name').setLabel('Nome do streamer').setPlaceholder('Ex: gaules').setStyle(TextInputStyle.Short).setRequired(true)
          ));
          await interaction.showModal(modal);
          return;
        }

        if (interaction.customId === 'open_modal_youtube') {
          const modal = new ModalBuilder().setCustomId('modal_add_youtube').setTitle('Adicionar Canal YouTube');
          modal.addComponents(new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('youtube_channel_name').setLabel('Nome/ID do canal').setPlaceholder('Ex: @CanalExemplo').setStyle(TextInputStyle.Short).setRequired(true)
          ));
          await interaction.showModal(modal);
          return;
        }
      }

      if (interaction.isChannelSelectMenu()) {
        await interaction.deferReply({ flags: [64] });
        const channelId = interaction.values[0];
        const channel = interaction.guild.channels.cache.get(channelId);

        if (!channel) {
          await interaction.editReply('Canal inválido.');
          return;
        }

        if (interaction.customId !== 'select_ticket_category' && channel.type !== 0) {
          await interaction.editReply('Selecione um canal de texto válido.');
          return;
        }

        switch (interaction.customId) {
          case 'select_regra_channel':
            await channel.send({ embeds: [embedRegra()] });
            await interaction.editReply(`Regras enviadas para <#${channelId}>.`);
            break;

          case 'select_manutencao_channel':
            await channel.send({ embeds: [embedManutencao()] });
            await interaction.editReply(`Manutenção enviada para <#${channelId}>.`);
            break;

          case 'select_add_channel_especifico': {
            await db.channels.create({ channelId: channel.id, guildId: interaction.guild.id, channelName: channel.name, channelType: channel.type, guildName: interaction.guild.name });
            invalidateGuildCache(interaction.guild.id);
            await interaction.editReply({ embeds: [createResponseEmbed(EMBED_COLORS.SUCCESS, 'Canal Adicionado', `<#${channel.id}> adicionado.`)] });
            break;
          }

          case 'select_remove_channel_especifico': {
            const result = await db.channels.deleteOne({ channelId: channel.id, guildId: interaction.guild.id });
            invalidateGuildCache(interaction.guild.id);
            if (result.deletedCount === 0) await interaction.editReply('Este canal não está registrado.');
            else await interaction.editReply({ embeds: [createResponseEmbed(EMBED_COLORS.SUCCESS, 'Canal Removido', `<#${channel.id}> removido.`)] });
            break;
          }

          case 'select_add_channel_notification_twitch':
          case 'select_add_channel_notification_youtuber':
          case 'select_add_channel_notification_free_games':
          case 'select_add_channel_notification_welcome':
          case 'select_add_channel_notification_goodbye': {
            const typeMap = {
              select_add_channel_notification_twitch: 'twitch',
              select_add_channel_notification_youtuber: 'youtube',
              select_add_channel_notification_free_games: 'free_games',
              select_add_channel_notification_welcome: 'welcome',
              select_add_channel_notification_goodbye: 'goodbye',
            };
            const notifType = typeMap[interaction.customId];
            await db.notificationChannels.upsert(interaction.guild.id, notifType, { channelId: channel.id, channelName: channel.name });
            await interaction.editReply(`Canal <#${channel.id}> configurado para notificações de ${notifType}.`);
            break;
          }

          case 'select_ticket_channel':
            await db.tickets.upsert(interaction.guild.id, { channelId: channel.id });
            await interaction.editReply(`Canal do painel de tickets configurado: <#${channel.id}>.`);
            break;

          case 'select_ticket_category':
            await db.tickets.upsert(interaction.guild.id, { categoryId: channel.id });
            await interaction.editReply('Categoria de tickets configurada.');
            break;

          default:
            await interaction.editReply('Ação não reconhecida.');
        }
        return;
      }

      if (interaction.isRoleSelectMenu()) {
        await interaction.deferReply({ flags: [64] });
        const roleId = interaction.values[0];
        const role = interaction.guild.roles.cache.get(roleId);

        if (!role) {
          await interaction.editReply('Cargo inválido.');
          return;
        }

        const roleMap = {
          select_ticket_support_role: { table: 'tickets', field: 'supportRoleId' },
          select_moderator_role: { table: 'rolePermissions', field: 'moderatorRoleId', nameField: 'moderatorRoleName' },
          select_immune_role: { table: 'rolePermissions', field: 'immuneRoleId', nameField: 'immuneRoleName' },
          select_new_member_role: { table: 'rolePermissions', field: 'newMemberRoleId', nameField: 'newMemberRoleName' },
        };

        const config = roleMap[interaction.customId];
        if (config) {
          const updateData = { [config.field]: roleId };
          if (config.nameField) updateData[config.nameField] = role.name;
          if (config.table === 'rolePermissions') {
            updateData.guildName = interaction.guild.name;
            await db.rolePermissions.upsert(interaction.guild.id, updateData);
            invalidateGuildCache(interaction.guild.id);
          } else {
            await db.tickets.upsert(interaction.guild.id, updateData);
          }
          await interaction.editReply(`Cargo <@&${roleId}> configurado com sucesso.`);
        }
        return;
      }

      if (interaction.isModalSubmit()) {
        await interaction.deferReply({ flags: [64] });
        const guildId = interaction.guild.id;

        if (interaction.customId === 'modal_add_twitch') {
          const name = interaction.fields.getTextInputValue('twitch_streamer_name');
          const existing = await db.streamers.findOne({ guildId, name });
          if (existing) {
            await interaction.editReply({ embeds: [createResponseEmbed(EMBED_COLORS.ERROR, 'Streamer já cadastrado', `${name} já está cadastrado.`)] });
            return;
          }
          await db.streamers.create({ guildId, name });
          await interaction.editReply({ embeds: [createResponseEmbed(EMBED_COLORS.SUCCESS, 'Streamer Adicionado', `Streamer: ${name}`)] });
          return;
        }

        if (interaction.customId === 'modal_add_youtube') {
          const name = interaction.fields.getTextInputValue('youtube_channel_name');
          const existing = await db.youtubeChannels.findOne({ guildId, name });
          if (existing) {
            await interaction.editReply({ embeds: [createResponseEmbed(EMBED_COLORS.ERROR, 'Canal já cadastrado', `${name} já está cadastrado.`)] });
            return;
          }
          await db.youtubeChannels.create({ guildId, name });
          await interaction.editReply({ embeds: [createResponseEmbed(EMBED_COLORS.SUCCESS, 'Canal Adicionado', `Canal: ${name}`)] });
          return;
        }
      }
    } catch (error) {
      Logger.error(`Erro no handler do painel: ${error.message}`);
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content: 'Ocorreu um erro.', flags: [64] }).catch(() => {});
        } else {
          await interaction.reply({ content: 'Ocorreu um erro.', flags: [64] }).catch(() => {});
        }
      } catch (e) {}
    }
  });
}

module.exports = { Painel };
