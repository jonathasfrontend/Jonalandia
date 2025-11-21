const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    index: true,
    description: 'ID do servidor Discord'
  },
  targetUserId: {
    type: String,
    required: true
  },
  targetUsername: {
    type: String,
    required: true 
  },
  targetAvatarUrl: {
    type: String,
    required: true
  },
  startedBy: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: true
  },
  votes: [
    {
      userId: {
        type: String,
        required: true
      },
      username: {
        type: String,
        required: true
      },
      vote: {
        type: String,
        enum: ['sim', 'nao'],
        required: true },
    },
  ],
}, {
  timestamps: true
});

// Índice composto para evitar múltiplas votações para o mesmo usuário em uma guild
VoteSchema.index({ guildId: 1, targetUserId: 1 });

module.exports = mongoose.model('votoBanUser', VoteSchema);
