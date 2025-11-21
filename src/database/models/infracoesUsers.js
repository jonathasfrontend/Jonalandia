const mongoose = require('mongoose');

const UserSchemaInfraction = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        index: true,
        description: 'ID do servidor Discord'
    },
    userId: { 
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    avatarUrl: {
        type: String,
        required: true
    },
    accountCreatedDate: {
        type: Date,
        required: true
    },
    joinedServerDate: { 
        type: Date,
        required: true
    },
    infractions: {
        timeouts: {
            type: Number,
            default: 0
        },
        inappropriateLanguage: {
            type: Number,
            default: 0
        },
        voiceChannelKicks: {
            type: Number,
            default: 0
        },
        bans: {
            type: Number,
            default: 0
        },
        unbans: {
            type: Number,
            default: 0
        },
        floodTimeouts: {
            type: Number,
            default: 0
        },
        blockedFiles: {
            type: Number,
            default: 0
        },
        serverLinksPosted: {
            type: Number,
            default: 0
        },
        expulsion: {
            type: Number,
            default: 0
        },
        warns: {
            type: Number,
            default: 0
        }
    },
    logs: [
        {
            id: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            },
            reason: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                required: true
            },
            moderator: {
                type: String,
                required: true
            }
        }
    ]
}, {
    timestamps: true
});

// Índice composto: cada usuário é único por guild
UserSchemaInfraction.index({ guildId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('infractionsUsers', UserSchemaInfraction);
