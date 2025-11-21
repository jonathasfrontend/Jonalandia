# 🌐 Recursos Multi-Guild do Bot Jonalandia

## 📋 Visão Geral

O Bot Jonalandia v2.0 foi completamente refatorado para suportar **múltiplos servidores Discord simultaneamente** com **isolamento total de dados**. Esta atualização representa uma mudança arquitetural significativa que permite que o bot seja instalado em dezenas ou até centenas de servidores, cada um com suas próprias configurações independentes.

## ✨ Principais Recursos

### 🔒 Isolamento Completo de Dados

Cada servidor Discord (guild) possui:

- **Configurações Próprias**: Canais, cargos, e preferências únicas
- **Streamers Independentes**: Lista própria de streamers da Twitch monitorados
- **Canais YouTube Separados**: Canais YouTube diferentes para cada servidor
- **Histórico de Infrações Isolado**: Infrações de usuários registradas por servidor
- **Notificações Personalizadas**: Canais de notificação específicos para cada guild
- **Sistema de Tickets Próprio**: Configuração de tickets independente

### 🤖 Auto-Registro de Guilds

Quando o bot é adicionado a um novo servidor:

1. **Detecção Automática**: Evento `guildCreate` é capturado
2. **Criação de Configuração**: Um documento `GuildConfig` é criado automaticamente
3. **Notificação ao Owner**: O dono do servidor recebe uma DM com instruções
4. **Estado Ativo**: O servidor é marcado como ativo no banco de dados
5. **Pronto para Uso**: Basta executar `/painel` para configurar

### 🔄 Gerenciamento de Ciclo de Vida

#### Entrada em novo Servidor (`guildCreate`)

```javascript
// Ações executadas automaticamente:
✓ Cria registro na coleção guildConfigs
✓ Registra guildId, ownerId, nome do servidor
✓ Define configurações padrão
✓ Marca como isActive: true
✓ Envia DM ao owner com instruções
✓ Loga informações no sistema
```

#### Saída de Servidor (`guildDelete`)

```javascript
// Ações executadas automaticamente:
✓ Marca guild como isActive: false
✓ Preserva todos os dados (não deleta)
✓ Permite reativação se bot retornar
✓ Loga informações de remoção
```

## 📊 Estrutura de Dados

### GuildConfig Model

```javascript
{
  guildId: String,              // ID único do servidor (unique, required)
  guildName: String,            // Nome do servidor
  ownerId: String,              // ID do dono do servidor
  ownerTag: String,             // Tag do dono (username#1234)
  isActive: Boolean,            // Se o servidor está ativo (default: true)
  
  // Canais configurados
  welcomeChannelId: String,     // Canal de boas-vindas
  goodbyeChannelId: String,     // Canal de despedida
  logsInfoChannelId: String,    // Canal de logs informativos
  logsErrorChannelId: String,   // Canal de logs de erro
  
  // Cargos configurados (obsoleto - migrado para rolePermissions)
  moderatorRoleId: String,      // Cargo de moderador
  immuneRoleId: String,         // Cargo imune a punições
  newMemberRoleId: String,      // Cargo de novo membro
  
  // Configurações de punição
  punishmentConfig: {
    antiFlood: {
      enabled: Boolean,         // Anti-flood ativo (default: true)
      maxMessages: Number,      // Máximo de mensagens (default: 5)
      timeWindow: Number,       // Janela de tempo em ms (default: 10000)
      punishment: String        // Tipo de punição (default: 'timeout')
    },
    blockLinks: {
      enabled: Boolean,         // Bloqueio de links ativo (default: true)
      whitelist: [String]       // Links permitidos
    },
    inappropriateWords: {
      enabled: Boolean,         // Filtro de palavras ativo (default: true)
      customWords: [String]     // Palavras personalizadas
    }
  },
  
  // Timestamps
  botAddedAt: Date,             // Data de adição do bot (default: Date.now)
  lastUpdated: Date,            // Última atualização (auto-atualizado)
  deactivatedAt: Date           // Data de desativação (se aplicável)
}
```

### Coleções com guildId

Todas as seguintes coleções agora incluem o campo `guildId` para isolamento:

- ✅ `streamers` - Streamers da Twitch por servidor
- ✅ `youtubeChannel` - Canais YouTube por servidor
- ✅ `notificationChannels` - Canais de notificação por servidor
- ✅ `notificationTwitch` - Cache de notificações Twitch por servidor
- ✅ `notificationYoutube` - Cache de notificações YouTube por servidor
- ✅ `gameNotification` - Notificações de jogos por servidor
- ✅ `infracoesUsers` - Infrações de usuários por servidor
- ✅ `tempBan` - Banimentos temporários por servidor
- ✅ `votoBanUser` - Votações de ban por servidor
- ✅ `ticketConfig` - Configuração de tickets por servidor
- ✅ `rolePermissions` - Permissões de cargos por servidor
- ✅ `addChannel` - Canais registrados por servidor

### Índices Compostos

Para performance otimizada, todas as coleções possuem índices compostos:

```javascript
// Exemplo: Streamers
{
  guildId: 1,
  name: 1
}
// Permite busca rápida de streamers específicos de um servidor
```

## 🔧 Sistemas Refatorados

### 📢 Sistema de Notificações

#### Twitch Monitor

```javascript
// Antes (single-guild):
- Buscava TODOS os streamers
- Enviava notificações para UM canal fixo

// Depois (multi-guild):
✓ Busca guilds ativas (isActive: true)
✓ Para cada guild, busca seus streamers (filter: guildId)
✓ Verifica status de cada streamer via Twitch API
✓ Envia notificação no canal configurado DAQUELA guild
✓ Salva cache de notificação com guildId
```

#### YouTube Monitor

```javascript
// Antes (single-guild):
- Buscava TODOS os canais YouTube
- Enviava notificações para UM canal fixo

// Depois (multi-guild):
✓ Busca guilds ativas (isActive: true)
✓ Para cada guild, busca seus canais YouTube (filter: guildId)
✓ Verifica vídeos novos via DecAPI/YouTube API
✓ Envia notificação no canal configurado DAQUELA guild
✓ Salva cache de notificação com guildId
```

#### Free Games Monitor

```javascript
// Antes (single-guild):
- Enviava notificações para UM canal fixo

// Depois (multi-guild):
✓ Busca guilds ativas (isActive: true)
✓ Busca canal de free games de cada guild
✓ Envia notificação para CADA servidor que configurou
✓ Salva registro com guildId para evitar duplicatas
```

### 🎛️ Comando /painel

O comando `/painel` agora:

- ✅ Verifica permissões específicas (Owner, Admin ou Moderador configurado)
- ✅ Filtra todos os dados pelo `guildId` da interaction
- ✅ Cria/atualiza registros com `guildId` automaticamente
- ✅ Garante isolamento total entre servidores

#### Verificação de Permissões

```javascript
// Três níveis de acesso:
1. Dono do Servidor (guild.ownerId === user.id)
2. Administrador (member.permissions.has('Administrator'))
3. Cargo de Moderador (rolePermissions.moderatorRoleId)

// Se nenhum: Acesso Negado com mensagem explicativa
```

## 🔄 Migração de Dados Existentes

### Script de Migração

Para usuários que já possuem dados de um único servidor, criamos um script interativo de migração:

```bash
node scripts/migrateToMultiGuild.js
```

**O que o script faz:**

1. ✅ Valida conexão com MongoDB
2. ✅ Verifica se `DEFAULT_GUILD_ID` está configurado
3. ✅ Migra 7 coleções principais
4. ✅ Adiciona campo `guildId` a todos os documentos existentes
5. ✅ Cria índices compostos otimizados
6. ✅ Exibe resumo detalhado da migração
7. ✅ Confirma com usuário antes de aplicar mudanças
8. ✅ Suporta rollback em caso de erro

**Coleções Migradas:**

- `streamers`
- `youtubeChannel`
- `infracoesUsers`
- `notificationTwitch`
- `notificationYoutube`
- `votoBanUser`
- `gameNotification`

### Configuração para Migração

```env
# Adicione ao .env antes de executar a migração
DEFAULT_GUILD_ID=123456789012345678
```

## 📚 Documentação Adicional

- 📖 [Guia Completo de Refatoração](./refactor-multi-guild.md)
- 📖 [README de Migração](../scripts/README_MIGRATION.md)
- 📖 [Checklist de QA](../tests/QA_CHECKLIST.md)
- 📖 [CHANGELOG v2.0.0](../CHANGELOG.md)

## ⚠️ Notas Importantes

### Backwards Compatibility

- ⚠️ **Não é retrocompatível** sem migração
- ⚠️ Dados antigos precisam ser migrados usando o script fornecido
- ⚠️ IDs hardcoded no código foram removidos

### Variáveis de Ambiente Descontinuadas

As seguintes variáveis de ambiente **não são mais usadas** (substituídas por configuração via `/painel`):

```env
# ❌ Descontinuadas (não apagar ainda - usar para migração):
CHANNEL_ID_NOTIFICATION_TWITCH
CHANNEL_ID_NOTIFICATION_YOUTUBE
CHANNEL_ID_NOTIFICATION_FREE_GAMES
CHANNEL_ID_WELCOME
CHANNEL_ID_GOODBYE
CHANNEL_ID_LOGS_INFO_BOT
CHANNEL_ID_LOGS_ERRO_BOT
CARGO_MODERADOR
CARGO_IMUNE
```

**Após migração bem-sucedida**, essas variáveis podem ser removidas do `.env`.

### Nova Abordagem

```javascript
// ✅ Agora: Busca do banco de dados por guildId
const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
const channelId = guildConfig.welcomeChannelId;

const roleConfig = await RolePermissions.findOne({ guildId: interaction.guild.id });
const moderatorRoleId = roleConfig.moderatorRoleId;
```

## 🎯 Benefícios da Arquitetura Multi-Guild

### Para Desenvolvedores

- ✅ **Escalabilidade**: Suporte ilimitado de servidores
- ✅ **Manutenibilidade**: Código mais limpo e organizado
- ✅ **Debugging**: Fácil identificar problemas por servidor
- ✅ **Testing**: Testes isolados por guild
- ✅ **Performance**: Índices otimizados para queries por guild

### Para Usuários

- ✅ **Privacidade**: Dados completamente isolados entre servidores
- ✅ **Flexibilidade**: Cada servidor configura conforme necessário
- ✅ **Autonomia**: Donos de servidor têm controle total
- ✅ **Facilidade**: Setup simples via painel interativo
- ✅ **Confiabilidade**: Sistema robusto e testado

### Para Comunidades

- ✅ **Independência**: Streamers e canais únicos por comunidade
- ✅ **Personalização**: Notificações relevantes para cada público
- ✅ **Moderação**: Histórico de infrações específico do servidor
- ✅ **Organização**: Configurações centralizadas e fáceis de gerenciar

## 🚀 Próximos Passos

Após entender a arquitetura multi-guild:

1. **Leia o [Guia de Migração](../scripts/README_MIGRATION.md)** se possui dados existentes
2. **Execute o comando `/painel`** em seu servidor
3. **Configure os canais de notificação** desejados
4. **Adicione streamers e canais** para monitoramento
5. **Configure cargos e permissões** conforme necessário

---

**Desenvolvido com ❤️ por Jonathas Oliveira**

*Bot Jonalandia v2.0.0 - Multi-Guild Architecture*
