const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
    {
        guildId: {
            type: String,
            required: true,
            index: true,
            description: 'ID do servidor Discord'
        },
        title: {
            type: String,
            required: true
        },
        genre: {
            type: String,
            required: true
        },
        platform: {
            type: String,
            required: true
        },
        release_date: {
            type: String,
            required: true
        },
        createdAt: { 
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Índice composto para evitar notificações duplicadas de jogos grátis por guild
PostSchema.index({ guildId: 1, title: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model('gameNotification', PostSchema);
