const { EmbedBuilder } = require('discord.js');
const { logger, commandExecuted } = require('../../logger');

/**
 * Comando Help - Exibe a lista completa de comandos disponíveis no bot
 * 
 * @description
 * Apresenta uma interface organizada com todos os comandos do bot categorizados por tipo:
 * - Comandos Públicos: Acessíveis a todos os usuários
 * - Comandos de Moderação: Requerem permissões especiais
 * - Comandos de Configuração: Para setup inicial do bot
 * - Funcionalidades Automáticas: Sistemas que funcionam em background
 * 
 * @param {Object} interaction - Objeto de interação do Discord.js
 * @returns {Promise<void>}
 * 
 * @example
 * // Usuário executa o comando
 * /help
 * 
 * @updated 2025-11-10 - Atualizado com novo comando /painel
 */
async function Help(interaction) {
  try {
    const context = {
      module: 'COMMAND',
      command: 'help',
      user: interaction.user.tag,
      guild: interaction.guild?.name
    };

    logger.debug('Iniciando comando help', context);

    const embed = new EmbedBuilder()
      .setTitle('📋 Comandos do Bot Jonalandia')
      .setColor('#7289DA')
      .setDescription('Aqui está a lista de comandos disponíveis no bot. Use-os conforme necessário!')
      .addFields(
          { 
            name: '🤖 Comandos Públicos', 
            value: '`/help` - Exibe esta mensagem de ajuda\n`/server` - Exibe informações do servidor\n`/clima` - Mostra a previsão do tempo para uma cidade\n`/aniversario` - Registra o dia do seu aniversário' 
          },
          { 
            name: '🛠️ Comandos de Moderação', 
            value: '`/clean` - Limpa mensagens do canal ou de usuário específico\n`/timeout` - Aplica timeout de 3 minutos em um usuário\n`/expulsar` - Expulsa um usuário do servidor\n`/banir` - Bane um usuário do servidor\n`/desbanir` - Desbane um usuário do servidor\n`/kickuser` - Expulsa um usuário do canal de voz\n`/embed` - Cria um embed personalizado\n`/ficha` - Busca dados do usuário no servidor\n`/voteparaban` - Inicia votação para banir um usuário\n`/backup` - Faz backup completo do banco de dados\n`/excluicomando` - Exclui um comando do bot\n`/cargo` - Mostra botões dos cargos\n`/ticket` - Mostra painel para abrir tickets' 
          },
          { 
            name: '⚙️ Comandos de Configuração Inicial', 
            value: '`/painel` - **[NOVO]** Painel centralizado de configuração do bot\n\n**O painel permite:**\n• Registrar canais no banco de dados\n• Configurar notificações (Twitch, YouTube, Jogos Gratuitos)\n• Enviar embeds padrão (regras, manutenção)\n• Configurar sistema de tickets\n• Configurar canais de boas-vindas e despedida\n• Cadastrar streamers e canais para monitoramento' 
          },
          { 
            name: '🔄 Funcionalidades Automáticas', 
            value: '**Sistema de Proteção:**\n• AntiFloodChat - Detecta spam de mensagens\n• BlockLinks - Bloqueia links não autorizados\n• DetectInappropriateWords - Filtra palavras inadequadas\n• AutoKickNewMembers - Remove contas suspeitas\n\n**Sistema de Notificações:**\n• Birthday Notifications - Parabeniza aniversariantes\n• Twitch Monitor - Notifica quando streamers entram ao vivo\n• YouTube Monitor - Avisa sobre novos vídeos\n• Free Games Monitor - Alerta sobre jogos gratuitos\n• Welcome/Goodbye Messages - Mensagens automáticas de entrada/saída' 
          },
          {
            name: '💡 Dica de Uso',
            value: '**Para configurar o bot pela primeira vez, use:**\n`/painel` - Abre o painel interativo com navegação por abas\n\nO painel centraliza todas as configurações em uma interface fácil de usar!'
          }
      )
      .setFooter({ text: 'Jonalandia Bot v2.0 - Refatorado e Otimizado', iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    
    commandExecuted('help', interaction.user, interaction.guild, true);
    logger.info('Lista de comandos exibida com sucesso', context);

  } catch (error) {
    const context = {
      module: 'COMMAND',
      command: 'help',
      user: interaction.user.tag,
      guild: interaction.guild?.name
    };

    logger.error('Erro ao executar comando help', context, error);
    commandExecuted('help', interaction.user, interaction.guild, false);

    if (!interaction.replied) {
      await interaction.reply({ content: 'Ocorreu um erro ao exibir a lista de comandos.', ephemeral: true });
    }
  }
}

module.exports = { Help };
