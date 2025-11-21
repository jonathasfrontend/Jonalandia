const mongoose = require('mongoose');

/**
 * Schema de configuração por guild (servidor Discord)
 * Armazena todas as configurações específicas de cada servidor onde o bot está instalado
 */
const guildConfigSchema = new mongoose.Schema(
  {
    // Identificação da guild
    guildId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      description: 'ID único do servidor Discord'
    },
    guildName: {
      type: String,
      required: true,
      description: 'Nome do servidor Discord'
    },
    ownerId: {
      type: String,
      required: true,
      description: 'ID do dono do servidor'
    },
    ownerTag: {
      type: String,
      description: 'Tag do dono do servidor (username#discriminator ou username)'
    },
    
    // Status e controle
    isActive: {
      type: Boolean,
      default: true,
      description: 'Se o bot está ativo neste servidor'
    },
    botAddedAt: {
      type: Date,
      default: Date.now,
      description: 'Data em que o bot foi adicionado ao servidor'
    },
    leftAt: {
      type: Date,
      description: 'Data em que o bot saiu do servidor (se aplicável)'
    },

    // Canais de notificação e logs
    welcomeChannelId: {
      type: String,
      description: 'Canal para mensagens de boas-vindas'
    },
    goodbyeChannelId: {
      type: String,
      description: 'Canal para mensagens de despedida'
    },
    logsInfoChannelId: {
      type: String,
      description: 'Canal para logs de informações gerais'
    },
    logsErrorChannelId: {
      type: String,
      description: 'Canal para logs de erros'
    },
    rulesChannelId: {
      type: String,
      description: 'Canal de regras do servidor'
    },

    // Cargos (roles)
    moderatorRoleId: {
      type: String,
      description: 'ID do cargo de moderador'
    },
    immuneRoleId: {
      type: String,
      description: 'ID do cargo imune a punições automáticas'
    },
    newMemberRoleId: {
      type: String,
      description: 'ID do cargo dado a novos membros'
    },

    // Configurações de punições
    punishmentConfig: {
      antiFlood: {
        enabled: { type: Boolean, default: true },
        maxMessages: { type: Number, default: 5 },
        timeWindow: { type: Number, default: 5000 }, // ms
        action: { type: String, enum: ['warn', 'timeout', 'kick', 'ban'], default: 'timeout' }
      },
      blockLinks: {
        enabled: { type: Boolean, default: true },
        whitelist: [{ type: String }],
        action: { type: String, enum: ['warn', 'delete', 'timeout', 'kick'], default: 'delete' }
      },
      inappropriateWords: {
        enabled: { type: Boolean, default: true },
        action: { type: String, enum: ['warn', 'delete', 'timeout', 'kick'], default: 'delete' }
      },
      blockFileTypes: {
        enabled: { type: Boolean, default: true },
        blockedExtensions: [{ type: String }],
        action: { type: String, enum: ['warn', 'delete'], default: 'delete' }
      },
      kickNewMembers: {
        enabled: { type: Boolean, default: false },
        minAccountAge: { type: Number, default: 7 }, // dias
        action: { type: String, enum: ['kick', 'warn'], default: 'kick' }
      }
    },

    // Configurações adicionais
    prefix: {
      type: String,
      default: '!',
      description: 'Prefixo de comandos (caso use comandos de texto)'
    },
    language: {
      type: String,
      default: 'pt-BR',
      enum: ['pt-BR', 'en-US', 'es-ES'],
      description: 'Idioma do bot neste servidor'
    },
    timezone: {
      type: String,
      default: 'America/Sao_Paulo',
      description: 'Fuso horário do servidor'
    },

    // Metadados
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      description: 'Notas administrativas sobre este servidor'
    }
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
    collection: 'guildConfigs'
  }
);

// Índices para otimização de queries
guildConfigSchema.index({ guildId: 1 }, { unique: true });
guildConfigSchema.index({ isActive: 1 });
guildConfigSchema.index({ ownerId: 1 });

// Middleware para atualizar lastUpdated antes de salvar
guildConfigSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

// Métodos do schema
guildConfigSchema.methods.deactivate = function () {
  this.isActive = false;
  this.leftAt = new Date();
  return this.save();
};

guildConfigSchema.methods.activate = function () {
  this.isActive = true;
  this.leftAt = null;
  return this.save();
};

// Métodos estáticos
guildConfigSchema.statics.findByGuildId = function (guildId) {
  return this.findOne({ guildId, isActive: true });
};

guildConfigSchema.statics.getAllActiveGuilds = function () {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('GuildConfig', guildConfigSchema);
