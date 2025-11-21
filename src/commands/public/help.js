const { EmbedBuilder } = require('discord.js');

async function Help(interaction) {

  const embed = new EmbedBuilder()
    .setTitle('📋 Comandos do Bot Jonalandia')
    .setColor('#7289DA')
    .setDescription('**Bot Multi-Guild** - Aqui está a lista de comandos disponíveis!\n\n🌐 *Este bot suporta múltiplos servidores com configurações isoladas*')
    .addFields(
      {
        name: '🤖 Comandos Públicos',
        value: '`/help` - Exibe esta mensagem de ajuda\n`/server` - Exibe informações do servidor\n`/clima` - Mostra a previsão do tempo para uma cidade'
      },
      {
        name: '🛠️ Comandos de Moderação',
        value: '`/clean` - Limpa mensagens do canal ou de usuário específico\n`/timeout` - Aplica timeout de 3 minutos em um usuário\n`/expulsar` - Expulsa um usuário do servidor\n`/banir` - Bane um usuário do servidor (temporário ou permanente)\n`/desbanir` - Desbane um usuário do servidor\n`/listarbanstemporarios` - Lista todos os bans temporários ativos\n`/kickuser` - Expulsa um usuário do canal de voz\n`/embed` - Cria um embed personalizado\n`/ficha` - Busca dados completos do usuário no servidor\n`/voteparaban` - Inicia votação democrática para banir um usuário\n`/cargo` - Mostra painel de seleção de cargos\n`/ticket` - Mostra painel para abrir tickets de suporte'
      },
      {
        name: '⚙️ Comando de Configuração',
        value: '`/painel` - **Central de configuração do bot**\n\n**✨ O painel permite configurar:**\n• 📝 Registrar e remover canais específicos\n• 📦 Enviar embeds padrão (regras, manutenção)\n• 🎮 Cadastrar streamers da Twitch para monitoramento\n• 📺 Cadastrar canais do YouTube para notificações\n• 🔔 Configurar canais de notificações (Twitch, YouTube, Jogos Gratuitos)\n• 👋 Configurar canais de boas-vindas e despedida\n• 🎫 Configurar sistema de tickets e cargo de suporte\n• 🛡️ Configurar cargos (Moderador, Imune, Novo Membro)\n\n**🔐 Permissões necessárias:**\n• Ser o dono do servidor **OU**\n• Ter permissão de Administrador **OU**\n• Possuir o cargo de Moderador configurado no painel'
      },
      {
        name: '🔄 Funcionalidades Automáticas',
        value: '**🛡️ Sistema de Proteção:**\n• AntiFloodChat - Detecta spam com avisos progressivos\n• BlockLinks - Bloqueia links não autorizados\n• DetectInappropriateWords - Filtra palavras inadequadas\n• AutoKickNewMembers - Remove contas suspeitas\n\n**📢 Sistema de Notificações (por servidor):**\n• 🎮 Twitch Monitor - Notifica quando streamers entram ao vivo (3min)\n• 📺 YouTube Monitor - Avisa sobre novos vídeos (5min)\n• 🆓 Free Games Monitor - Alerta sobre jogos gratuitos (6h)\n• 👋 Welcome/Goodbye - Mensagens automáticas de entrada/saída\n• ⏰ TempBan Manager - Desbanimento automático de bans temporários (1min)'
      },
      {
        name: '🌐 Multi-Guild Ready',
        value: '**O bot agora suporta múltiplos servidores!**\n\nCada servidor possui:\n• 🔒 Configurações completamente isoladas\n• 📊 Seus próprios streamers e canais monitorados\n• 💾 Histórico de infrações independente\n• ⚙️ Canais de notificação personalizados\n\n*Configure tudo através do* `/painel` *em cada servidor!*'
      },
      {
        name: '💡 Primeiros Passos',
        value: '**1.** Use `/painel` para abrir o painel de configuração\n**2.** Navegue pelas 6 páginas usando os botões ◀ ▶\n**3.** Configure os canais, streamers e cargos conforme necessário\n**4.** Todas as configurações são salvas automaticamente!\n\n*O painel centraliza todas as configurações em uma interface moderna e intuitiva.*'
      }
    )
    .setFooter({ text: 'Jonalandia Bot v2.0.0', iconURL: interaction.client.user.displayAvatarURL() })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

module.exports = { Help };
