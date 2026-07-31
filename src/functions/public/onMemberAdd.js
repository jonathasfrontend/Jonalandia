const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { logger, botEvent } = require('../../logger');
const { db } = require('../../database/service');
const { setStandardFooter } = require('../../utils/embedFooter');

async function onMemberAdd(member) {
  const context = { module: 'MEMBER_EVENTS', user: member.user.tag, guild: member.guild?.name };

  logger.info(`Novo membro: ${member.user.tag}`, context);

  try {
    const welcomeChannelConfig = await db.notificationChannels.findOne({ guildId: member.guild.id, notificationType: 'welcome' });
    let welcomeChannel;

    if (welcomeChannelConfig) {
      welcomeChannel = member.guild.channels.cache.get(welcomeChannelConfig.channelId);
    } else {
      welcomeChannel = member.guild.channels.cache.get(process.env.CHANNEL_ID_BEMVINDO);
    }

    if (welcomeChannel) {
      const embed = new EmbedBuilder()
        .setColor(0xffffff)
        .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTitle(`${member.user.tag} | Bem-vindo(a)!`)
        .setDescription(`<:feliz:1402690475634458664> Salve ${member.user}!`)
        .setImage('https://media.giphy.com/media/GPQBFuG4ABACA/source.gif');
      setStandardFooter(embed, client);

      welcomeChannel.send({ embeds: [embed] });

      member.send(`Olá ${member.user.tag} bem-vindo(a) ao servidor Jonalandia! Leia as regras <#1253359463042384012>`)
        .then(() => logger.debug(`DM enviada para ${member.user.tag}`, context))
        .catch(() => logger.warn(`DM não enviada para ${member.user.tag}`, context));

      const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
      if (logChannel) logChannel.send(`${member.user} entrou no servidor.`);
    }
  } catch (error) {
    logger.error('Erro no onMemberAdd', context, error);
  }
}

module.exports = { onMemberAdd };
