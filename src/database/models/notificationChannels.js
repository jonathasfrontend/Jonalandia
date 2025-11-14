const mongoose = require('mongoose');

const notificationChannelsSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    channelName: { type: String, required: true },
    notificationType: { type: String, enum: ['twitch', 'youtube', 'free_games', 'welcome', 'goodbye'], required: true },
}, { timestamps: true });

// Índice composto para garantir que apenas um canal de cada tipo por guild
notificationChannelsSchema.index({ guildId: 1, notificationType: 1 }, { unique: true });

const NotificationChannelsModel = mongoose.model('notificationChannels', notificationChannelsSchema);

module.exports = NotificationChannelsModel;
