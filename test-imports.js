// Script de teste para verificar imports
console.log('=== Testando Imports ===\n');

const modules = [
  { name: 'dotenv', path: 'dotenv' },
  { name: 'logger', path: './src/logger' },
  { name: 'Client', path: './src/Client' },
  { name: 'antiFloodChat', path: './src/functions/checkPunishments/antiFloodChat' },
  { name: 'blockLinks', path: './src/functions/checkPunishments/blockLinks' },
  { name: 'detectInappropriateWords', path: './src/functions/checkPunishments/detectInappropriateWords' },
  { name: 'autoKickNewMembers', path: './src/functions/checkPunishments/kickNewMembers' },
  { name: 'blockFileTypes', path: './src/functions/checkPunishments/blockFileTypes' },
  { name: 'onMemberAdd', path: './src/functions/public/onMemberAdd' },
  { name: 'ruleMembreAdd', path: './src/functions/public/ruleMembreAdd' },
  { name: 'onMemberRemove', path: './src/functions/public/onMemberRemove' },
  { name: 'Status', path: './src/functions/public/statusBot' },
  { name: 'checkUpdateRoles', path: './src/functions/public/checkUpdateRoles' },
  { name: 'scheduleBirthdayCheck', path: './src/functions/public/checkBirthdays' },
  { name: 'scheduleNotificationYoutubeCheck', path: './src/functions/public/onNotificationYoutube' },
  { name: 'scheduleNotificationTwitchCheck', path: './src/functions/public/onNotificationTwitch' },
  { name: 'scheduleonNotificationFreeGamesCheck', path: './src/functions/public/onNotificationFreeGames' },
  { name: 'scheduleTempBanCheck', path: './src/functions/public/checkTempBans' },
  { name: 'Painel', path: './src/commands/initialize/painel' },
  { name: 'Help', path: './src/commands/public/help' },
  { name: 'searchGuild', path: './src/commands/public/searchGuild' },
  { name: 'menssageFile', path: './src/commands/public/mensage' },
  { name: 'Birthday', path: './src/commands/public/birthday' },
  { name: 'getWeather', path: './src/commands/public/weather' },
  { name: 'createEmbed', path: './src/commands/moderador/createEmbed' },
  { name: 'clean', path: './src/commands/moderador/clean' },
  { name: 'cargo', path: './src/commands/moderador/cargo' },
  { name: 'ticket', path: './src/commands/moderador/ticket' },
  { name: 'timeout', path: './src/commands/moderador/timeout' },
  { name: 'expulsar', path: './src/commands/moderador/expulsar' },
  { name: 'banUser', path: './src/commands/moderador/banUser' },
  { name: 'unbanUser', path: './src/commands/moderador/unbanUser' },
  { name: 'listTempBans', path: './src/commands/moderador/listTempBans' },
  { name: 'kickUser', path: './src/commands/moderador/kickUser' },
  { name: 'Ficha', path: './src/commands/moderador/ficha' },
  { name: 'voteParaBan', path: './src/commands/moderador/voteparaban' },
  { name: 'excluirComando', path: './src/commands/moderador/deleteCommand' },
  { name: 'backup', path: './src/commands/moderador/backup' },
  { name: 'bdServerConect', path: './src/database/bdServerConect' }
];

for (const mod of modules) {
  try {
    require(mod.path);
    console.log(`✅ ${mod.name} carregado com sucesso`);
  } catch (error) {
    console.error(`❌ Erro ao carregar ${mod.name}:`, error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

console.log('\n=== Todos os imports foram carregados com sucesso! ===');
