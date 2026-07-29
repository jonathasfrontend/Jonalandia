const { client } = require('../../Client');
const { logger, botEvent } = require('../../logger');
const { db } = require('../../database/service');
const { invalidateGuildCache } = require('../../utils/cache');
const { EmbedBuilder } = require('discord.js');
const { EmbedBuilder: EB } = require('discord.js');

async function createDefaultGuildConfig(guild) {
  const context = { module: 'GUILD_MANAGER', guildId: guild.id, guildName: guild.name };

  try {
    const owner = await guild.fetchOwner();
    const defaultConfig = {
      guildId: guild.id, guildName: guild.name, ownerId: owner.id, ownerTag: owner.user.tag,
      isActive: true, botAddedAt: new Date(),
      punishmentConfig: JSON.stringify({
        antiFlood: { enabled: true, maxMessages: 5, timeWindow: 5000, action: 'timeout' },
        blockLinks: { enabled: true, whitelist: [], action: 'delete' },
        inappropriateWords: { enabled: true, action: 'delete' },
        blockFileTypes: { enabled: true, blockedExtensions: [], action: 'delete' },
        kickNewMembers: { enabled: false, minAccountAge: 7, action: 'kick' }
      }),
      prefix: '!', language: 'pt-BR', timezone: 'America/Sao_Paulo'
    };

    await db.guilds.create(defaultConfig);
    logger.info(`Configuração criada para ${guild.name}`, context);
  } catch (error) {
    logger.error(`Erro ao criar config para ${guild.name}`, context, error);
  }
}

client.on('guildCreate', async (guild) => {
  const context = { module: 'GUILD_MANAGER', guildId: guild.id, guildName: guild.name };

  try {
    logger.info(`Adicionado à guild: ${guild.name}`, context);
    let guildConfig = await db.guilds.findByGuildId(guild.id);

    if (guildConfig) {
      if (!guildConfig.isActive) {
        await db.guilds.update(guild.id, { isActive: true, leftAt: null, guildName: guild.name });
        logger.info(`Guild ${guild.name} reativada`, context);
      }
    } else {
      await createDefaultGuildConfig(guild);
    }

    try {
      const owner = await guild.fetchOwner();
      const welcomeEmbed = new EB()
        .setColor('#00FF00').setTitle('🎉 Obrigado por adicionar o Jonalandia Bot!')
        .setDescription(`Olá **${owner.user.username}**!\n\nObrigado por adicionar o bot ao **${guild.name}**!\n\nUse \`/painel\` para configurar.`)
        .setFooter({ text: `Bot Jonalandia v2.0.0` }).setTimestamp();

      await owner.send({ embeds: [welcomeEmbed] });
    } catch (dmError) {
      try {
        const systemChannel = guild.systemChannel;
        if (systemChannel) {
          await systemChannel.send({ embeds: [new EB().setColor('#FFA500').setTitle('⚙️ Configuração').setDescription('Use `/painel` para configurar o bot.')] });
        }
      } catch (e) {}
    }
  } catch (error) {
    logger.error(`Erro no guildCreate para ${guild.name}`, context, error);
  }
});

client.on('guildDelete', async (guild) => {
  const context = { module: 'GUILD_MANAGER', guildId: guild.id, guildName: guild.name };

  try {
    logger.info(`Removido da guild: ${guild.name}`, context);
    await db.guilds.update(guild.id, { isActive: false, leftAt: new Date() });
    invalidateGuildCache(guild.id);
  } catch (error) {
    logger.error(`Erro no guildDelete para ${guild.name}`, context, error);
  }
});

client.on('guildUpdate', async (oldGuild, newGuild) => {
  try {
    if (oldGuild.name !== newGuild.name || oldGuild.ownerId !== newGuild.ownerId) {
      const update = {};
      if (oldGuild.name !== newGuild.name) update.guildName = newGuild.name;
      if (oldGuild.ownerId !== newGuild.ownerId) {
        const owner = await newGuild.fetchOwner();
        update.ownerId = owner.id;
        update.ownerTag = owner.user.tag;
      }
      await db.guilds.update(newGuild.id, update);
    }
  } catch (error) {
    logger.error(`Erro no guildUpdate`, { module: 'GUILD_MANAGER', guildId: newGuild.id }, error);
  }
});

module.exports = {};
