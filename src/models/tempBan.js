const mongoose = require('mongoose');

const TempBanSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        required: true
    },
    bannedBy: {
        type: String,
        required: true
    },
    banReason: {
        type: String,
        required: true
    },
    banDate: {
        type: Date,
        default: Date.now
    },
    unbanDate: {
        type: Date,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Índice para otimizar consultas por data de unban
TempBanSchema.index({ unbanDate: 1, isActive: 1 });

const TempBan = mongoose.model('TempBan', TempBanSchema);

module.exports = { TempBan };
