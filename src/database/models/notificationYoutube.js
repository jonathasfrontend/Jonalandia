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
        author: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        description: {
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
PostSchema.index({ guildId: 1, title: 1, author: 1 }, { unique: true });

module.exports = mongoose.model('notificationYoutube', PostSchema);