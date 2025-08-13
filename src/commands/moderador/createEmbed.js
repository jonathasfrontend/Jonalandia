const { EmbedBuilder } = require('discord.js');
const { logger, commandExecuted } = require('../../logger');
const { client } = require('../../Client');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

/**
 * Comando avançado para criação de embeds personalizados
 * Permite escolher quais elementos incluir no embed de forma flexível
 */
async function createEmbed(interaction) {
  if (!interaction.isCommand()) return;

  const { options } = interaction;

  // Verificações de autorização
  const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
  if (!authorizedExecutionComand) return;

  const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
  if (!authorizedExecutionComandModerador) return;

  // Obtenção dos parâmetros obrigatórios
  const canal = options.getChannel('canal');

  // Obtenção dos parâmetros opcionais
  const titulo = options.getString('titulo');
  const descricao = options.getString('descricao');
  const cor = options.getString('cor') || '#0099ff'; // Cor padrão azul
  const imagem = options.getString('imagem');
  const thumbnail = options.getString('thumbnail');
  const footer = options.getString('footer');
  const footerIcon = options.getString('footer_icon');
  const authorName = options.getString('author_name');
  const authorIcon = options.getString('author_icon');
  const authorUrl = options.getString('author_url');
  const url = options.getString('url');
  const timestamp = options.getBoolean('timestamp') !== false; // True por padrão

  // Validação básica
  if (!titulo && !descricao && !imagem && !thumbnail) {
    return await interaction.reply({
      content: '❌ Você deve fornecer pelo menos um dos seguintes elementos: título, descrição, imagem ou thumbnail.',
      ephemeral: true
    });
  }

  // Criação do embed
  const embed = new EmbedBuilder();

  // Aplicação das configurações condicionalmente
  if (titulo) embed.setTitle(titulo);
  if (descricao) embed.setDescription(descricao);
  if (url) embed.setURL(url);

  // Configuração de cor com validação
  try {
    embed.setColor(cor);
  } catch (error) {
    embed.setColor('#0099ff'); // Fallback para cor padrão
    logger.warn(`Cor inválida fornecida: ${cor}, usando cor padrão`, { module: 'CREATE_EMBED' });
  }

  // Configuração de imagens
  if (imagem) {
    if (isValidUrl(imagem)) {
      embed.setImage(imagem);
    } else {
      return await interaction.reply({
        content: '❌ URL da imagem inválida. Por favor, forneça uma URL válida.',
        ephemeral: true
      });
    }
  }

  if (thumbnail) {
    if (isValidUrl(thumbnail)) {
      embed.setThumbnail(thumbnail);
    } else {
      return await interaction.reply({
        content: '❌ URL do thumbnail inválida. Por favor, forneça uma URL válida.',
        ephemeral: true
      });
    }
  }

  // Configuração do autor
  if (authorName) {
    const authorOptions = { name: authorName };
    if (authorIcon && isValidUrl(authorIcon)) authorOptions.iconURL = authorIcon;
    if (authorUrl && isValidUrl(authorUrl)) authorOptions.url = authorUrl;
    embed.setAuthor(authorOptions);
  }

  // Configuração do footer
  if (footer) {
    const footerOptions = { text: footer };
    if (footerIcon && isValidUrl(footerIcon)) footerOptions.iconURL = footerIcon;
    embed.setFooter(footerOptions);
  }

  // Timestamp
  if (timestamp) {
    embed.setTimestamp();
  }

  try {
    // Envio do embed
    await canal.send({ embeds: [embed] });

    // Resposta de sucesso com preview do embed
    const successEmbed = new EmbedBuilder()
      .setTitle('✅ Embed Criado com Sucesso!')
      .setDescription(`O embed foi enviado para ${canal} com as seguintes configurações:`)
      .addFields(
        { name: 'Canal', value: canal.toString(), inline: true },
        { name: 'Título', value: titulo || 'Não definido', inline: true },
        { name: 'Cor', value: cor, inline: true }
      )
      .setColor('#00ff00')
      .setTimestamp();

    await interaction.reply({ embeds: [successEmbed], ephemeral: true });

    // Log de auditoria
    const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle('📝 Embed Criado')
        .setDescription(`${interaction.user.tag} criou um embed em ${canal}`)
        .addFields(
          { name: 'Usuário', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
          { name: 'Canal', value: canal.toString(), inline: true },
          { name: 'Título', value: titulo || 'Não definido', inline: false }
        )
        .setColor('#ffa500')
        .setTimestamp();

      logChannel.send({ embeds: [logEmbed] });
    }

    commandExecuted('CREATE_EMBED', `Embed criado com sucesso por ${interaction.user.tag} no canal ${canal.name}`);
    logger.info(`Embed criado com sucesso por ${interaction.user.tag} no canal ${canal.name}`, { 
      module: 'CREATE_EMBED',
      userId: interaction.user.id,
      channelId: canal.id,
      guildId: interaction.guild.id
    });

  } catch (error) {
    logger.error('Erro ao enviar embed:', error, { 
      module: 'CREATE_EMBED',
      userId: interaction.user.id,
      channelId: canal?.id
    });

    const errorEmbed = new EmbedBuilder()
      .setTitle('❌ Erro ao Criar Embed')
      .setDescription('Ocorreu um erro ao enviar o embed. Verifique as permissões do bot no canal de destino.')
      .setColor('#ff0000')
      .setTimestamp();

    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}

/**
 * Valida se uma string é uma URL válida
 * @param {string} string - A string a ser validada
 * @returns {boolean} - True se for uma URL válida
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = { createEmbed };
