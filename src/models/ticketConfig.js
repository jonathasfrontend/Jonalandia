const mongoose = require('mongoose');

const ticketConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true }, // Canal onde será enviado o painel de tickets
    categoryId: { type: String, required: true }, // Categoria onde os tickets serão criados
    supportRoleId: { type: String, required: true }, // Cargo que terá acesso aos tickets
}, { timestamps: true });

const TicketConfigModel = mongoose.model('ticketConfig', ticketConfigSchema);

module.exports = TicketConfigModel;
