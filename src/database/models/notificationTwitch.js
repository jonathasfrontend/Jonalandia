const mongoose = require('mongoose')

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
        streamer: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        gamer: {
            type: String,
            required: true
        },
        notifiedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Índice composto para evitar notificações duplicadas por guild
PostSchema.index({ guildId: 1, title: 1, streamer: 1 }, { unique: true });

module.exports = mongoose.model('notificationTwitch', PostSchema);