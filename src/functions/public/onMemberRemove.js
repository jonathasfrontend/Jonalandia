const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { logger } = require('../../logger');
const { db } = require('../../database/service');
const { setStandardFooter } = require('../../utils/embedFooter');

async function onMemberRemove(member) {
  const context = { module: 'MEMBER_EVENTS', user: member.user.tag, guild: member.guild?.name };

  try {
    const goodbyeConfig = await db.notificationChannels.findOne({ guildId: member.guild.id, notificationType: 'goodbye' });
    let channel;

    if (goodbyeConfig) {
      channel = member.guild.channels.cache.get(goodbyeConfig.channelId);
    } else {
      channel = member.guild.channels.cache.get(process.env.CHANNEL_ID_ATE_LOGO);
    }

    if (channel) {
      const embed = new EmbedBuilder()
        .setColor(0xffffff)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTitle('<:affs:1402695937175846912> ahhhhh!')
        .setDescription(`⚰ **${member.user}** saiu do servidor...`)
        .setImage('https://i.pinimg.com/originals/81/2d/e9/812de920c0c7076356699d644418e326.gif');
      setStandardFooter(embed, client, member.user.username);

      channel.send({ embeds: [embed] });
    }

    const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
    if (logChannel) logChannel.send(`${member.user} saiu do servidor.`);

    const farewellEmbed = new EmbedBuilder()
      .setColor(0xffffff).setTitle('😭 ahhhhh!')
      .setDescription(`⚰ **${member.user}** saiu do servidor...`)
      .setImage('https://i.pinimg.com/originals/81/2d/e9/812de920c0c7076356699d644418e326.gif');
    setStandardFooter(farewellEmbed, client);

    member.user.send({ embeds: [farewellEmbed] })
      .then(() => logger.debug(`DM de despedida enviada para ${member.user.tag}`))
      .catch(() => logger.warn(`DM bloqueada para ${member.user.tag}`));
  } catch (error) {
    logger.error('Erro no onMemberRemove', context, error);
  }
}

module.exports = { onMemberRemove };
