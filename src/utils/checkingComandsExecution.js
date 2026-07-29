const { EmbedBuilder } = require('discord.js');
const { client } = require("../Client");
const { getRolePermissions, getBlockedChannels, invalidateGuildCache } = require('./cache');

async function checkingComandChannelBlocked(interaction) {
  const { channelId, guild } = interaction;
  const blockedChannels = await getBlockedChannels(guild.id);

  if (blockedChannels.includes(channelId)) {
    const embed = new EmbedBuilder()
      .setColor('Red')
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setTitle("Este comando não pode ser usado neste canal")
      .setDescription('Vá ao canal <#1253377239370698873> para executar os comandos')
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return false;
  }

  return true;
}

async function checkingComandExecuntionModerador(interaction) {
  const { member, guild } = interaction;

  try {
    const roleConfig = await getRolePermissions(guild.id);

    if (roleConfig && roleConfig.moderatorRoleId && !member.roles.cache.has(roleConfig.moderatorRoleId)) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription('Você não tem permissão para usar este comando.')
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao verificar cargo de moderador:', error);
    return true;
  }
}

module.exports = { checkingComandChannelBlocked, checkingComandExecuntionModerador };
