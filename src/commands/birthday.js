const { Logger, botEvent, commandExecuted } = require('../logger');
const onNotificationBirthdaySchema = require('../models/onNotificationBirthdaySchema');
const { checkingComandChannelBlocked } = require("../utils/checkingComandsExecution");

async function Birthday(interaction) {

    if (!interaction.isCommand()) return;

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;

    const day = interaction.options.getInteger('dia');
    const month = interaction.options.getInteger('mes');
    const userId = interaction.user.id;
    const username = interaction.user.username;

    if (day < 1 || day > 31 || month < 1 || month > 12) {
        Logger.error(`Data inválida fornecida por ${username}: ${day}/${month}`);
        return interaction.reply({ content: 'Por favor, insira uma data válida.', ephemeral: true });
    }

    const birthday = new onNotificationBirthdaySchema({
        userId,
        name: username,
        day,
        month,
    });

    botEvent('birthday', interaction);
    await birthday.save();

    await interaction.reply({ content: `<:feliz:1402690475634458664> ┃ Aniversário salvo: ${day}/${month}`, ephemeral: true });
    Logger.info(`Aniversário salvo para ${username}: ${day}/${month}`);

}

module.exports = { Birthday };