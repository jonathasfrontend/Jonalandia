const { EmbedBuilder } = require('discord.js');

async function Help(interaction) {

  const embed = new EmbedBuilder()
    .setTitle('📋 Comandos do Bot Jonalandia')
    .setColor('#7289DA')
    .setDescription('Aqui está a lista de comandos disponíveis no bot. Use-os conforme necessário!')
    .addFields(
      {
        name: '🤖 Comandos Públicos',
        value: '`/help` - Exibe esta mensagem de ajuda\n`/server` - Exibe informações do servidor\n`/clima` - Mostra a previsão do tempo para uma cidade\n'
      },
      {
        name: '🛠️ Comandos de Moderação',
        value: '`/clean` - Limpa mensagens do canal ou de usuário específico\n`/timeout` - Aplica timeout de 3 minutos em um usuário\n`/expulsar` - Expulsa um usuário do servidor\n`/banir` - Bane um usuário do servidor\n`/desbanir` - Desbane um usuário do servidor\n`/kickuser` - Expulsa um usuário do canal de voz\n`/embed` - Cria um embed personalizado\n`/ficha` - Busca dados do usuário no servidor\n`/voteparaban` - Inicia votação para banir um usuário\n `/excluicomando` - Exclui um comando do bot\n`/cargo` - Mostra botões dos cargos\n`/ticket` - Mostra painel para abrir tickets'
      },
      {
        name: '⚙️ Comandos de Configuração Inicial',
        value: '`/painel` - **[NOVO]** Painel centralizado de configuração do bot\n\n**O painel permite:**\n• Registrar canais no banco de dados\n• Configurar notificações (Twitch, YouTube, Jogos Gratuitos)\n• Enviar embeds padrão (regras, manutenção)\n• Configurar sistema de tickets\n• Configurar canais de boas-vindas e despedida\n• Cadastrar streamers e canais para monitoramento'
      },
      {
        name: '🔄 Funcionalidades Automáticas',
        value: '**Sistema de Proteção:**\n• AntiFloodChat - Detecta spam de mensagens\n• BlockLinks - Bloqueia links não autorizados\n• DetectInappropriateWords - Filtra palavras inadequadas\n• AutoKickNewMembers - Remove contas suspeitas\n\n**Sistema de Notificações:**\n• Twitch Monitor - Notifica quando streamers entram ao vivo\n• YouTube Monitor - Avisa sobre novos vídeos\n• Free Games Monitor - Alerta sobre jogos gratuitos\n• Welcome/Goodbye Messages - Mensagens automáticas de entrada/saída'
      },
      {
        name: '💡 Dica de Uso',
        value: '**Para configurar o bot pela primeira vez, use:**\n`/painel` - Abre o painel interativo com navegação por abas\n\nO painel centraliza todas as configurações em uma interface fácil de usar!'
      }
    )
    .setFooter({ text: 'Jonalandia Bot', iconURL: interaction.client.user.displayAvatarURL() })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

module.exports = { Help };
