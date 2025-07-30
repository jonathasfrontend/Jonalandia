# 🤖 Bot Jonalandia

<div align="center">

![Jonalandia](jonalandia.png)

**Um bot Discord para Gerenciamento do servidor Jonalandia**

[![Version](https://img.shields.io/badge/version-1.1.3-blue.svg)](https://github.com/jonathasfrontend/jonalandia)
[![Node.js](https://img.shields.io/badge/node.js-16%2B-green.svg)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/discord.js-14.14.1-7289da.svg)](https://discord.js.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-8.8.0-green.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/license-Custom-red.svg)](./LICENSE)
</div>


## 📋 Sumário

- [🚀 Introdução](#-introdução)
- [⚡ Visão Geral](#-visão-geral)
- [📦 Instalação e Configuração](#-instalação-e-configuração)
- [🏗️ Estrutura do Projeto](#️-estrutura-do-projeto)
- [🎯 Comandos Disponíveis](#-comandos-disponíveis)
- [🔧 Funcionalidades Automáticas](#-funcionalidades-automáticas)
- [🛡️ Sistema de Segurança](#️-sistema-de-segurança)
- [📊 Sistema de Logs Avançado](#-sistema-de-logs-avançado)
- [🔔 Sistema de Notificações](#-sistema-de-notificações)
- [⚙️ Configuração Avançada](#️-configuração-avançada)
- [🐛 Resolução de Problemas](#-resolução-de-problemas)
- [🤝 Contribuição](#-contribuição)

---

## 🚀 Introdução

O **Bot Jonalandia** é uma solução completa e avançada para servidores Discord, desenvolvida com foco na automação de tarefas de moderação, engajamento da comunidade e experiência personalizada. Criado por **Jonathas Oliveira**, o bot combina mais de 25 comandos especializados, sistema de logs avançado e funcionalidades de segurança.

### 🎯 Principais Características

- **Sistema de Moderação Completo** - Ferramentas avançadas para administração do servidor
- **Segurança Multicamadas** - Anti-flood avançado com avisos progressivos, detecção de links maliciosos e palavras inadequadas
- **Sistema de Logs Profissional** - Monitoramento detalhado de todas as atividades
- **Notificações Inteligentes** - Monitoramento de YouTube, Twitch e jogos gratuitos
- **Interface Moderna** - Embeds personalizados e botões interativos

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

- ✅ **25+ Comandos Especializados** - Cobrindo moderação, diversão e utilidades
- ✅ **Sistema de Logs Avançado** - 6 níveis de log com rotação automática
- ✅ **Segurança Multicamadas** - Proteção contra spam, links e conteúdo inadequado
- ✅ **Notificações Inteligentes** - Monitoramento de plataformas externas
- ✅ **Interface Moderna** - Embeds responsivos e componentes interativos

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
│   │   ├── 📁 moderador/      # Comandos de moderação
│   │   └── 📁 initializebot/  # Comandos de inicialização
│   ├── 📁 config/             # Configurações do sistema
│   ├── 📁 functions/          # Funções automáticas
│   │   └── 📁 punicfunction/  # Funções de segurança
│   ├── 📁 models/             # Esquemas do banco de dados
│   ├── 📁 utils/              # Utilitários e helpers
│   ├── 📁 logs/               # Arquivos de log
│   ├── 📄 Client.js           # Cliente Discord
│   ├── 📄 index.js            # Arquivo principal
│   └── 📄 logger.js           # Sistema de logs
├── 📄 package.json            # Dependências do projeto
├── 📄 README.md               # Documentação
└── 📄 .env                    # Variáveis de ambiente
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
| `/expulsar` | Expulsa usuário de canal de voz | `/expulsar usuario: @user` | Moderador |
| `/kickuser` | Remove usuário de canal de voz | `/kickuser usuario: @user` | Moderador |
| `/embed` | Cria embed personalizado | `/embed titulo: "Título" descrição: "Texto"` | Moderador |
| `/ficha` | Informações detalhadas do usuário | `/ficha usuario: @user` | Moderador |
| `/voteparaban` | Inicia votação para banimento | `/voteparaban usuario: @user` | Moderador |

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
| `/addchannels` | Adiciona canais ao sistema | `/addchannels opcao: todos` | Moderador |
| `/removechannels` | Remove canal do sistema | `/removechannels channel: #canal` | Moderador |
| `/addtwitch` | Cadastra streamer Twitch | `/addtwitch streamer: nome` | Moderador |
| `/addyoutube` | Cadastra canal YouTube | `/addyoutube channel: url` | Moderador |

---

## 🆕 Atualizações Recentes

### 🔄 Versão 1.1.3 - Correções e Melhorias

**🎯 Comandos Atualizados:**
- **`/aniversario`** - Comando para registro de aniversário (anteriormente referenciado como `/birthday` na documentação)
- **`/ficha`** - Informações detalhadas do usuário (anteriormente referenciado como `/infouser` na documentação)
- **`/addtwitch`** - Cadastro de streamers Twitch (comando simplificado)
- **`/addyoutube`** - Cadastro de canais YouTube (comando simplificado)

**📋 Melhorias na Documentação:**
- Sincronização completa entre documentação e implementação
- Correção de nomes de comandos inconsistentes
- Atualização de exemplos de uso
- Verificação de todas as funcionalidades listadas
- Atualização do comando `/help` para refletir comandos atuais

**⚠️ Importante:** O comando `/help` interno do bot ainda referencia alguns comandos antigos (`/clearall`, `/clearuser`, `/birthday`). Estes foram atualizados para `/clean` e `/aniversario` respectivamente na documentação.

**🔄 Melhorias Futuras:**
- Atualização do comando `/help` interno para refletir comandos atuais
- Sincronização completa entre interface de ajuda e funcionalidades implementadas
- Revisão de todos os embeds e mensagens de resposta

---

## 📋 Verificação de Conformidade

### ✅ Comandos Verificados e Funcionais

**👥 Comandos Gerais:**
- ✅ `/oi` - Saudação amigável
- ✅ `/help` - Lista de comandos (necessita atualização interna)
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
- ✅ `/expulsar` - Expulsão do servidor
- ✅ `/kickuser` - Remoção de canal de voz
- ✅ `/embed` - Criação de embeds
- ✅ `/ficha` - Informações de usuário
- ✅ `/voteparaban` - Sistema de votação

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
- ✅ `/addchannels` - Adição de canais
- ✅ `/removechannels` - Remoção de canais
- ✅ `/addtwitch` - Cadastro de streamers
- ✅ `/addyoutube` - Cadastro de canais YouTube

### ✨ Comando `/clean` Unificado (v1.1.2)

**🎯 Nova Funcionalidade:** Os comandos `/clearall` e `/clearuser` foram unificados no novo comando `/clean`, oferecendo:

- **Interface Moderna**: Menu de seleção intuitivo para escolher o tipo de limpeza
- **Experiência Melhorada**: Um único comando para todas as necessidades de limpeza
- **Recursos Aprimorados**: 
  - Embeds mais bonitos e informativos
  - Melhor tratamento de erros
  - Logs automáticos mais detalhados
  - Validações de segurança aprimoradas

**⚠️ Importante:** Os comandos antigos `/clearall` e `/clearuser` foram removidos. Use apenas `/clean` a partir desta versão.

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

## � Changelog Detalhado

### 🆕 Versão 1.1.3 (Atual)
**Data de Release:** 30 de julho de 2025

**🔧 Correções:**
- ✅ Correção de nomes de comandos na documentação
- ✅ Sincronização entre código implementado e documentação
- ✅ Atualização de exemplos de uso
- ✅ Verificação completa de funcionalidades

**📋 Comandos Corrigidos:**
- `aniversario` (antes referenciado como `birthday`)
- `ficha` (antes referenciado como `infouser`) 
- `addtwitch` (comando simplificado)
- `addyoutube` (comando simplificado)

**📊 Melhorias na Documentação:**
- Lista completa de cargos de jogos disponíveis
- Seção de verificação de conformidade
- Troubleshooting expandido
- Exemplos de configuração atualizados

### ✨ Versão 1.1.2
**🎯 Principais Mudanças:**
- Unificação dos comandos de limpeza em `/clean`
- Interface moderna com menus de seleção
- Melhor tratamento de erros e logs
- Remoção dos comandos antigos `/clearall` e `/clearuser`

### 🏗️ Versão 1.1.1
**🔧 Melhorias Incrementais:**
- Otimizações de performance
- Correções de bugs menores
- Melhorias no sistema de logs

### 🚀 Versão 1.1.0
**🎯 Grandes Funcionalidades:**
- Sistema de logs avançado implementado
- Múltiplas camadas de segurança
- Monitoramento de plataformas externas
- Sistema de sorteios completo

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

---

## 📄 Licença e Informações

### 👤 Autor
- **Nome**: Jonathas Oliveira
- **Email**: jonathass56778@gmail.com
- **GitHub**: [@jonathasfrontend](https://github.com/jonathasfrontend)

### 📋 Documentos Importantes
- [📋 Política de Privacidade](./PRIVACY_POLICY.md)
- [📋 Termos de Serviço](./TERMS_OF_SERVICE.md)
- [📋 Licença](./LICENSE)

### 🔄 Versionamento
- **Versão Atual**: 1.1.3
- **Sistema**: Semantic Versioning (SemVer)
- **Changelog**: Disponível no repositório

---

<div align="center">

### 🌟 Bot Jonalandia - Transformando Comunidades Discord

**Desenvolvido com ❤️ por [Jonathas Oliveira](https://github.com/jonathasfrontend)**

[![GitHub](https://img.shields.io/badge/GitHub-jonathasfrontend-black?style=for-the-badge&logo=github)](https://github.com/jonathasfrontend)
[![Discord](https://img.shields.io/badge/Discord-Jonalandia-7289da?style=for-the-badge&logo=discord)](https://discord.gg/heP4NWBqsA)

---

*"Um bot completo para uma comunidade completa"*

</div>
