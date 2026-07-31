# 🤖 Bot Jonalandia

<div align="center">

![Jonalandia](jonalandia.png)

**Bot Discord Multi-Guild para gerenciamento completo de servidores**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/jonathasfrontend/jonalandia)
[![Node.js](https://img.shields.io/badge/node.js-18%2B-green.svg)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/discord.js-14.23.2-7289da.svg)](https://discord.js.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-Custom-red.svg)](./LICENSE)

</div>

## 📋 Sumário

- [🚀 Sobre](#-sobre)
- [⚙️ Tecnologias](#️-tecnologias)
- [📦 Instalação](#-instalação)
- [🗄️ Estrutura do Projeto](#️-estrutura-do-projeto)
- [🎯 Comandos](#-comandos)
- [🔄 Sistemas Automáticos](#-sistemas-automáticos)
- [🛡️ Segurança](#️-segurança)
- [🗃️ Banco de Dados](#️-banco-de-dados)
- [📊 Logs](#-logs)
- [🤝 Contribuição](#-contribuição)

---

## 🚀 Sobre

O **Bot Jonalandia** é um bot Discord multi-guild focado em **moderação, segurança e automação**. Cada servidor possui configurações totalmente isoladas (canais, cargos, streamers, infrações), gerenciadas através de um painel visual com 6 páginas.

**Principais características:**
- 🛡️ **Segurança multicamadas** — anti-flood, bloqueio de links, palavras inadequadas e tipos de arquivo
- 🎛️ **Painel de configuração centralizado** (`/painel`) — configura tudo sem editar `.env`
- ⏰ **Banimentos temporários** com desbanimento automático
- 🎮 **Notificações automáticas** — Twitch, YouTube e jogos gratuitos (por servidor)
- 📊 **Sistema de infrações** e logs detalhados
- 🎫 **Sistema de tickets** de suporte

## ⚙️ Tecnologias

| Componente | Tecnologia |
|------------|------------|
| Runtime | Node.js 18+ |
| Framework | Discord.js 14 |
| Banco de Dados | Supabase (PostgreSQL) |
| Logs | Winston |
| Agendador | node-cron |

## 📦 Instalação

**Pré-requisitos:** Node.js 18+, um projeto no [Supabase](https://supabase.com/) e uma aplicação no [Discord Developer Portal](https://discord.com/developers/applications).

```bash
git clone https://github.com/jonathasfrontend/jonalandia.git
cd jonalandia
npm install
cp .env.example .env
```

**Variáveis de ambiente:**

```env
TOKEN=""                     # Token do bot (Discord Developer)
SUPABASE_URL=""              # Connection string PostgreSQL do Supabase (via pooler)
OPENWEATHER_API_KEY=""       # Chave da API OpenWeather (comando /clima)

# IDs de canais (logs e cargos)
CHANNEL_ID_CARGOS=''         # Canal de cargos
CHANNEL_ID_LOGS_INFO_BOT=''  # Canal de logs informativos
CHANNEL_ID_LOGS_ERRO_BOT=''  # Canal de logs de erro
```

**Inicie o bot:**

```bash
npm start          # produção
npm run dev        # desenvolvimento (nodemon)
```

As migrations (`src/database/migration.sql` e `migration_002.sql`) são executadas automaticamente na inicialização.

> 💡 Após adicionar o bot, use `/painel` em cada servidor para configurar canais, cargos, notificações e tickets. Não é preciso colocar IDs de canais/cargos no `.env`.

## 🗄️ Estrutura do Projeto

```
jonalandia/
├── 📁 src/
│   ├── 📁 commands/               # Comandos
│   │   ├── 📁 initialize/         #   painel.js (central de configuração)
│   │   ├── 📁 moderador/          #   comandos de moderação
│   │   └── 📁 public/             #   comandos públicos
│   ├── 📁 config/                 # Configurações em JSON (blockedLinks, InappropriateWords,
│   │                              #   blockedFileExtensions, punishmentConfig)
│   ├── 📁 database/               # Supabase (pg) + service.js + migrations SQL
│   ├── 📁 embedsDefault/          # Embeds padrão (regras, manutenção)
│   ├── 📁 functions/
│   │   ├── 📁 checkPunishments/   # antiFloodChat, blockLinks, detectInappropriateWords,
│   │   │                          #   blockFileTypes, kickNewMembers
│   │   ├── 📁 public/             # notificações Twitch/YouTube/jogos, boas-vindas, temp bans
│   │   └── 📁 system/             # guildManager, statusBot
│   ├── 📁 utils/                  # cache, checkUserImmune, saveUserInfractions, etc.
│   ├── 📁 logs/                   # Arquivos de log gerados
│   ├── 📄 Client.js               # Cliente Discord
│   ├── 📄 index.js                # Bootstrap + registro de comandos
│   └── 📄 logger.js               # Sistema de logs (Winston)
├── 📁 docs/                       # Documentação técnica
├── 📁 tests/                      # Testes de import
└── 📄 package.json
```

## 🎯 Comandos

### 👥 Públicos

| Comando | Descrição |
|---------|-----------|
| `/oi` | Saudação do bot |
| `/help` | Lista os comandos disponíveis |
| `/server` | Informações do servidor |
| `/clima` | Previsão do tempo para uma cidade |

### 🛡️ Moderação

| Comando | Descrição |
|---------|-----------|
| `/clean` | Limpa mensagens do canal (`tipo: usuario\|todas`, `quantidade`) |
| `/timeout` | Aplica timeout (`nivel`: Low 5min, Low Medium 10min, Medium 1h, High 24h) |
| `/banir` | Bane usuário (duração opcional configurável em `punishmentConfig.json`) |
| `/desbanir` | Desbane um usuário |
| `/listbans` | Lista bans temporários ativos |
| `/expulsar` | Expulsa um usuário do servidor |
| `/kickuser` | Expulsa um usuário do canal de voz |
| `/embed` | Cria um embed personalizado |
| `/ficha` | Busca a ficha completa do usuário (também disponível no menu de contexto) |
| `/voteparaban` | Inicia votação democrática para banir |
| `/excluicomando` | Exclui um comando do bot |
| `/ticket` | Mostra o painel de abertura de tickets |

### ⚙️ Configuração

| Comando | Descrição |
|---------|-----------|
| `/painel` | Central de configuração (owner/admin/moderador) com 6 páginas |

**Páginas do `/painel`:**

| Página | Conteúdo |
|--------|----------|
| 1 | Registrar/remover canais monitorados |
| 2 | Enviar embeds padrão (regras, manutenção) |
| 3 | Cadastrar streamers Twitch e canais YouTube + canais de notificação |
| 4 | Canais de jogos gratuitos, boas-vindas e despedida |
| 5 | Sistema de tickets (canal, categoria, cargo de suporte) |
| 6 | Cargos (Moderador, Imune, Novo Membro) |

## 🔄 Sistemas Automáticos

| Sistema | Frequência | Descrição |
|---------|------------|-----------|
| YouTube | 5 min | Notifica novos vídeos de canais cadastrados |
| Twitch | 3 min | Notifica quando streamers entram ao vivo |
| Jogos gratuitos | 6 h | Alerta sobre jogos gratuitos |
| Bans temporários | 1 min | Desbane automaticamente quando o tempo expira |
| Membros | tempo real | Boas-vindas, despedida e cargo de novo membro |

## 🛡️ Segurança

| Sistema | Comportamento |
|---------|---------------|
| **Anti-flood** | Janela de 15s (8 mensagens), avisos progressivos (3) e timeout de 5 min; avisos zeram após 5 min de silêncio. Configurável em `punishmentConfig.json` |
| **Bloqueio de links** | Bloqueia padrões de `blockedLinks.json` |
| **Palavras inadequadas** | Filtra por lista em `InappropriateWords.json` |
| **Tipos de arquivo** | Bloqueia extensões de `blockedFileExtensions.json` |
| **Novos membros** | Kick automático de contas suspeitas |

Todos os sistemas **respeitam cargos imunes** (configurados no `/painel`) e **registram infrações** no banco por servidor.

## 🗃️ Banco de Dados

O bot usa **Supabase (PostgreSQL)** com as seguintes tabelas:

| Tabela | Propósito |
|--------|-----------|
| `guild_configs` | Configurações por servidor |
| `channels_server` | Canais monitorados |
| `infractions_users` | Histórico de infrações por usuário |
| `temp_bans` | Banimentos temporários |
| `ticket_configs` | Configuração de tickets |
| `role_permissions` | Cargos de moderação/imune/novo membro |
| `vote_ban_users` | Votações de ban |
| `notification_channels` | Canais de notificação por tipo |
| `notification_twitch` | Cache de notificações Twitch |
| `notification_youtube` | Cache de notificações YouTube |
| `streamers` | Streamers Twitch monitorados |
| `youtube_channels` | Canais YouTube monitorados |
| `game_notifications` | Cache de jogos notificados |

O acesso é feito através de `src/database/service.js`, que converte automaticamente colunas `snake_case` para `camelCase`.

## 📊 Logs

Logs via **Winston** em `src/logs/`, com rotação automática (5MB):

- `bot.log` — todos os níveis (silly a error)
- `error.log` — apenas erros
- `warn.log` — avisos
- `exceptions.log` / `rejections.log` — exceções e rejeições não tratadas

Contexto rico por registro: `[MÓDULO]`, `{comando}`, `<usuário>`, `(servidor)`.

## 🤝 Contribuição

1. Faça um fork do repositório
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Faça commit das mudanças
4. Envie para a branch e abra um **Pull Request**

---

### 📋 Documentos Importantes

- [Política de Privacidade](./PRIVACY_POLICY.md)
- [Termos de Serviço](./TERMS_OF_SERVICE.md)
- [Licença](./LICENSE)

### 👤 Autor

- **Jonathas Oliveira** — [@jonathasfrontend](https://github.com/jonathasfrontend)
