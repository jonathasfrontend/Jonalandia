const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        index: true,
        description: 'ID do servidor Discord'
    },
    name: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

// Índice composto: cada guild pode ter canais com nomes únicos, mas guilds diferentes podem ter canais com o mesmo nome
channelSchema.index({ guildId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("youtubeChannel", channelSchema);
