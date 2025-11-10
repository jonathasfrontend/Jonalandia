# 🤖 Bot Jonalandia

<div align="center">

![Jonalandia](jonalandia.png)

**Um bot Discord para Gerenciamento do servidor Jonalandia**

[![Version](https://img.shields.io/badge/version-10.2.4-blue.svg)](https://github.com/jonathasfrontend/jonalandia)
[![Node.js](https://img.shields.io/badge/node.js-16%2B-green.svg)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/discord.js-14.14.1-7289da.svg)](https://discord.js.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-8.8.0-green.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/license-Custom-red.svg)](./LICENSE)
</div>


## 📋 Sumário

- [🚀 Introdução](#-introdução)
  - [🆕 Novidades da Versão 10.2.4](#-novidades-da-versão-1021)
- [⚡ Visão Geral](#-visão-geral)
- [📦 Instalação e Configuração](#-instalação-e-configuração)
- [🏗️ Estrutura do Projeto](#️-estrutura-do-projeto)
- [🎯 Comandos Disponíveis](#-comandos-disponíveis)
  - [🎛️ Comando /painel](#️-comando-painel---central-de-configuração-do-bot)
- [🔧 Funcionalidades Automáticas](#-funcionalidades-automáticas)
- [🛡️ Sistema de Segurança](#️-sistema-de-segurança)
- [📊 Sistema de Logs Avançado](#-sistema-de-logs-avançado)
- [🗄️ Estrutura do Banco de Dados (MongoDB)](#️-estrutura-do-banco-de-dados-mongodb)
- [🔔 Sistema de Notificações](#-sistema-de-notificações)
- [⚙️ Configuração Avançada](#️-configuração-avançada)
- [🐛 Resolução de Problemas](#-resolução-de-problemas)
  - [❓ Perguntas Frequentes (FAQ)](#-perguntas-frequentes-faq)
- [🤝 Contribuição](#-contribuição)

---

## 🚀 Introdução

O **Bot Jonalandia** é uma solução completa e avançada para servidores Discord, desenvolvida com foco na automação de tarefas de moderação, engajamento da comunidade e experiência personalizada. Criado por **Jonathas Oliveira**, o bot combina mais de 25 comandos especializados, sistema de logs avançado e funcionalidades de segurança.

### � Novidades da Versão 10.2.4

- ✨ **Painel de Configuração Unificado** - Novo comando `/painel` com interface moderna usando Containers V2
- 🎫 **Sistema de Tickets Completo** - Configuração integrada através do painel
- ⏰ **Banimentos Temporários** - Gerenciamento automático de bans com tempo definido
- 🔔 **Gerenciamento Centralizado de Notificações** - Configuração de todos os canais em um só lugar
- 📊 **Interface Aprimorada** - Navegação por páginas com componentes visuais avançados
- 🗄️ **Novos Schemas de Banco** - `notificationChannels`, `tempBan` e `ticketConfig`

### �🎯 Principais Características

- **Sistema de Moderação Completo** - Ferramentas avançadas para administração do servidor
- **Painel de Configuração Centralizado** - Interface moderna para configuração completa do bot
- **Segurança Multicamadas** - Anti-flood avançado com avisos progressivos, detecção de links maliciosos e palavras inadequadas
- **Sistema de Logs Profissional** - Monitoramento detalhado de todas as atividades
- **Notificações Inteligentes** - Monitoramento de YouTube, Twitch e jogos gratuitos
- **Interface Moderna** - Embeds personalizados e componentes interativos (Containers V2)

---

## ⚡ Visão Geral

### 📊 Especificações Técnicas

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| **Runtime** | Node.js | 16+ |
| **Framework Discord** | Discord.js | 14.14.1 |
| **Banco de Dados** | MongoDB | 8.8.0 |
| **Sistema de Logs** | Winston | 3.17.0 |
| **Agendador** | Node-Cron | 3.0.3 |

### 🏆 Recursos Principais

- ✅ **25+ Comandos Especializados** - Cobrindo moderação, configuração e utilidades
- ✅ **Painel de Configuração Interativo** - Setup completo através de interface visual moderna
- ✅ **Sistema de Logs Avançado** - 6 níveis de log com rotação automática
- ✅ **Segurança Multicamadas** - Proteção contra spam, links e conteúdo inadequado
- ✅ **Notificações Inteligentes** - Monitoramento de plataformas externas (Twitch, YouTube)
- ✅ **Interface Moderna** - Embeds responsivos e componentes interativos (Containers V2)
- ✅ **Sistema de Tickets** - Suporte organizado através de tickets
- ✅ **Banimentos Temporários** - Gerenciamento automático de bans temporários

---

## 📦 Instalação e Configuração

### 🔧 Pré-requisitos

- **Node.js** versão 16 ou superior
- **npm** ou **yarn** para gerenciamento de pacotes
- **MongoDB** para armazenamento de dados
- **Conta Discord Developer** para token do bot

### ⚙️ Instalação Rápida

1. **Clone o repositório:**
```bash
git clone https://github.com/jonathasfrontend/jonalandia.git
cd jonalandia
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

4. **Configure o arquivo `.env`:**
```env
# Bot Configuration
TOKEN=seu_token_do_discord_bot
MONGO_URI=mongodb://localhost:27017/jonalandia

# Channel IDs
CHANNEL_ID_LOGS_INFO_BOT=id_do_canal_logs_info
CHANNEL_ID_LOGS_ERRO_BOT=id_do_canal_logs_erro
CHANNEL_ID_CARGOS=id_do_canal_cargos

# Role IDs
CARGO_MODERADOR=id_do_cargo_moderador
CARGO_MEMBRO=id_do_cargo_membro
CARGO_MEMBRO_PLUS=id_do_cargo_membro_plus

# External APIs
OPENWEATHER_API_KEY=sua_chave_api_clima
YOUTUBE_API_KEY=sua_chave_api_youtube
TWITCH_CLIENT_ID=seu_client_id_twitch
TWITCH_CLIENT_SECRET=seu_client_secret_twitch

```

5. **Inicie o bot:**
```bash
npm start
```

6. **Configure o bot através do painel:**
```
Após o bot estar online em seu servidor:
1. Execute o comando /painel
2. Configure os canais de notificação
3. Adicione streamers e canais do YouTube (opcional)
4. Configure o sistema de tickets (opcional)
```

### 🔒 Configuração de Segurança

Para máxima segurança, configure:

1. **Permissões do Bot:**
   - Administrator (recomendado para funcionalidade completa)
   - Ou permissões específicas: Manage Messages, Kick Members, Ban Members, etc.

2. **Canais de Log:**
   - Canal para logs informativos
   - Canal para logs de erro
   - Canais com acesso restrito a moderadores

---

## 🏗️ Estrutura do Projeto

```
jonalandia/
├── 📁 src/
│   ├── 📁 commands/           # Comandos do bot
│   │   ├── 📁 initialize/     # Comandos de inicialização e configuração
│   │   │   └── 📄 painel.js   # Central de configuração do bot
│   │   ├── 📁 moderador/      # Comandos de moderação
│   │   └── 📁 public/         # Comandos públicos/usuários
│   ├── 📁 config/             # Configurações do sistema
│   │   ├── � blockedFileExtensions.json    # Extensões bloqueadas
│   │   ├── 📄 blockedLinks.json             # Links bloqueados
│   │   ├── 📄 InappropriateWords.json       # Palavras inadequadas
│   │   └── � punishmentConfig.json         # Configurações de punições
│   ├── 📁 database/           # Conexão com MongoDB
│   │   └── 📄 bdServerConect.js
│   ├── 📁 embedsDefault/      # Embeds padrão do bot
│   │   ├── 📄 embedManutencao.js
│   │   └── 📄 embedRegra.js
│   ├── 📁 functions/          # Funções automáticas
│   │   ├── 📁 checkPunishments/ # Funções de segurança
│   │   │   ├── 📄 antiFloodChat.js
│   │   │   ├── 📄 blockFileTypes.js
│   │   │   ├── 📄 blockLinks.js
│   │   │   ├── 📄 detectInappropriateWords.js
│   │   │   └── 📄 kickNewMembers.js
│   │   └── 📁 public/         # Funções públicas automáticas
│   │       ├── 📄 checkBirthdays.js
│   │       ├── 📄 checkTempBans.js
│   │       ├── 📄 onMemberAdd.js
│   │       ├── 📄 onMemberRemove.js
│   │       ├── 📄 onNotificationFreeGames.js
│   │       ├── � onNotificationTwitch.js
│   │       ├── 📄 onNotificationYoutube.js
│   │       ├── 📄 ruleMembreAdd.js
│   │       └── 📄 statusBot.js
│   ├── �📁 models/             # Esquemas do banco de dados (MongoDB)
│   │   ├── 📄 addChannel.js
│   │   ├── 📄 gameNotification.js
│   │   ├── 📄 infracoesUsers.js
│   │   ├── 📄 notificationBirthday.js
│   │   ├── 📄 notificationChannels.js
│   │   ├── 📄 notificationTwitch.js
│   │   ├── 📄 notificationYoutube.js
│   │   ├── 📄 streamers.js
│   │   ├── 📄 tempBan.js
│   │   ├── � ticketConfig.js
│   │   ├── 📄 votoBanUser.js
│   │   └── 📄 youtubeChannel.js
│   ├── �📁 utils/              # Utilitários e helpers
│   │   ├── 📄 checkingComandsExecution.js
│   │   └── 📄 saveUserInfractions.js
│   ├── 📁 logs/               # Arquivos de log
│   ├── 📄 Client.js           # Cliente Discord customizado
│   ├── 📄 index.js            # Arquivo principal de inicialização
│   └── 📄 logger.js           # Sistema de logs profissional
├── 📁 emotes/                 # Emotes customizados
├── 📄 package.json            # Dependências do projeto
├── 📄 README.md               # Documentação completa
├── 📄 LICENSE                 # Licença do projeto
├── 📄 PRIVACY_POLICY.md       # Política de privacidade
├── 📄 TERMS_OF_SERVICE.md     # Termos de serviço
├── 📄 cspell.json             # Configuração do spell checker
└── 📄 .env                    # Variáveis de ambiente (não versionado)
```

### 📊 Arquitetura Modular

O bot foi projetado com arquitetura modular para facilitar manutenção e expansão:

- **Core System** - Gerenciamento central do bot
- **Command System** - Sistema de comandos slash organizados por categoria
- **Event System** - Manipulação de eventos Discord
- **Security System** - Múltiplas camadas de proteção
- **Database System** - Integração com MongoDB
- **Logging System** - Sistema de logs profissional

---

## 🎯 Comandos Disponíveis

### 👥 Comandos Gerais (Usuários)

| Comando | Descrição | Uso |
|---------|-----------|-----|
| `/oi` | Saudação amigável | `/oi` |
| `/help` | Lista todos os comandos disponíveis | `/help` |
| `/server` | Informações detalhadas do servidor | `/server` |
| `/aniversario` | Registra data de aniversário | `/aniversario dia: 15 mes: 8` |
| `/clima` | Previsão do tempo para cidade | `/clima cidade: São Paulo` |
| `/sorteio` | Participa de sorteios ativos | `/sorteio` |
| `/infosorteio` | Informações sobre sorteios | `/infosorteio` |

### 🛡️ Comandos de Moderação

| Comando | Descrição | Uso | Permissão |
|---------|-----------|-----|-----------|
| `/regra` | Exibe regras do servidor | `/regra` | Moderador |
| `/clean` | Sistema unificado de limpeza de mensagens | Ver exemplos abaixo | Moderador |
| `/timeout` | Aplica timeout de 3 minutos | `/timeout usuario: @user` | Moderador |
| `/banir` | Bane usuário do servidor | `/banir usuario: @user` | Moderador |
| `/desbanir` | Remove ban de usuário | `/desbanir usuario: @user` | Moderador |
| `/listarbanstemporarios` | Lista todos os bans temporários ativos | `/listarbanstemporarios` | Moderador |
| `/expulsar` | Expulsa usuário de canal de voz | `/expulsar usuario: @user` | Moderador |
| `/kickuser` | Remove usuário de canal de voz | `/kickuser usuario: @user` | Moderador |
| `/embed` | Cria embed personalizado | `/embed titulo: "Título" descrição: "Texto"` | Moderador |
| `/ficha` | Informações detalhadas do usuário | `/ficha usuario: @user` | Moderador |
| `/voteparaban` | Inicia votação para banimento | `/voteparaban usuario: @user` | Moderador |
| `/backup` | Gera backup completo do banco de dados | `/backup` | Moderador |

#### 🧹 Comando `/clean` - Sistema Unificado de Limpeza

O comando `/clean` combina as funcionalidades dos antigos comandos `/clearall` e `/clearuser` em uma interface moderna e intuitiva:

**📋 Parâmetros:**
- `tipo` - Escolha o tipo de limpeza:
  - `🗑️ Limpar mensagens de um usuário específico`
  - `🧹 Limpar últimas mensagens do canal`
- `quantidade` - Número de mensagens a deletar (1-100)
- `usuario` - Usuário alvo (obrigatório apenas se tipo = usuário)

**💡 Exemplos de Uso:**

1. **Limpar mensagens de um usuário:**
   ```
   /clean tipo: usuário quantidade: 10 usuario: @JohnDoe
   ```
   *Remove as últimas 10 mensagens do usuário @JohnDoe*

2. **Limpar mensagens do canal:**
   ```
   /clean tipo: todas quantidade: 50
   ```
   *Remove as últimas 50 mensagens do canal atual*

**✅ Recursos:**
- ✨ Interface moderna com embeds estilizados
- 🔒 Verificações de permissão de moderador
- 📝 Logs automáticos das ações realizadas
- ⚡ Tratamento inteligente de erros
- 🛡️ Validação de mensagens com menos de 14 dias

#### 💾 Comando `/backup` - Sistema de Backup Completo

O comando `/backup` permite aos moderadores gerar um backup completo de todas as coleções do banco de dados MongoDB.

**📋 Funcionalidades:**
- 🗄️ Backup de todas as coleções do MongoDB
- 📁 Geração de arquivo JSON com dados organizados
- 📊 Informações detalhadas de cada coleção
- 🔐 Acesso restrito a moderadores
- 📤 Envio automático do arquivo por DM

**💡 Exemplo de Uso:**
```
/backup
```
*Gera backup completo e envia por mensagem privada*

**✅ Coleções Incluídas:**
- ✓ channelsServer - Canais cadastrados
- ✓ gameNotification - Notificações de jogos
- ✓ infractionsUsers - Infrações de usuários
- ✓ notificationBirthday - Aniversários cadastrados
- ✓ notificationChannels - Configurações de canais
- ✓ notificationTwitch - Cache de Twitch
- ✓ notificationYoutube - Cache de YouTube
- ✓ streamers - Streamers monitorados
- ✓ tempBan - Banimentos temporários
- ✓ ticketConfig - Configurações de tickets
- ✓ votoBanUser - Votações de banimento
- ✓ youtubeChannel - Canais YouTube monitorados

### 🎲 Comandos de Sorteio

| Comando | Descrição | Uso | Permissão |
|---------|-----------|-----|-----------|
| `/premiosorteio` | Define prêmio do sorteio | `/premiosorteio premio: "Discord Nitro"` | Moderador |
| `/sortear` | Realiza sorteio entre participantes | `/sortear` | Moderador |
| `/limpasorteio` | Limpa dados do sorteio atual | `/limpasorteio` | Moderador |

### 🛠️ Comandos de Gerenciamento

| Comando | Descrição | Uso | Permissão |
|---------|-----------|-----|-----------|
| `/cargo` | Exibe seletor de cargos | `/cargo` | Moderador |
| `/ticket` | Sistema de tickets de suporte | `/ticket` | Moderador |
| `/manutencao` | Aviso de manutenção | `/manutencao` | Moderador |
| `/excluicomando` | Remove comando do bot | `/excluicomando comando: nome` | Moderador |

### 🔧 Comandos de Inicialização

| Comando | Descrição | Uso | Permissão |
|---------|-----------|-----|-----------|
| `/painel` | Painel de configuração completo do bot | `/painel` | Moderador |

#### 🎛️ Comando `/painel` - Central de Configuração do Bot

O comando `/painel` é uma interface centralizada e moderna para configurar todas as funcionalidades do Bot Jonalandia. Este painel utiliza componentes visuais avançados do Discord (Containers V2) e oferece navegação intuitiva através de múltiplas páginas.

**📋 Características do Painel:**

- 🎨 **Interface Moderna**: Utiliza Containers V2 do Discord com design profissional
- 📑 **5 Páginas de Configuração**: Organizado por categorias funcionais
- 🔄 **Navegação Intuitiva**: Botões de anterior/próximo para navegar entre páginas
- 🔒 **Acesso Restrito**: Disponível apenas para moderadores
- 💾 **Configuração Persistente**: Todas as configurações são salvas no MongoDB
- 🎯 **Interface Unificada**: Substitui múltiplos comandos de configuração individuais

**📄 Páginas do Painel:**

**Página 1 - 🗨️ Registro de Canais**
- ✅ **Adicionar todos os canais**: Registra automaticamente todos os canais de texto do servidor
- ✅ **Adicionar canal específico**: Seleciona e adiciona um canal individualmente
- ✅ **Remover canal específico**: Remove um canal do sistema de gerenciamento

**Página 2 - 📦 Envio de Embeds Padrão**
- ✅ **Enviar embed de regras**: Envia mensagem formatada com as regras do servidor
- ✅ **Enviar embed de manutenção**: Envia notificação de manutenção programada

**Página 3 - 🎮 Configuração de Streamers**
- ✅ **Cadastrar streamer Twitch**: Adiciona streamer para monitoramento de lives
- ✅ **Cadastrar canal YouTube**: Adiciona canal para notificação de novos vídeos
- ✅ **Configurar canais de notificação**: Define onde as notificações serão enviadas

**Página 4 - 🔔 Notificações e Eventos**
- ✅ **Canal de jogos gratuitos**: Define canal para notificações de jogos grátis
- ✅ **Canal de boas-vindas**: Configura mensagens automáticas para novos membros
- ✅ **Canal de despedida**: Configura mensagens quando membros saem do servidor

**Página 5 - 🎫 Sistema de Tickets**
- ✅ **Canal do painel de tickets**: Define onde o painel de tickets será exibido
- ✅ **Categoria dos tickets**: Seleciona categoria onde tickets serão criados
- ✅ **Cargo de suporte**: Define qual cargo terá acesso aos tickets

**💡 Exemplo de Uso:**

```
/painel
```

**🔧 Funcionalidades Técnicas:**

- **Componentes Reutilizáveis**: Factory pattern para otimização de memória
- **Handlers Especializados**: Sistema modular de processamento de interações
- **Validações Integradas**: Verificação automática de permissões e tipos de canal
- **Sistema de Logs**: Registro detalhado de todas as configurações realizadas
- **Gerenciamento de Estado**: Controle eficiente de listeners para evitar duplicações
- **Error Handling**: Tratamento robusto de erros com feedback ao usuário

**✅ Benefícios do Painel:**

- 🚀 **Configuração Rápida**: Configure o bot em minutos através de uma interface única
- 📊 **Organização Visual**: Todas as opções organizadas de forma lógica e intuitiva
- 🔄 **Fácil Manutenção**: Atualize configurações a qualquer momento
- 👁️ **Transparência**: Feedback imediato sobre cada ação realizada
- 🛡️ **Segurança**: Validações em todas as operações para prevenir erros

> **📝 Nota Importante**: O comando `/painel` substitui os antigos comandos individuais de configuração (`/addchannels`, `/removechannels`, `/addtwitch`, `/addyoutube`). Todas essas funcionalidades agora estão centralizadas em uma interface única e mais intuitiva.

---

## 📋 Verificação de Conformidade

### ✅ Comandos Verificados e Funcionais

**👥 Comandos Gerais:**
- ✅ `/oi` - Saudação amigável
- ✅ `/help` - Lista de comandos
- ✅ `/server` - Informações do servidor  
- ✅ `/aniversario` - Registro de aniversário
- ✅ `/clima` - Previsão do tempo
- ✅ `/sorteio` - Participação em sorteios
- ✅ `/infosorteio` - Informações de sorteios

**🛡️ Comandos de Moderação:**
- ✅ `/regra` - Exibição de regras
- ✅ `/clean` - Sistema unificado de limpeza
- ✅ `/timeout` - Aplicação de timeout
- ✅ `/banir` - Banimento de usuários
- ✅ `/desbanir` - Remoção de banimento
- ✅ `/listarbanstemporarios` - Listagem de bans temporários ativos
- ✅ `/expulsar` - Expulsão do servidor
- ✅ `/kickuser` - Remoção de canal de voz
- ✅ `/embed` - Criação de embeds
- ✅ `/ficha` - Informações de usuário
- ✅ `/voteparaban` - Sistema de votação
- ✅ `/backup` - Sistema de backup completo

**🎲 Comandos de Sorteio:**
- ✅ `/premiosorteio` - Definição de prêmios
- ✅ `/sortear` - Realização de sorteios
- ✅ `/limpasorteio` - Limpeza de participantes

**🛠️ Comandos de Gerenciamento:**
- ✅ `/cargo` - Seletor de cargos
- ✅ `/ticket` - Sistema de tickets
- ✅ `/manutencao` - Avisos de manutenção
- ✅ `/excluicomando` - Remoção de comandos

**🔧 Comandos de Inicialização:**
- ✅ `/painel` - Central de configuração completa do bot

---

## 🔧 Funcionalidades Automáticas

### 🔄 Sistemas Ativos 24/7

#### 🎂 Notificações de Aniversário
- **Horário**: Verificação diária às 08:00
- **Funcionalidade**: Parabeniza membros que fazem aniversário
- **Personalização**: Mensagens personalizadas com menções

#### 📹 Monitoramento YouTube
- **Frequência**: Verificação a cada 10 minutos
- **Funcionalidade**: Notifica sobre novos vídeos de canais cadastrados
- **Formato**: Embeds com thumbnail e informações do vídeo

#### 🎮 Monitoramento Twitch
- **Frequência**: Verificação a cada 5 minutos
- **Funcionalidade**: Notifica quando streamers entram/saem ao vivo
- **Detalhes**: Informações de categoria, espectadores e duração

#### 🆓 Notificação de Jogos Gratuitos
- **Frequência**: Verificação diária
- **Funcionalidade**: Monitora promoções Epic Games, Steam, etc.
- **Alertas**: Notificações automáticas de jogos gratuitos

#### 📊 Atualização de Cargos
- **Frequência**: Verificação semanal
- **Funcionalidade**: Promove membros após 30 dias no servidor
- **Automação**: Adiciona cargo "Membro Plus" automaticamente

#### ⏰ Gerenciamento de Banimentos Temporários
- **Frequência**: Verificação contínua a cada minuto
- **Funcionalidade**: Desbanimento automático quando o tempo expira
- **Registro**: Logs detalhados de banimentos e desbanimentos
- **Segurança**: Sistema de verificação dupla para evitar erros

---

## 🛡️ Sistema de Segurança

### 🚫 Anti-Flood Chat
```javascript
// Sistema Anti-Flood Avançado v2.0
- Detecção: Janela de tempo deslizante (5 mensagens em 10 segundos)
- Avisos Progressivos: 2 avisos antes do timeout
- Penalidade: Timeout automático de 5 minutos
- Usuários Imunes: Donos, administradores e moderadores
- Registro: Infrações salvas no banco de dados
- Cooldown: 30 segundos entre avisos para evitar spam
- Limpeza Automática: Remove dados antigos periodicamente
- Logs Detalhados: Monitoramento completo de todas as ações
```

### 🔗 Bloqueio de Links
```javascript
// Links bloqueados incluem:
- Links de Discord não autorizados
- Encurtadores de URL suspeitos
- Domínios em lista negra
- Links de phishing conhecidos
```

### 🤬 Detecção de Palavras Inadequadas
```javascript
// Sistema inteligente que detecta:
- Palavrões e linguagem ofensiva
- Conteúdo discriminatório
- Spam e flood de caracteres
- Variações e evasões de filtro
```

### 📎 Bloqueio de Tipos de Arquivo
```javascript
// Arquivos bloqueados:
- Executáveis (.exe, .bat, .cmd)
- Scripts maliciosos (.js, .vbs, .ps1)
- Arquivos de configuração suspeitos
- Extensões potencialmente perigosas
```

### 👤 Proteção Contra Novos Membros
```javascript
// Sistema automático que:
- Monitora comportamento de contas novas
- Detecta padrões de bot/spam
- Aplica medidas preventivas
- Mantém logs de atividade suspeita
```

---

## 📊 Sistema de Logs Avançado

### 📈 Níveis de Log Disponíveis

| Nível | Cor | Descrição | Arquivo |
|-------|-----|-----------|---------|
| **ERROR** | 🔴 Vermelho | Erros críticos e exceções | `error.log` |
| **WARN** | 🟡 Amarelo | Avisos e situações suspeitas | `warn.log` |
| **INFO** | 🔵 Azul | Informações gerais | `bot.log` |
| **DEBUG** | 🟢 Verde | Informações de depuração | `bot.log` |
| **VERBOSE** | 🟣 Magenta | Logs detalhados | `bot.log` |
| **SILLY** | ⚪ Cinza | Logs extremamente detalhados | `bot.log` |

### 📁 Arquivos de Log

#### 📋 Configuração de Rotação
```javascript
- bot.log      // Todos os logs (5MB, 5 arquivos)
- error.log    // Apenas erros (5MB, 5 arquivos)  
- warn.log     // Avisos (5MB, 3 arquivos)
- exceptions.log // Exceções não capturadas
- rejections.log // Promises rejeitadas
```

### 🔍 Contexto Rico dos Logs

Cada log inclui informações detalhadas:

```javascript
{
  timestamp: "2025-01-26 14:30:15",
  level: "INFO",
  message: "Comando executado com sucesso",
  module: "COMMAND",
  command: "help",
  user: "usuario#1234",
  guild: "Nome do Servidor",
  channel: "canal-geral",
  metadata: {
    executionTime: "125ms",
    success: true
  }
}
```

### 🔧 Métodos de Log Disponíveis

#### Métodos Básicos
```javascript
const { logger } = require('./logger');

// Logs simples
logger.error('Erro crítico', context, error);
logger.warn('Situação suspeita detectada', context);
logger.info('Operação realizada com sucesso', context);
logger.debug('Debug: verificando dados', context);
```

#### Métodos Especializados
```javascript
// Execução de comandos
commandExecuted('help', user, guild, true);

// Eventos do bot
botEvent('BOT_READY', 'Bot inicializado com sucesso');

// Eventos de segurança
securityEvent('ANTI_FLOOD_TRIGGERED', user, guild, 'detalhes');

// Operações de banco de dados
databaseEvent('INSERT', 'users', true, 'Usuário criado');
```

### 📊 Monitoramento Abrangente

#### 🔒 Eventos de Segurança Logados
- ✅ Detecções de anti-flood com sistema de avisos progressivos
- ✅ Bloqueios de links maliciosos  
- ✅ Filtros de linguagem inadequada
- ✅ Expulsões e banimentos
- ✅ Tentativas de acesso não autorizado

#### 💾 Operações de Banco de Dados
- ✅ Inserções, atualizações e exclusões
- ✅ Consultas de performance
- ✅ Erros de conexão
- ✅ Backups e restaurações

#### 🎮 Atividades dos Usuários
- ✅ Execução de comandos
- ✅ Entrada e saída de membros
- ✅ Mudanças de cargo
- ✅ Atividades de voz e texto

---

## �️ Estrutura do Banco de Dados (MongoDB)

O Bot Jonalandia utiliza **MongoDB** como banco de dados principal, com uma arquitetura bem estruturada que gerencia todas as informações necessárias para o funcionamento completo do bot. Abaixo está a documentação detalhada de todas as coleções e seus schemas.

### 📊 Visão Geral das Coleções

| Coleção | Propósito | Arquivo Modelo |
|---------|-----------|----------------|
| `channelsServer` | Gerenciamento de canais do servidor | `addChannel.js` |
| `gameNotification` | Notificações de jogos gratuitos | `gameNotification.js` |
| `infractionsUsers` | Sistema de infrações e logs de usuários | `infracoesUsers.js` |
| `notificationBirthday` | Cadastro de aniversários | `notificationBirthday.js` |
| `notificationChannels` | Configuração de canais de notificação | `notificationChannels.js` |
| `notificationTwitch` | Cache de notificações Twitch | `notificationTwitch.js` |
| `notificationYoutube` | Cache de notificações YouTube | `notificationYoutube.js` |
| `tempBan` | Sistema de banimentos temporários | `tempBan.js` |
| `ticketConfig` | Configurações do sistema de tickets | `ticketConfig.js` |
| `streamers` | Lista de streamers monitorados (Twitch) | `streamers.js` |
| `votoBanUser` | Sistema de votação para banimentos | `votoBanUser.js` |
| `youtubeChannel` | Lista de canais YouTube monitorados | `youtubeChannel.js` |

---

### 📋 Documentação Detalhada dos Schemas

#### 🏠 **channelsServer** - Gerenciamento de Canais
```javascript
{
  channelId: String,        // ID único do canal Discord (único, obrigatório)
  channelName: String,      // Nome do canal (obrigatório)
  channelType: String,      // Tipo do canal (texto/voz) (obrigatório)
  guildId: String,          // ID do servidor Discord (obrigatório)
  guildName: String,        // Nome do servidor Discord (obrigatório)
  createdAt: Date,          // Data de criação (automático)
  updatedAt: Date           // Data da última atualização (automático)
}
```
**Propósito**: Armazena informações de todos os canais do servidor para controle interno e logs.

#### 🎮 **gameNotification** - Jogos Gratuitos
```javascript
{
  title: String,            // Título do jogo (obrigatório)
  genre: String,            // Gênero do jogo (obrigatório)
  platform: String,        // Plataforma (Epic, Steam, etc.) (obrigatório)
  release_date: String,     // Data de lançamento (obrigatório)
  createdAt: Date           // Data de cadastro (automático)
}
```
**Propósito**: Armazena informações dos jogos gratuitos para evitar notificações duplicadas.

#### 👤 **infractionsUsers** - Sistema de Infrações
```javascript
{
  userId: String,           // ID único do usuário Discord (único, obrigatório)
  username: String,         // Nome de usuário (obrigatório)
  avatarUrl: String,        // URL do avatar (obrigatório)
  accountCreatedDate: Date, // Data de criação da conta Discord (obrigatório)
  joinedServerDate: Date,   // Data de entrada no servidor (obrigatório)
  
  infractions: {            // Contadores de infrações
    timeouts: Number,               // Quantidade de timeouts aplicados (padrão: 0)
    inappropriateLanguage: Number,  // Linguagem inadequada detectada (padrão: 0)
    voiceChannelKicks: Number,      // Expulsões de canal de voz (padrão: 0)
    bans: Number,                   // Banimentos aplicados (padrão: 0)
    unbans: Number,                 // Desbanimentos realizados (padrão: 0)
    floodTimeouts: Number,          // Timeouts por anti-flood (padrão: 0)
    blockedFiles: Number,           // Arquivos bloqueados enviados (padrão: 0)
    serverLinksPosted: Number,      // Links de servidor postados (padrão: 0)
    expulsion: Number               // Expulsões do servidor (padrão: 0)
  },
  
  logs: [{                  // Array de logs detalhados
    type: String,           // Tipo da infração (obrigatório)
    reason: String,         // Motivo da infração (obrigatório)
    date: Date,             // Data da infração (obrigatório)
    moderator: String       // Moderador responsável (obrigatório)
  }]
}
```
**Propósito**: Sistema completo de rastreamento de infrações e histórico de moderação.

#### 🎂 **notificationBirthday** - Sistema de Aniversários
```javascript
{
  userId: String,           // ID único do usuário Discord (obrigatório)
  name: String,             // Nome do usuário (obrigatório)
  day: Number,              // Dia do aniversário (1-31) (obrigatório)
  month: Number             // Mês do aniversário (1-12) (obrigatório)
}
```
**Propósito**: Armazena datas de aniversário para notificações automáticas diárias.

#### 📺 **notificationTwitch** - Cache Twitch
```javascript
{
  title: String,            // Título da transmissão (obrigatório)
  streamer: String,         // Nome do streamer (obrigatório)
  image: String,            // URL da imagem/thumbnail (obrigatório)
  gamer: String             // Categoria/jogo transmitido (obrigatório)
}
```
**Propósito**: Cache temporário das informações de transmissões para comparação de estados.

#### � **notificationChannels** - Configuração de Canais de Notificação
```javascript
{
  guildId: String,                    // ID do servidor Discord (único, obrigatório)
  freeGamesChannelId: String,         // Canal para notificações de jogos gratuitos
  welcomeChannelId: String,           // Canal para mensagens de boas-vindas
  goodbyeChannelId: String,           // Canal para mensagens de despedida
  twitchNotificationChannelId: String, // Canal para notificações de Twitch
  youtubeNotificationChannelId: String, // Canal para notificações de YouTube
  createdAt: Date,                    // Data de criação (automático)
  updatedAt: Date                     // Data da última atualização (automático)
}
```
**Propósito**: Centraliza todas as configurações de canais de notificação do servidor, gerenciadas através do comando `/painel`.

#### ⏰ **tempBan** - Sistema de Banimentos Temporários
```javascript
{
  userId: String,           // ID único do usuário Discord (único, obrigatório)
  guildId: String,          // ID do servidor Discord (obrigatório)
  username: String,         // Nome do usuário banido (obrigatório)
  reason: String,           // Motivo do banimento (obrigatório)
  bannedAt: Date,           // Data do banimento (automático)
  unbanAt: Date,            // Data programada para desbanimento (obrigatório)
  moderator: String,        // ID do moderador que aplicou o ban (obrigatório)
  moderatorName: String,    // Nome do moderador (obrigatório)
  active: Boolean           // Se o banimento está ativo (padrão: true)
}
```
**Propósito**: Gerencia banimentos temporários com desbanimento automático programado.

#### 🎫 **ticketConfig** - Configuração do Sistema de Tickets
```javascript
{
  guildId: String,          // ID do servidor Discord (único, obrigatório)
  channelId: String,        // Canal onde o painel de tickets é exibido
  categoryId: String,       // Categoria onde os tickets são criados
  supportRoleId: String,    // Cargo que tem acesso aos tickets
  ticketCounter: Number,    // Contador de tickets criados (padrão: 0)
  createdAt: Date,          // Data de criação (automático)
  updatedAt: Date           // Data da última atualização (automático)
}
```
**Propósito**: Armazena todas as configurações do sistema de tickets do servidor, configurado através do `/painel`.

#### 📹 **notificationYoutube** - Cache YouTube
```javascript
{
  title: String,            // Título do vídeo (obrigatório)
  author: String,           // Autor do canal (obrigatório)
  thumbnail: String,        // URL da thumbnail (obrigatório)
  description: String       // Descrição do vídeo (obrigatório)
}
```
**Propósito**: Cache temporário das informações de vídeos para evitar notificações duplicadas.

#### 🎮 **streamers** - Streamers Monitorados
```javascript
{
  name: String              // Nome único do streamer Twitch (único, obrigatório)
}
```
**Propósito**: Lista de streamers do Twitch que são monitorados para notificações de live.

#### 🗳️ **votoBanUser** - Sistema de Votação
```javascript
{
  targetUserId: String,     // ID do usuário alvo da votação (obrigatório)
  targetUsername: String,   // Nome do usuário alvo (obrigatório)
  targetAvatarUrl: String,  // Avatar do usuário alvo (obrigatório)
  startedBy: String,        // ID de quem iniciou a votação (obrigatório)
  startTime: Date,          // Data de início (automático)
  endTime: Date,            // Data de término (obrigatório)
  
  votes: [{                 // Array de votos
    userId: String,         // ID do usuário que votou (obrigatório)
    username: String,       // Nome do usuário que votou (obrigatório)
    vote: String            // Voto: "sim" ou "nao" (obrigatório)
  }]
}
```
**Propósito**: Sistema democrático de votação para banimentos de usuários.

#### 📺 **youtubeChannel** - Canais YouTube
```javascript
{
  name: String              // Nome único do canal YouTube (único, obrigatório)
}
```
**Propósito**: Lista de canais do YouTube monitorados para notificações de novos vídeos.

---

### � Configuração e Manutenção do Banco

#### 📊 Indexação Otimizada
```javascript
// Índices recomendados para performance
channelsServer: { channelId: 1 }           // Busca rápida por canal
infractionsUsers: { userId: 1 }            // Busca rápida por usuário
notificationChannels: { guildId: 1 }       // Busca rápida por servidor
streamers: { name: 1 }                     // Busca rápida por streamer
youtubeChannel: { name: 1 }                // Busca rápida por canal
tempBan: { userId: 1, active: 1 }          // Busca eficiente de bans ativos
ticketConfig: { guildId: 1 }               // Busca rápida por configuração
```

#### 🧹 Limpeza Automática
O sistema inclui rotinas de limpeza para:
- ✅ Remoção de dados antigos de cache (Twitch/YouTube)
- ✅ Processamento de banimentos temporários expirados
- ✅ Arquivamento de logs antigos de infrações
- ✅ Remoção de votações expiradas
- ✅ Limpeza de tickets fechados antigos

#### 💾 Backup e Restore
```bash
# Backup completo do banco (pode usar o comando /backup do bot)
mongodump --db jonalandia --out backup/

# Restore do backup
mongorestore --db jonalandia backup/jonalandia/

# Backup de coleção específica
mongodump --db jonalandia --collection notificationChannels --out backup/
```

#### 🔄 Coleções Gerenciadas pelo Painel
As seguintes coleções são automaticamente gerenciadas através do comando `/painel`:
- ✅ `channelsServer` - Registro de canais
- ✅ `notificationChannels` - Configurações de notificações
- ✅ `streamers` - Streamers da Twitch
- ✅ `youtubeChannel` - Canais do YouTube
- ✅ `ticketConfig` - Sistema de tickets

---

## 🔔 Sistema de Notificações

### 📺 Notificações YouTube
- **Canais Monitorados**: Lista configurável de canais
- **Frequência**: Verificação a cada 10 minutos
- **Formato**: Embeds com thumbnail e informações
- **Personalização**: Mensagens customizáveis por canal

### 🎮 Notificações Twitch
- **Streamers Monitorados**: Lista configurável de streamers
- **Status em Tempo Real**: Detecção de live/offline
- **Informações Detalhadas**: Categoria, viewers, duração
- **Histórico**: Registro de todas as transmissões

### 🆓 Notificações de Jogos Gratuitos
- **Plataformas Monitoradas**: Epic Games, Steam, GOG
- **Alertas Automáticos**: Notificação de novos jogos gratuitos
- **Período Limitado**: Avisos sobre tempo restante
- **Links Diretos**: Links para resgate dos jogos

### 🎂 Sistema de Aniversários
- **Cadastro Individual**: Usuários registram suas datas
- **Verificação Diária**: Checagem automática às 08:00
- **Parabenização Automática**: Mensagens personalizadas
- **Histórico**: Registro de todos os aniversários

---

## ⚙️ Configuração Avançada

### 🔧 Variáveis de Ambiente Detalhadas

```env
# ====================================
# CONFIGURAÇÃO PRINCIPAL DO BOT
# ====================================
TOKEN=seu_token_discord_bot
MONGO_URI=mongodb://localhost:27017/jonalandia

# ====================================
# IDS DOS CANAIS
# ====================================
CHANNEL_ID_LOGS_INFO_BOT=123456789012345678
CHANNEL_ID_LOGS_ERRO_BOT=123456789012345678
CHANNEL_ID_CARGOS=123456789012345678
CHANNEL_ID_REGRAS=123456789012345678
CHANNEL_ID_ANIVERSARIOS=123456789012345678

# ====================================
# IDS DOS CARGOS
# ====================================
CARGO_MODERADOR=123456789012345678
CARGO_MEMBRO=123456789012345678
CARGO_MEMBRO_PLUS=123456789012345678
CARGO_MASCULINO=123456789012345678
CARGO_FEMININO=123456789012345678

# Cargos de Jogos
CARGO_FREE_FIRE=123456789012345678
CARGO_MINECRAFT=123456789012345678
CARGO_VALORANT=123456789012345678
CARGO_FORTNIT=123456789012345678
CARGO_LOL=123456789012345678
CARGO_CS=123456789012345678
CARGO_ROBLOX=123456789012345678
CARGO_GTAV=123456789012345678
CARGO_CLASH_ROYALE=123456789012345678
CARGO_CLASH_OF_CLANS=123456789012345678
CARGO_BLOCK_SQUAD=123456789012345678
CARGO_ROCKET_LEAGUE=123456789012345678
CARGO_AMONG_US=123456789012345678
CARGO_RED_DEAD=123456789012345678

# Cargos de Identidade
CARGO_NAO_BINARIO=123456789012345678
CARGO_13_A_15ANOS=123456789012345678
CARGO_16_A_17ANOS=123456789012345678
CARGO_18ANOS=123456789012345678
CARGO_TRABALHANDO=123456789012345678
CARGO_ESTUDANDO=123456789012345678
CARGO_SEGUINDO_A_VIDA=123456789012345678

# ====================================
# APIS EXTERNAS
# ====================================
OPENWEATHER_API_KEY=sua_chave_api_clima
YOUTUBE_API_KEY=sua_chave_api_youtube
TWITCH_CLIENT_ID=seu_client_id_twitch
TWITCH_CLIENT_SECRET=seu_client_secret_twitch
```

### 🌤️ API de Clima - OpenWeatherMap

O comando `/clima` utiliza a **API OpenWeatherMap** para fornecer informações meteorológicas em tempo real. Esta seção detalha como configurar e utilizar a integração com a API.

#### 📋 Informações da API

| Propriedade | Valor |
|-------------|-------|
| **Provider** | OpenWeatherMap |
| **Coleção Utilizada** | Current Weather Data |
| **Documentação** | [https://openweathermap.org/api](https://openweathermap.org/api) |
| **Documentação Específica** | [https://openweathermap.org/current](https://openweathermap.org/current) |
| **Formato de Resposta** | JSON |
| **Idioma** | Português Brasileiro (pt_br) |

#### 🔑 Configuração da Chave da API

1. **Obtenha sua chave gratuita:**
   - Acesse [OpenWeatherMap](https://openweathermap.org/api)
   - Crie uma conta gratuita
   - Navegue até a seção "API Keys"
   - Copie sua chave de API

2. **Configure no arquivo `.env`:**
   ```env
   OPENWEATHER_API_KEY=sua_chave_api_aqui
   ```

3. **Limitações do plano gratuito:**
   - 1.000 chamadas por dia
   - 60 chamadas por minuto
   - Dados atualizados a cada 2 horas

#### 🌍 Funcionalidades Implementadas

O comando `/clima` fornece as seguintes informações meteorológicas:

| Campo | Descrição | Formato |
|-------|-----------|---------|
| **🌡️ Temperatura** | Temperatura atual | `°C` |
| **🌡️ Sensação Térmica** | Temperatura percebida | `°C` |
| **💧 Umidade** | Umidade relativa do ar | `%` |
| **🌬️ Velocidade do Vento** | Velocidade do vento | `m/s` |
| **🌅 Nascer do Sol** | Horário do nascer do sol | `HH:MM:SS` |
| **🌇 Pôr do Sol** | Horário do pôr do sol | `HH:MM:SS` |
| **🌍 Coordenadas** | Latitude e longitude | `lat, lon` |
| **🌐 Visibilidade** | Distância de visibilidade | `km` |
| **🌐 Pressão** | Pressão atmosférica | `hPa` |
| **🌐 Chuva (1h)** | Precipitação na última hora | `mm` |
| **☁️ Nuvens** | Cobertura de nuvens | `%` |

#### 💡 Exemplo de Uso

```javascript
// Comando Discord
/clima cidade: São Paulo

// URL da API construída automaticamente
https://api.openweathermap.org/data/2.5/weather?q=São Paulo&units=metric&appid=API_KEY&lang=pt_br
```

#### 🔒 Segurança e Boas Práticas

- **Proteção da Chave**: A chave da API é armazenada em variável de ambiente
- **Rate Limiting**: O bot respeita os limites de taxa da API  
- **Tratamento de Erros**: Erros de API são logados e tratados adequadamente
- **Cache**: Considere implementar cache para reduzir chamadas desnecessárias

#### 🐛 Solução de Problemas

| Erro | Causa Possível | Solução |
|------|----------------|---------|
| `401 Unauthorized` | Chave de API inválida | Verifique a chave no arquivo `.env` |
| `404 Not Found` | Cidade não encontrada | Verifique a grafia da cidade |
| `429 Too Many Requests` | Limite de taxa excedido | Aguarde alguns minutos |
| `Network Error` | Problema de conectividade | Verifique conexão com internet |

---

### 🗄️ Configuração do MongoDB

#### Esquemas de Banco de Dados

```javascript
// Principais coleções utilizadas:
1. UserProfile        // Perfis dos usuários
2. UserInfractions    // Sistema de infrações
3. BirthdayNotifications // Aniversários cadastrados  
4. Sorteio           // Participantes de sorteios
5. PremioSorteio     // Prêmios dos sorteios
6. TwitchStreamers   // Streamers monitorados
7. YoutubeChannels   // Canais YouTube monitorados
8. VotoBanUser       // Sistema de votação para ban
9. AddChannels       // Canais configurados no sistema
10. GameNotifications // Notificações de jogos gratuitos
```

### 🔒 Configurações de Segurança

#### Lista de Bloqueios Configurável

```json
// blockedLinks.json
{
  "domains": [
    "discord.gg",
    "discord.com/invite",
    "bit.ly",
    "tinyurl.com"
  ],
  "exceptions": [
    "discord.gg/jonalandia"
  ]
}

// InappropriateWords.json  
{
  "words": [
    "palavra1",
    "palavra2"
  ],
  "severity": {
    "low": ["palavra1"],
    "medium": ["palavra2"], 
    "high": ["palavra3"]
  }
}

// blockedFileExtensions.json
{
  "extensions": [
    ".exe",
    ".bat", 
    ".cmd",
    ".vbs",
    ".ps1"
  ]
}
```

---

## �🐛 Resolução de Problemas

### ❗ Problemas Comuns

#### 🔴 Bot não está iniciando
```bash
# Verifique as dependências
npm install

# Verifique o arquivo .env
cat .env

# Verifique os logs
tail -f src/logs/error.log
```

#### 🟡 Comandos não estão funcionando
```javascript
// Verificações necessárias:
1. Token do bot está correto
2. Bot tem permissões necessárias
3. Canais configurados corretamente
4. IDs dos cargos estão corretos
```

#### 🔵 MongoDB não está conectando
```bash
# Verifique se MongoDB está executando
systemctl status mongod

# Teste a conexão
mongo --eval "db.stats()"

# Verifique a URI no .env
echo $MONGO_URI
```

### 📞 Suporte e Debug

#### 🔍 Logs de Debug
```bash
# Habilitar modo debug
NODE_ENV=development npm start

# Visualizar logs em tempo real
tail -f src/logs/bot.log

# Filtrar por tipo de erro
grep "ERROR" src/logs/error.log
```

#### 📊 Monitoramento de Performance
```javascript
// O bot inclui métricas de performance:
- Tempo de resposta dos comandos
- Uso de memória
- Conexões de banco de dados
- Taxa de erro por módulo
```

### ❓ Perguntas Frequentes (FAQ)

#### **Como configurar o bot pela primeira vez?**
1. Execute `/painel` no seu servidor
2. Navegue pelas 5 páginas usando os botões ◀ ▶
3. Configure os canais nas páginas 1, 2 e 4
4. Configure streamers/YouTube na página 3 (opcional)
5. Configure o sistema de tickets na página 5 (opcional)

#### **O que acontece se eu mudar um canal de notificação?**
Você pode atualizar a qualquer momento através do `/painel`. Basta selecionar o novo canal no menu apropriado.

#### **Como faço backup do banco de dados?**
Use o comando `/backup` - ele enviará um arquivo JSON completo por DM.

#### **Os banimentos temporários são confiáveis?**
Sim! O sistema verifica a cada minuto e possui logs detalhados de todas as ações.

#### **Posso usar o bot em múltiplos servidores?**
Sim! Cada servidor tem suas próprias configurações isoladas no banco de dados.

---

## 🤝 Contribuição

### 👨‍💻 Como Contribuir

1. **Fork o repositório**
2. **Crie uma branch para sua feature:**
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```
3. **Commit suas mudanças:**
   ```bash
   git commit -m "Adiciona nova funcionalidade"
   ```
4. **Push para a branch:**
   ```bash
   git push origin feature/nova-funcionalidade
   ```
5. **Abra um Pull Request**

### 📝 Padrões de Código

- **ESLint**: Siga as configurações do projeto
- **Commit Convention**: Use conventional commits
- **Documentação**: Documente todas as funções
- **Testes**: Inclua testes para novas funcionalidades

### 🐛 Reportando Bugs

Para reportar bugs, inclua:
- Versão do bot
- Logs relevantes
- Passos para reproduzir
- Comportamento esperado vs atual

## �📄 Licença e Informações

### 👤 Autor
- **Nome**: Jonathas Oliveira
- **Email**: jonathass56778@gmail.com
- **GitHub**: [@jonathasfrontend](https://github.com/jonathasfrontend)

### 📋 Documentos Importantes
- [📋 Política de Privacidade](./PRIVACY_POLICY.md)
- [📋 Termos de Serviço](./TERMS_OF_SERVICE.md)
- [📋 Licença](./LICENSE)

### 🔄 Versionamento
- **Versão Atual**: 10.2.4
- **Sistema**: Semantic Versioning (SemVer)
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)

---

<div align="center">

### 🌟 Bot Jonalandia - Transformando Comunidades Discord

**Desenvolvido com ❤️ por [Jonathas Oliveira](https://github.com/jonathasfrontend)**

[![GitHub](https://img.shields.io/badge/GitHub-jonathasfrontend-black?style=for-the-badge&logo=github)](https://github.com/jonathasfrontend)
[![Discord](https://img.shields.io/badge/Discord-Jonalandia-7289da?style=for-the-badge&logo=discord)](https://discord.gg/heP4NWBqsA)

---

*"Um bot completo para uma comunidade completa"*

</div>
