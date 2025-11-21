const { client } = require('../../Client');
const { logger, botEvent, databaseEvent } = require('../../logger');
const GuildConfig = require('../../database/models/guildConfig');
const { EmbedBuilder } = require('discord.js');

/**
 * Gerenciador de Guilds - Controla a entrada e saída do bot em servidores
 * Auto-registra novas guilds e desativa guilds quando o bot sai
 */

/**
 * Cria configuração padrão para uma nova guild
 * @param {Guild} guild - Guild do Discord
 * @returns {Promise<GuildConfig>}
 */
async function createDefaultGuildConfig(guild) {
  const context = { module: 'GUILD_MANAGER', guildId: guild.id, guildName: guild.name };

  try {
    logger.info(`Criando configuração padrão para nova guild: ${guild.name}`, context);

    // Busca o owner da guild
    const owner = await guild.fetchOwner();

    const defaultConfig = new GuildConfig({
      guildId: guild.id,
      guildName: guild.name,
      ownerId: owner.id,
      ownerTag: owner.user.tag,
      isActive: true,
      botAddedAt: new Date(),
      
      // Configurações padrão de punições
      punishmentConfig: {
        antiFlood: {
          enabled: true,
          maxMessages: 5,
          timeWindow: 5000,
          action: 'timeout'
        },
        blockLinks: {
          enabled: true,
          whitelist: [],
          action: 'delete'
        },
        inappropriateWords: {
          enabled: true,
          action: 'delete'
        },
        blockFileTypes: {
          enabled: true,
          blockedExtensions: [],
          action: 'delete'
        },
        kickNewMembers: {
          enabled: false,
          minAccountAge: 7,
          action: 'kick'
        }
      },
      
      prefix: '!',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo'
    });

    await defaultConfig.save();
    
    databaseEvent('INSERT', 'GuildConfig', true, `Configuração criada para ${guild.name}`);
    logger.info(`Configuração padrão criada para ${guild.name}`, context);
    
    return defaultConfig;
    
  } catch (error) {
    logger.error(`Erro ao criar configuração padrão para guild ${guild.name}`, context, error);
    databaseEvent('INSERT', 'GuildConfig', false, error.message);
    throw error;
  }
}

/**
 * Envia mensagem de boas-vindas ao dono do servidor
 * @param {Guild} guild - Guild do Discord
 * @param {GuildConfig} guildConfig - Configuração da guild
 */
async function sendWelcomeDM(guild, guildConfig) {
  const context = { module: 'GUILD_MANAGER', guildId: guild.id };

  try {
    const owner = await guild.fetchOwner();

    const welcomeEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🎉 Obrigado por adicionar o Jonalandia Bot!')
      .setDescription(
        `Olá **${owner.user.username}**!\n\n` +
        `Obrigado por adicionar o bot **${client.user.tag}** ao servidor **${guild.name}**!\n\n` +
        `O bot foi configurado com configurações padrão. Para personalizar o bot para seu servidor, siga os passos abaixo:`
      )
      .addFields(
        {
          name: '📋 Configuração Inicial',
          value:
            '1️⃣ Use o comando `/painel` para acessar o painel de configuração\n' +
            '2️⃣ Configure os canais de notificações (Twitch, YouTube, Jogos Grátis)\n' +
            '3️⃣ Configure os canais de logs e boas-vindas\n' +
            '4️⃣ Defina os cargos de moderador e membros imunes\n' +
            '5️⃣ Cadastre seus streamers e canais favoritos'
        },
        {
          name: '⚙️ Configurações de Punições',
          value:
            '• Anti-Flood: Ativado ✅\n' +
            '• Bloqueio de Links: Ativado ✅\n' +
            '• Palavras Inapropriadas: Ativado ✅\n' +
            '• Bloqueio de Arquivos: Ativado ✅\n' +
            '• Expulsão de Novos Membros: Desativado ❌'
        },
        {
          name: '📚 Comandos Principais',
          value:
            '`/painel` - Painel de configuração completo\n' +
            '`/help` - Lista de comandos disponíveis\n' +
            '`/ficha @usuário` - Ver infrações de um usuário\n' +
            '`/clean [quantidade]` - Limpar mensagens'
        },
        {
          name: '🆔 Informações da Guild',
          value:
            `**Guild ID:** ${guild.id}\n` +
            `**Owner ID:** ${owner.id}\n` +
            `**Membros:** ${guild.memberCount}\n` +
            `**Data de Criação:** ${guild.createdAt.toLocaleDateString('pt-BR')}`
        },
        {
          name: '🔗 Links Úteis',
          value:
            '[Servidor de Suporte](https://discord.gg/seu-servidor) | ' +
            '[Documentação](https://github.com/jonathasfrontend/jonalandia) | ' +
            '[Reportar Bug](https://github.com/jonathasfrontend/jonalandia/issues)'
        }
      )
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `Bot Jonalandia v2.0.0 | Guild ID: ${guild.id}`,
        iconURL: client.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    await owner.send({ embeds: [welcomeEmbed] });
    
    logger.info(`Mensagem de boas-vindas enviada ao dono de ${guild.name}`, context);
    botEvent('WELCOME_DM_SENT', `Mensagem enviada para ${owner.user.tag}`);
    
  } catch (error) {
    // Erro ao enviar DM (DMs podem estar fechadas)
    logger.warn(`Não foi possível enviar DM ao dono de ${guild.name}`, context, error);
    
    // Tenta enviar no canal de sistema da guild
    try {
      const systemChannel = guild.systemChannel;
      if (systemChannel) {
        const fallbackEmbed = new EmbedBuilder()
          .setColor('#FFA500')
          .setTitle('⚙️ Configuração Inicial Necessária')
          .setDescription(
            `Olá! Eu sou o **${client.user.tag}**!\n\n` +
            `Use o comando \`/painel\` para configurar o bot para este servidor.\n` +
            `Para mais informações, consulte a documentação.`
          )
          .setFooter({
            text: `Guild ID: ${guild.id}`,
            iconURL: client.user.displayAvatarURL({ dynamic: true })
          });
        
        await systemChannel.send({ embeds: [fallbackEmbed] });
        logger.info(`Mensagem de boas-vindas enviada no canal de sistema de ${guild.name}`, context);
      }
    } catch (channelError) {
      logger.warn(`Não foi possível enviar mensagem no canal de sistema de ${guild.name}`, context, channelError);
    }
  }
}

/**
 * Evento: Bot adicionado a uma nova guild
 */
client.on('guildCreate', async (guild) => {
  const context = { module: 'GUILD_MANAGER', guildId: guild.id, guildName: guild.name };

  try {
    logger.info(`Bot adicionado à guild: ${guild.name} (${guild.id})`, {
      ...context,
      memberCount: guild.memberCount,
      ownerId: guild.ownerId
    });

    botEvent('GUILD_CREATE', `Adicionado à guild ${guild.name} (${guild.memberCount} membros)`);

    // Verifica se já existe uma configuração (caso o bot tenha sido removido e readicionado)
    let guildConfig = await GuildConfig.findOne({ guildId: guild.id });

    if (guildConfig) {
      // Reativa a guild se estava inativa
      if (!guildConfig.isActive) {
        guildConfig.isActive = true;
        guildConfig.leftAt = null;
        guildConfig.guildName = guild.name; // Atualiza o nome caso tenha mudado
        await guildConfig.save();
        
        logger.info(`Guild ${guild.name} reativada`, context);
        databaseEvent('UPDATE', 'GuildConfig', true, `Guild ${guild.name} reativada`);
      } else {
        logger.info(`Configuração já existe para ${guild.name}`, context);
      }
    } else {
      // Cria nova configuração
      guildConfig = await createDefaultGuildConfig(guild);
    }

    // Envia mensagem de boas-vindas ao dono
    await sendWelcomeDM(guild, guildConfig);

    logger.info(`Processo de entrada na guild ${guild.name} concluído`, context);

  } catch (error) {
    logger.error(`Erro ao processar entrada na guild ${guild.name}`, context, error);
    botEvent('GUILD_CREATE_ERROR', `Erro ao processar guild ${guild.name}: ${error.message}`);
  }
});

/**
 * Evento: Bot removido de uma guild
 */
client.on('guildDelete', async (guild) => {
  const context = { module: 'GUILD_MANAGER', guildId: guild.id, guildName: guild.name };

  try {
    logger.info(`Bot removido da guild: ${guild.name} (${guild.id})`, context);
    botEvent('GUILD_DELETE', `Removido da guild ${guild.name}`);

    // Marca a guild como inativa
    const guildConfig = await GuildConfig.findOne({ guildId: guild.id });

    if (guildConfig) {
      await guildConfig.deactivate();
      
      logger.info(`Guild ${guild.name} marcada como inativa`, context);
      databaseEvent('UPDATE', 'GuildConfig', true, `Guild ${guild.name} desativada`);
    } else {
      logger.warn(`Configuração não encontrada para guild ${guild.name}`, context);
    }

  } catch (error) {
    logger.error(`Erro ao processar saída da guild ${guild.name}`, context, error);
    botEvent('GUILD_DELETE_ERROR', `Erro ao processar saída de ${guild.name}: ${error.message}`);
  }
});

/**
 * Evento: Guild atualizada (nome, owner, etc.)
 */
client.on('guildUpdate', async (oldGuild, newGuild) => {
  const context = { module: 'GUILD_MANAGER', guildId: newGuild.id };

  try {
    // Verifica se houve mudanças relevantes
    if (oldGuild.name !== newGuild.name || oldGuild.ownerId !== newGuild.ownerId) {
      const guildConfig = await GuildConfig.findOne({ guildId: newGuild.id });

      if (guildConfig) {
        let updated = false;

        if (oldGuild.name !== newGuild.name) {
          guildConfig.guildName = newGuild.name;
          logger.info(`Nome da guild atualizado: ${oldGuild.name} -> ${newGuild.name}`, context);
          updated = true;
        }

        if (oldGuild.ownerId !== newGuild.ownerId) {
          const newOwner = await newGuild.fetchOwner();
          guildConfig.ownerId = newOwner.id;
          guildConfig.ownerTag = newOwner.user.tag;
          logger.info(`Dono da guild atualizado: ${oldGuild.ownerId} -> ${newOwner.id}`, context);
          updated = true;
        }

        if (updated) {
          await guildConfig.save();
          databaseEvent('UPDATE', 'GuildConfig', true, `Guild ${newGuild.name} atualizada`);
        }
      }
    }
  } catch (error) {
    logger.error(`Erro ao processar atualização da guild ${newGuild.name}`, context, error);
  }
});

module.exports = {
  createDefaultGuildConfig,
  sendWelcomeDM
};
