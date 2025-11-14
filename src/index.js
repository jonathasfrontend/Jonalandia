/*
  * PROJETO: Bot Jonalandia
  * AUTOR: Jonathas Oliveira
  * LICENÇA: JPL (Jonathas Proprietary License)
  * Veja mais em: LICENSE
*/

require('dotenv').config();

const { logger, botEvent, erro, error } = require('./logger');
const { client } = require('./Client');
/*
  // Funções 
  * Check de punições
*/
const { antiFloodChat } = require('./functions/checkPunishments/antiFloodChat');
const { blockLinks } = require('./functions/checkPunishments/blockLinks');
const { detectInappropriateWords } = require('./functions/checkPunishments/detectInappropriateWords');
const { autoKickNewMembers } = require('./functions/checkPunishments/kickNewMembers');
const { blockFileTypes } = require('./functions/checkPunishments/blockFileTypes');
/*  // Funções 
  * Públicos
*/
const { onMemberAdd } = require('./functions/public/onMemberAdd');
const { ruleMembreAdd } = require('./functions/public/ruleMembreAdd');
const { onMemberRemove } = require('./functions/public/onMemberRemove');
const { Status } = require('./functions/public/statusBot');
const { scheduleNotificationYoutubeCheck } = require('./functions/public/onNotificationYoutube');
const { scheduleNotificationTwitchCheck } = require('./functions/public/onNotificationTwitch');
const { scheduleonNotificationFreeGamesCheck } = require('./functions/public/onNotificationFreeGames');
const { scheduleTempBanCheck } = require('./functions/public/checkTempBans');
/*
  // Comandos
  * Inicialização
*/
const { Painel } = require('./commands/initialize/painel');
/*
  // Comandos
  * Públicos
*/
const { Help } = require('./commands/public/help');
const { searchGuild } = require('./commands/public/searchGuild');
const { menssageFile } = require('./commands/public/mensage');
const { getWeather } = require('./commands/public/weather');
/*
  // Comandos
  * Moderador
*/
const { createEmbed } = require('./commands/moderador/createEmbed');
const { clean } = require('./commands/moderador/clean');
const { cargo } = require('./commands/moderador/cargo');
const { ticket } = require('./commands/moderador/ticket');
const { timeout } = require('./commands/moderador/timeout');
const { expulsar } = require('./commands/moderador/expulsar');
const { banUser } = require('./commands/moderador/banUser');
const { unbanUser } = require('./commands/moderador/unbanUser');
const { listTempBans } = require('./commands/moderador/listTempBans');
const { kickUser } = require('./commands/moderador/kickUser');
const { Ficha } = require('./commands/moderador/ficha');
const { voteParaBan } = require('./commands/moderador/voteparaban')
const { excluirComando } = require('./commands/moderador/deleteCommand');
/*
  // Database
*/
const { bdServerConect } = require('./database/bdServerConect');
const { ApplicationCommandType } = require('discord.js');

client.once('ready', () => {
  try {
    logger.info('Inicializando bot Jonalandia...', { module: 'BOT' });

    bdServerConect();

    Status();
    botEvent('STATUS_SET', 'Status do bot configurado');


    scheduleNotificationYoutubeCheck();
    botEvent('YOUTUBE_NOTIFICATION_STARTED', 'Monitoramento de YouTube iniciado');

    scheduleNotificationTwitchCheck();
    botEvent('TWITCH_NOTIFICATION_STARTED', 'Monitoramento de Twitch iniciado');

    scheduleonNotificationFreeGamesCheck();
    botEvent('FREE_GAMES_NOTIFICATION_STARTED', 'Monitoramento de jogos gratuitos iniciado');

    scheduleTempBanCheck();
    botEvent('TEMP_BAN_CHECKER_STARTED', 'Verificador de bans temporários iniciado');

    logger.info('Bot Jonalandia está online e todos os sistemas foram inicializados!', { module: 'BOT' });
  } catch (error) {
    logger.error('Erro durante inicialização do bot', { module: 'BOT' }, error);
  }

  client.application?.commands.create({
    name: 'oi',
    description: 'Responde com Olá!',
  })

  client.application?.commands.create({
    name: 'server',
    description: "Busca informações do servidor!",
  })

  client.application?.commands.create({
    name: 'help',
    description: "Ajuda com os comandos!",
  })

  client.application?.commands.create({
    name: 'clean',
    description: 'Limpa mensagens do canal ou de um usuário específico (Moderador)',
    options: [
      {
        type: 3, // String choice
        name: 'tipo',
        description: 'Tipo de limpeza a ser realizada',
        required: true,
        choices: [
          { name: '🗑️ Limpar mensagens de um usuário específico', value: 'usuario' },
          { name: '🧹 Limpar últimas mensagens do canal', value: 'todas' }
        ]
      },
      {
        type: 4, // Integer
        name: 'quantidade',
        description: 'Quantidade de mensagens a serem deletadas (1-100)',
        required: true,
      },
      {
        type: 6, // User
        name: 'usuario',
        description: 'Usuário cujas mensagens serão deletadas (obrigatório se tipo = usuário)',
        required: false,
      }
    ],
  });

  client.application?.commands.create({
    name: 'cargo',
    description: "Comando para mostrar botões dos cargos! (Moderador)",
  })

  client.application?.commands.create({
    name: 'ticket',
    description: "Comando para mostrar botão para abrir um ticket",
  })

  client.application?.commands.create({
    name: 'painel',
    description: 'Abre o painel de moderação (Moderador)',
  });

  client.application?.commands.create({
    name: 'embed',
    description: 'Cria um embed personalizado com opções flexíveis (Moderador)',
    options: [
      {
        type: 7, // Tipo de canal
        name: 'canal',
        description: 'O canal onde o embed será enviado',
        required: true
      },
      {
        type: 3, // Tipo de string
        name: 'titulo',
        description: 'O título do embed',
        required: false
      },
      {
        type: 3, // Tipo de string
        name: 'descricao',
        description: 'A descrição do embed',
        required: false
      },
      {
        type: 3, // Tipo de string
        name: 'cor',
        description: 'A cor do embed (hex, nome ou padrão)',
        required: false
      },
      {
        type: 3, // Tipo de string
        name: 'imagem',
        description: 'URL da imagem principal do embed',
        required: false
      },
      {
        type: 3, // Tipo de string
        name: 'thumbnail',
        description: 'URL da imagem em miniatura do embed',
        required: false
      },
      {
        type: 3, // Tipo de string
        name: 'footer',
        description: 'Texto do rodapé do embed',
        required: false
      },
      {
        type: 3, // Tipo de string
        name: 'footer_icon',
        description: 'URL do ícone do rodapé',
        required: false
      },
      {
        type: 3, // Tipo de string
        name: 'author_name',
        description: 'Nome do autor do embed',
        required: false
      },
      {
        type: 3, // Tipo de string
        name: 'author_icon',
        description: 'URL do ícone do autor',
        required: false
      },
      {
        type: 3, // Tipo de string
        name: 'author_url',
        description: 'URL do link do autor',
        required: false
      },
      {
        type: 3, // Tipo de string
        name: 'url',
        description: 'URL do link principal do embed',
        required: false
      },
      {
        type: 5, // Tipo boolean
        name: 'timestamp',
        description: 'Incluir timestamp (padrão: true)',
        required: false
      }
    ],
  });

  client.application?.commands.create({
    name: 'timeout',
    description: 'Aplica um timeout de 10 minutos em um usuário. (Moderador)',
    options: [
      {
        type: 6,
        name: 'usuario',
        description: 'Selecione o usuário para aplicar o timeout.',
        required: true,
      },
    ],
  });

  client.application?.commands.create({
    name: 'expulsar',
    description: 'Expulsa um usuário do servidor (Moderador)',
    options: [
      {
        type: 6, // Tipo 6 é para selecionar usuário
        name: 'usuario',
        description: 'O usuário a ser expulso',
        required: true,
      },
    ],
  });

  client.application?.commands.create({
    name: 'banir',
    description: 'Bane um usuário do servidor (Moderador)',
    options: [
      {
        type: 6, // Tipo para usuário (Discord user)
        name: 'usuario',
        description: 'O usuário que será banido.',
        required: true,
      },
      {
        type: 3, // Tipo string
        name: 'duracao',
        description: 'Duração do ban (deixe vazio para ban permanente)',
        required: false,
        choices: [
          {
            name: '1 minuto',
            value: '1m'
          },
          {
            name: '1 hora',
            value: '1h'
          },
          {
            name: '5 horas',
            value: '5h'
          },
          {
            name: '1 dia',
            value: '1d'
          },
          {
            name: '10 dias',
            value: '10d'
          }
        ]
      },
    ],
  });

  client.application?.commands.create({
    name: 'desbanir',
    description: 'Desbane um usuário do servidor (Moderador)',
    options: [
      {
        type: 6, // Tipo 6 representa um usuário
        name: 'usuario',
        description: 'Selecione o usuário a ser desbanido',
        required: true,
      },
    ],
  });

  client.application?.commands.create({
    name: 'listbans',
    description: 'Lista todos os bans temporários ativos no servidor (Moderador)',
  });

  client.application?.commands.create({
    name: 'kickuser',
    description: 'Expulsa um usuário do canal de voz. (Moderador)',
    options: [
      {
        type: 6, // Tipo para usuário (Discord user)
        name: 'usuario',
        description: 'O usuário a ser expulso do canal de voz.',
        required: true,
      }
    ],
  });

  client.application?.commands.create({
    name: 'clima',
    description: 'Exibe a previsão do tempo para uma cidade especificada',
    options: [{
      type: 3, // Tipo de string
      name: 'cidade',
      description: 'Nome da cidade para buscar o clima',
      required: true,
    }],
  });

  client.application?.commands.create({
    name: 'Ficha do Usuário',
    type: ApplicationCommandType.User,
  });

  client.application?.commands.create({
    name: 'ficha',
    description: 'Busca ficha dos dados do usuario no servidor (Moderador)',
    options: [
      {
        type: 6, // User
        name: 'usuario',
        description: 'Usuário a ser consultado',
        required: true,
      },
    ],
  });

  client.application?.commands.create({
    name: 'voteparaban',
    description: 'Inicia uma votação para banir um usuário.',
    options: [
      {
        type: 6,
        name: 'usuario',
        description: 'Selecione o usuário para iniciar a votação de ban.',
        required: true,
      },
    ],
  });

  client.application?.commands.create({
    name: 'excluicomando',
    description: 'Exclui um comando do bot. (Moderador)',
    options: [
      {
        type: 3, //  
        name: 'comando',
        description: 'O nome do comando a ser excluído.',
        required: true,
      }
    ],
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'clean') {
    await clean(interaction);
  } else if (commandName === 'oi') {
    await menssageFile(interaction);
  } else if (commandName === 'help') {
    await Help(interaction);
  } else if (commandName === 'server') {
    await searchGuild(interaction)
  } else if (commandName === 'cargo') {
    await cargo(interaction)
  } else if (commandName === 'ticket') {
    await ticket(interaction)
  } else if (commandName === 'embed') {
    await createEmbed(interaction);
  } else if (commandName === 'timeout') {
    await timeout(interaction);
  } else if (commandName === 'expulsar') {
    await expulsar(interaction);
  } else if (commandName === 'banir') {
    await banUser(interaction);
  } else if (commandName === 'desbanir') {
    await unbanUser(interaction);
  } else if (commandName === 'listbans') {
    await listTempBans(interaction);
  } else if (commandName === 'kickuser') {
    await kickUser(interaction);
  } else if (commandName === 'clima') {
    await getWeather(interaction);
  } else if (commandName === 'ficha' || commandName === 'Ficha do Usuário') {
    await Ficha(interaction);
  } else if (commandName === 'voteparaban') {
    await voteParaBan(interaction);
  } else if (commandName === 'excluicomando') {
    await excluirComando(interaction);
  } else if (commandName === 'painel') {
    await Painel(interaction);
  } else {
    erro('Comando não reconhecido', { module: 'INTERACTION_CREATE', command: commandName });
  }
});

client.on('guildMemberAdd', onMemberAdd);
client.on('guildMemberAdd', ruleMembreAdd);
client.on('guildMemberAdd', autoKickNewMembers);
client.on('guildMemberRemove', onMemberRemove);

client.on('messageCreate', blockLinks);
client.on('messageCreate', antiFloodChat);
client.on('messageCreate', detectInappropriateWords);
client.on('messageCreate', blockFileTypes);

client.login(process.env.TOKEN);