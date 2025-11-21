# Checklist de QA - Refatoração Multi-Guild

## 📋 Informações do Teste

- **Versão**: 2.0.0
- **Data**: ___/___/2025
- **Testador**: _________________
- **Ambiente**: [ ] Desenvolvimento [ ] Produção
- **Guild ID de Teste**: _________________

---

## ✅ Pré-Requisitos

- [ ] Backup do banco de dados MongoDB realizado
- [ ] Variáveis de ambiente configuradas (`.env`)
- [ ] `DEFAULT_GUILD_ID` configurado no script de migração
- [ ] Node.js >= 16.0.0 instalado
- [ ] Dependências instaladas (`npm install`)

---

## 🔄 Migração de Dados

### Script de Migração

- [ ] Script executa sem erros
- [ ] `guildConfig` criado com sucesso
- [ ] Streamers migrados com `guildId`
- [ ] Canais YouTube migrados com `guildId`
- [ ] Infrações migradas com `guildId`
- [ ] Notificações Twitch migradas com `guildId`
- [ ] Notificações YouTube migradas com `guildId`
- [ ] Votações migradas com `guildId`
- [ ] Notificações de jogos migradas com `guildId`
- [ ] Resumo da migração exibido corretamente
- [ ] Dados podem ser consultados no MongoDB

**Notas:**
```
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
```

---

## 🤖 Sistema de Auto-Registro

### Entrada do Bot em Nova Guild

- [ ] Bot entra em servidor de teste
- [ ] `guildConfig` criado automaticamente
- [ ] `isActive` = `true`
- [ ] `botAddedAt` registrado
- [ ] `guildId` correto
- [ ] `guildName` correto
- [ ] `ownerId` correto
- [ ] Configurações padrão aplicadas

### Mensagem de Boas-Vindas ao Owner

- [ ] DM enviado ao owner do servidor
- [ ] Embed formatado corretamente
- [ ] Instruções claras presentes
- [ ] Comandos principais listados
- [ ] Links funcionais (se aplicável)
- [ ] Guild ID exibido no footer
- [ ] Fallback para canal de sistema funciona (se DM falhar)

**Notas:**
```
_______________________________________________________________
_______________________________________________________________
```

### Saída do Bot

- [ ] Bot removido do servidor
- [ ] `isActive` alterado para `false`
- [ ] `leftAt` registrado
- [ ] Dados preservados no banco
- [ ] Evento logado corretamente

**Notas:**
```
_______________________________________________________________
```

### Retorno do Bot

- [ ] Bot readicionado ao servidor
- [ ] Guild reativada (`isActive` = `true`)
- [ ] `leftAt` = `null`
- [ ] Configurações anteriores preservadas
- [ ] Dados anteriores acessíveis

**Notas:**
```
_______________________________________________________________
```

---

## ⚙️ Painel de Configuração

### Comando `/painel`

- [ ] Comando registrado e visível
- [ ] Painel abre corretamente
- [ ] Interface responsiva (botões/menus)
- [ ] Apenas dados da guild atual são exibidos
- [ ] Erros tratados adequadamente

### Cadastro de Canais de Notificação

#### Twitch
- [ ] Canal pode ser cadastrado
- [ ] Canal salvo com `guildId` correto
- [ ] Apenas uma configuração por guild
- [ ] Canal pode ser atualizado
- [ ] Validações funcionam

#### YouTube
- [ ] Canal pode ser cadastrado
- [ ] Canal salvo com `guildId` correto
- [ ] Apenas uma configuração por guild
- [ ] Canal pode ser atualizado
- [ ] Validações funcionam

#### Jogos Gratuitos
- [ ] Canal pode ser cadastrado
- [ ] Canal salvo com `guildId` correto
- [ ] Apenas uma configuração por guild
- [ ] Canal pode ser atualizado
- [ ] Validações funcionam

#### Boas-vindas/Despedidas
- [ ] Canais podem ser configurados
- [ ] Salvos em `guildConfig`
- [ ] Validações funcionam

**Notas:**
```
_______________________________________________________________
_______________________________________________________________
```

### Cadastro de Streamers Twitch

- [ ] Streamer pode ser adicionado
- [ ] Salvo com `guildId` correto
- [ ] Nomes duplicados permitidos em guilds diferentes
- [ ] Nome duplicado bloqueado na mesma guild
- [ ] Lista exibe apenas streamers da guild atual
- [ ] Streamer pode ser removido
- [ ] Paginação funciona (se implementada)

**Streamers de Teste:**
- Streamer 1: _______________
- Streamer 2: _______________

**Notas:**
```
_______________________________________________________________
_______________________________________________________________
```

### Cadastro de Canais YouTube

- [ ] Canal pode ser adicionado
- [ ] Salvo com `guildId` correto
- [ ] Nomes duplicados permitidos em guilds diferentes
- [ ] Nome duplicado bloqueado na mesma guild
- [ ] Lista exibe apenas canais da guild atual
- [ ] Canal pode ser removido
- [ ] Paginação funciona (se implementada)

**Canais de Teste:**
- Canal 1: _______________
- Canal 2: _______________

**Notas:**
```
_______________________________________________________________
_______________________________________________________________
```

### Configuração de Cargos

- [ ] Cargo de moderador pode ser configurado
- [ ] Cargo imune pode ser configurado
- [ ] Cargo de novo membro pode ser configurado
- [ ] Salvos em `guildConfig` ou `rolePermissions`
- [ ] Validações funcionam

**Notas:**
```
_______________________________________________________________
```

### Configuração de Punições

- [ ] Anti-Flood pode ser ativado/desativado
- [ ] Bloqueio de Links pode ser ativado/desativado
- [ ] Palavras Inapropriadas pode ser ativado/desativado
- [ ] Bloqueio de Arquivos pode ser ativado/desativado
- [ ] Kick Novos Membros pode ser ativado/desativado
- [ ] Configurações salvas em `punishmentConfig`
- [ ] Ações podem ser personalizadas

**Notas:**
```
_______________________________________________________________
_______________________________________________________________
```

---

## 📡 Notificações Isoladas por Guild

### Preparação

**Guild A (Principal):**
- ID: _______________
- Streamers: gaules, alanzoka
- Canais YouTube: cellbit
- Canal de Notificação: #notificações

**Guild B (Teste):**
- ID: _______________
- Streamers: loud_coringa
- Canais YouTube: funBABE
- Canal de Notificação: #lives

### Notificações Twitch

#### Guild A
- [ ] Notificação enviada quando `gaules` fica online
- [ ] Notificação enviada quando `alanzoka` fica online
- [ ] Notificação NÃO enviada para `loud_coringa`
- [ ] Embed formatado corretamente
- [ ] Título do streamer correto
- [ ] Game exibido corretamente
- [ ] Link para stream funcional
- [ ] Footer com nome da guild

#### Guild B
- [ ] Notificação enviada quando `loud_coringa` fica online
- [ ] Notificação NÃO enviada para `gaules`
- [ ] Notificação NÃO enviada para `alanzoka`
- [ ] Embed formatado corretamente

#### Duplicatas
- [ ] Mesma live não notificada 2x na Guild A
- [ ] Mesma live não notificada 2x na Guild B
- [ ] Live pode ser notificada em ambas as guilds (se cadastrada)

**Notas:**
```
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
```

### Notificações YouTube

#### Guild A
- [ ] Notificação enviada para novo vídeo de `cellbit`
- [ ] Notificação NÃO enviada para `funBABE`
- [ ] Embed com thumbnail correto
- [ ] Título do vídeo correto
- [ ] Link do vídeo funcional
- [ ] Footer com nome da guild

#### Guild B
- [ ] Notificação enviada para novo vídeo de `funBABE`
- [ ] Notificação NÃO enviada para `cellbit`
- [ ] Embed formatado corretamente

#### Duplicatas
- [ ] Mesmo vídeo não notificado 2x na Guild A
- [ ] Mesmo vídeo não notificado 2x na Guild B

**Notas:**
```
_______________________________________________________________
_______________________________________________________________
```

### Notificações de Jogos Gratuitos

#### Guild A
- [ ] Notificação enviada quando novo jogo detectado
- [ ] Salvo no banco com `guildId` da Guild A
- [ ] Embed formatado corretamente
- [ ] Footer com nome da Guild A

#### Guild B
- [ ] Notificação enviada quando novo jogo detectado
- [ ] Salvo no banco com `guildId` da Guild B
- [ ] Embed formatado corretamente
- [ ] Footer com nome da Guild B

#### Duplicatas
- [ ] Mesmo jogo não notificado 2x na Guild A
- [ ] Mesmo jogo não notificado 2x na Guild B
- [ ] Jogo notificado em ambas as guilds (esperado)

**Notas:**
```
_______________________________________________________________
_______________________________________________________________
```

---

## 👮 Moderação e Infrações

### Comandos de Moderação

#### Isolamento por Guild

- [ ] `/ficha @usuário` mostra apenas infrações da guild atual
- [ ] `/ban @usuário` registra infração na guild atual
- [ ] `/kick @usuário` registra infração na guild atual
- [ ] `/timeout @usuário` registra infração na guild atual
- [ ] Usuário banido na Guild A não afeta Guild B
- [ ] Infrações são independentes por guild

**Notas:**
```
_______________________________________________________________
_______________________________________________________________
```

### Sistema de Votação para Ban

- [ ] `/voteparaban @usuário` inicia votação
- [ ] Votação salva com `guildId` correto
- [ ] Apenas membros da guild atual podem votar
- [ ] Votação de Guild A não aparece em Guild B
- [ ] Resultado calculado corretamente por guild

**Notas:**
```
_______________________________________________________________
```

### Bans Temporários

- [ ] `/tempban @usuário` funciona
- [ ] Salvo com `guildId` correto (já existia)
- [ ] Verificador remove ban automaticamente
- [ ] Funciona isoladamente por guild

**Notas:**
```
_______________________________________________________________
```

---

## 🔍 Funções de Punição Automática

### Anti-Flood

- [ ] Ativado via painel
- [ ] Detecta flood de mensagens
- [ ] Aplica ação configurada (timeout/kick/ban)
- [ ] Registra infração com `guildId`
- [ ] Configurações isoladas por guild
- [ ] Cargo imune funciona

**Notas:**
```
_______________________________________________________________
```

### Bloqueio de Links

- [ ] Ativado via painel
- [ ] Detecta links em mensagens
- [ ] Whitelist funciona
- [ ] Deleta mensagem (se configurado)
- [ ] Registra infração com `guildId`
- [ ] Cargo imune funciona

**Notas:**
```
_______________________________________________________________
```

### Palavras Inapropriadas

- [ ] Ativado via painel
- [ ] Detecta palavras configuradas
- [ ] Deleta mensagem (se configurado)
- [ ] Registra infração com `guildId`
- [ ] Cargo imune funciona

**Notas:**
```
_______________________________________________________________
```

### Bloqueio de Tipos de Arquivo

- [ ] Ativado via painel
- [ ] Detecta extensões bloqueadas
- [ ] Deleta arquivo (se configurado)
- [ ] Registra infração com `guildId`

**Notas:**
```
_______________________________________________________________
```

### Kick de Novos Membros

- [ ] Ativado via painel
- [ ] Verifica idade da conta
- [ ] Expulsa contas novas (se configurado)
- [ ] Registra ação com `guildId`

**Notas:**
```
_______________________________________________________________
```

---

## 📊 Performance e Logs

### Performance

- [ ] Queries executam rapidamente (< 100ms média)
- [ ] Notificações processadas sem delay perceptível
- [ ] Uso de memória estável
- [ ] CPU não sobrecarregada
- [ ] Conexões com MongoDB estáveis

**Métricas:**
- Tempo médio de query: _____ms
- Uso de memória: _____MB
- CPU: _____% média

**Notas:**
```
_______________________________________________________________
```

### Logs

- [ ] Logs incluem `guildId` quando aplicável
- [ ] Logs incluem `guildName` quando aplicável
- [ ] Níveis de log adequados (info/warn/error)
- [ ] Erros são capturados e logados
- [ ] Contexto suficiente para debug

**Notas:**
```
_______________________________________________________________
```

### Banco de Dados

- [ ] Índices criados corretamente
- [ ] Queries utilizam índices (verificar com `.explain()`)
- [ ] Sem documentos duplicados
- [ ] Integridade referencial mantida

**Notas:**
```
_______________________________________________________________
```

---

## 🚨 Testes de Erro e Edge Cases

### Cenários de Erro

- [ ] Bot sem permissões para enviar mensagens
- [ ] Canal de notificação deletado
- [ ] API externa (Twitch/YouTube) offline
- [ ] Rate limit atingido
- [ ] MongoDB desconectado
- [ ] Guild sem configuração (`guildConfig`)
- [ ] Streamer/canal não existente

**Notas:**
```
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
```

### Edge Cases

- [ ] Guild com 0 streamers cadastrados
- [ ] Guild com 100+ streamers cadastrados
- [ ] Streamer com nome muito longo
- [ ] Título de vídeo com caracteres especiais
- [ ] Usuário com infrações em múltiplas guilds
- [ ] Bot em 50+ servidores simultâneos

**Notas:**
```
_______________________________________________________________
_______________________________________________________________
```

---

## 🔐 Segurança e Isolamento

### Isolamento de Dados

- [ ] Guild A não vê dados da Guild B
- [ ] Comandos só afetam guild atual
- [ ] Notificações não vazam entre guilds
- [ ] Infrações isoladas por guild
- [ ] Configurações não são compartilhadas

**Notas:**
```
_______________________________________________________________
```

### Permissões

- [ ] Apenas moderadores acessam comandos de moderação
- [ ] Cargo imune funciona corretamente
- [ ] Owner tem acesso total ao painel
- [ ] Usuários comuns têm acesso limitado

**Notas:**
```
_______________________________________________________________
```

---

## 📝 Documentação

- [ ] `CHANGELOG.md` atualizado e claro
- [ ] `docs/refactor-multi-guild.md` completo
- [ ] Script de migração documentado
- [ ] README atualizado (se necessário)
- [ ] Comentários no código claros

**Notas:**
```
_______________________________________________________________
```

---

## ✅ Conclusão

### Resumo dos Testes

**Total de Testes:** _____  
**Testes Passaram:** _____  
**Testes Falharam:** _____  
**Taxa de Sucesso:** _____%

### Principais Problemas Encontrados

1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

### Aprovação

- [ ] **APROVADO** para produção
- [ ] **APROVADO COM RESSALVAS** (listar abaixo)
- [ ] **REPROVADO** (necessário correções)

**Ressalvas:**
```
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
```

### Assinatura

**Testador:** _________________  
**Data:** ___/___/2025  
**Assinatura:** _________________

---

**Observações Finais:**
```
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
```
