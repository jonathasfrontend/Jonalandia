const mongoose = require("mongoose");

const streamersSchema = new mongoose.Schema({
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

// Índice composto: cada guild pode ter streamers com nomes únicos, mas guilds diferentes podem ter streamers com o mesmo nome
streamersSchema.index({ guildId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("streamers", streamersSchema);
