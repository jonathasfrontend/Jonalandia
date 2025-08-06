const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { client } = require('../../Client');
const { checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');
const { logger, commandExecuted } = require('../../logger');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Importar todos os schemas/models existentes
const onAddChannelSchema = require('../../models/addChannel.js');
const onGameNotificationSchema = require('../../models/gameNotification.js');
const onInfracoesUsersSchema = require('../../models/infracoesUsers.js');
const onNotificationBirthdaySchema = require('../../models/notificationBirthday.js');
const onNotificationTwitchSchema = require('../../models/notificationTwitch.js');
const onNotificationYoutubeSchema = require('../../models/notificationYoutube.js');
const onPremioSorteioSchema = require('../../models/premioSorteio.js');
const onSorteioSchema = require('../../models/sorteio.js');
const onTwitchStreamersSchema = require('../../models/streamers.js');
const onVotoBanUserSchema = require('../../models/votoBanUser.js');
const onYoutubeChannelSchema = require('../../models/youtubeChannel.js');

async function backup(interaction) {
    // Log inicial para debug
    logger.debug('Comando backup iniciado', {
        user: interaction.user.tag,
        guild: interaction.guild?.name
    });

    // Verificar se todos os modelos foram importados corretamente
    const modelChecks = [
        { name: 'onAddChannelSchema', model: onAddChannelSchema },
        { name: 'onGameNotificationSchema', model: onGameNotificationSchema },
        { name: 'onInfracoesUsersSchema', model: onInfracoesUsersSchema },
        { name: 'onNotificationBirthdaySchema', model: onNotificationBirthdaySchema },
        { name: 'onNotificationTwitchSchema', model: onNotificationTwitchSchema },
        { name: 'onNotificationYoutubeSchema', model: onNotificationYoutubeSchema },
        { name: 'onPremioSorteioSchema', model: onPremioSorteioSchema },
        { name: 'onSorteioSchema', model: onSorteioSchema },
        { name: 'onTwitchStreamersSchema', model: onTwitchStreamersSchema },
        { name: 'onVotoBanUserSchema', model: onVotoBanUserSchema },
        { name: 'onYoutubeChannelSchema', model: onYoutubeChannelSchema }
    ];

    for (const check of modelChecks) {
        if (!check.model) {
            logger.warn(`Modelo ${check.name} não foi importado corretamente`, {
                user: interaction.user.tag,
                model: check.name
            });
        }
    }

    // Verificar permissões de moderador
    const isAuthorized = await checkingComandExecuntionModerador(interaction);
    if (!isAuthorized) return;

    // Defer reply para operações longas
    await interaction.deferReply({ ephemeral: true });

    const context = {
        module: 'COMMAND',
        command: 'backup',
        user: interaction.user.tag,
        userId: interaction.user.id,
        guild: interaction.guild?.name,
        guildId: interaction.guild?.id
    };

    logger.info('Iniciando processo de backup do banco de dados', context);

    try {
        logger.debug('Verificando conexão com MongoDB...', context);
        
        // Verificar conexão com MongoDB
        if (mongoose.connection.readyState !== 1) {
            logger.error('MongoDB não está conectado', {
                ...context,
                readyState: mongoose.connection.readyState
            });
            throw new Error('Conexão com MongoDB não está ativa');
        }
        
        logger.debug('Conexão MongoDB confirmada', context);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5); // YYYY-MM-DDTHH-mm-ss
        const backupDir = path.join(__dirname, '..', '..', 'backups', `backup_${timestamp}`);
        
        // Criar diretório de backup
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
            logger.debug('Diretório de backup criado', { ...context, backupDir });
        }

        // Mapear todos os modelos/schemas disponíveis com validação
        const collections = [];
        
        // Adicionar coleções apenas se os modelos existirem
        const modelsToBackup = [
            { name: 'addChannels', model: onAddChannelSchema, filename: 'addChannels.json' },
            { name: 'gameNotifications', model: onGameNotificationSchema, filename: 'gameNotifications.json' },
            { name: 'infracaoUsuarios', model: onInfracoesUsersSchema, filename: 'infracaoUsuarios.json' },
            { name: 'notificationBirthday', model: onNotificationBirthdaySchema, filename: 'notificationBirthday.json' },
            { name: 'notificationTwitch', model: onNotificationTwitchSchema, filename: 'notificationTwitch.json' },
            { name: 'notificationYoutube', model: onNotificationYoutubeSchema, filename: 'notificationYoutube.json' },
            { name: 'premioSorteio', model: onPremioSorteioSchema, filename: 'premioSorteio.json' },
            { name: 'sorteio', model: onSorteioSchema, filename: 'sorteio.json' },
            { name: 'twitchStreamers', model: onTwitchStreamersSchema, filename: 'twitchStreamers.json' },
            { name: 'votoBanUser', model: onVotoBanUserSchema, filename: 'votoBanUser.json' },
            { name: 'youtubeChannels', model: onYoutubeChannelSchema, filename: 'youtubeChannels.json' }
        ];

        // Validar modelos antes de adicionar às coleções
        for (const modelInfo of modelsToBackup) {
            if (modelInfo.model && typeof modelInfo.model.find === 'function') {
                collections.push(modelInfo);
                logger.debug(`Modelo ${modelInfo.name} validado e adicionado para backup`, context);
            } else {
                logger.warn(`Modelo ${modelInfo.name} não é válido, pulando...`, context);
            }
        }

        const backupResults = [];
        let totalDocuments = 0;
        let successfulCollections = 0;
        let failedCollections = 0;

        const embedProgress = new EmbedBuilder()
            .setColor('Yellow')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setTitle('🔄 Backup em Andamento...')
            .setDescription('Iniciando processo de backup das coleções MongoDB')
            .addFields({ name: 'Status', value: 'Preparando backup...', inline: false })
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

        await interaction.editReply({ embeds: [embedProgress] });

        // Processar cada coleção com tratamento robusto de erros
        for (let i = 0; i < collections.length; i++) {
            const collection = collections[i];
            
            try {
                logger.debug(`Iniciando backup da coleção: ${collection.name} (${i + 1}/${collections.length})`, context);

                // Atualizar embed de progresso
                const progressEmbed = new EmbedBuilder()
                    .setColor('Yellow')
                    .setAuthor({
                        name: client.user.username,
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    })
                    .setTitle('🔄 Backup em Andamento...')
                    .setDescription(`Processando coleção: **${collection.name}**`)
                    .addFields(
                        { name: 'Progresso', value: `${i + 1}/${collections.length} coleções`, inline: true },
                        { name: 'Status', value: `Fazendo backup de ${collection.name}...`, inline: true }
                    )
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

                await interaction.editReply({ embeds: [progressEmbed] });

                // Verificar se o modelo ainda está disponível
                if (!collection.model || typeof collection.model.find !== 'function') {
                    throw new Error(`Modelo ${collection.name} não é válido ou não tem método find`);
                }

                // Buscar todos os documentos da coleção com timeout
                const documents = await Promise.race([
                    collection.model.find({}).lean().exec(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout na busca de dados')), 30000)
                    )
                ]);
                
                const docCount = Array.isArray(documents) ? documents.length : 0;
                totalDocuments += docCount;

                // Nome do arquivo com timestamp
                const filename = `${collection.filename.replace('.json', '')}_${timestamp}.json`;
                const filePath = path.join(backupDir, filename);

                // Estrutura do backup com metadados
                const backupData = {
                    metadata: {
                        collection: collection.name,
                        backupDate: new Date().toISOString(),
                        documentCount: docCount,
                        backupVersion: '1.0.0',
                        botVersion: '1.1.6', // Fixo para evitar require
                        executedBy: {
                            username: interaction.user.tag,
                            userId: interaction.user.id
                        }
                    },
                    data: documents || []
                };

                // Salvar arquivo JSON com tratamento de erro
                try {
                    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8');
                } catch (writeError) {
                    throw new Error(`Erro ao escrever arquivo ${filename}: ${writeError.message}`);
                }

                // Verificar se o arquivo foi criado corretamente
                if (!fs.existsSync(filePath)) {
                    throw new Error(`Arquivo ${filename} não foi criado corretamente`);
                }

                const fileSize = fs.statSync(filePath).size;

                backupResults.push({
                    collection: collection.name,
                    filename,
                    documentCount: docCount,
                    status: 'success',
                    size: fileSize
                });

                successfulCollections++;
                logger.info(`Backup da coleção ${collection.name} concluído com sucesso`, {
                    ...context,
                    collection: collection.name,
                    documentCount: docCount,
                    filename,
                    fileSize: `${(fileSize / 1024).toFixed(2)} KB`
                });

            } catch (collectionError) {
                failedCollections++;
                const errorMessage = collectionError.message || 'Erro desconhecido';
                
                backupResults.push({
                    collection: collection.name,
                    status: 'failed',
                    error: errorMessage
                });

                logger.error(`Erro ao fazer backup da coleção ${collection.name}`, {
                    ...context,
                    collection: collection.name,
                    error: errorMessage
                });
                
                // Continuar com a próxima coleção mesmo se esta falhou
                continue;
            }
        }

        // Criar arquivo de relatório do backup
        const reportData = {
            backupSummary: {
                timestamp: new Date().toISOString(),
                totalCollections: collections.length,
                successfulCollections,
                failedCollections,
                totalDocuments,
                executedBy: {
                    username: interaction.user.tag,
                    userId: interaction.user.id
                },
                guildInfo: {
                    name: interaction.guild?.name,
                    id: interaction.guild?.id
                }
            },
            results: backupResults
        };

        const reportPath = path.join(backupDir, `backup_report_${timestamp}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), 'utf8');

        // Calcular tamanho total do backup
        let totalSize = 0;
        const files = fs.readdirSync(backupDir);
        files.forEach(file => {
            totalSize += fs.statSync(path.join(backupDir, file)).size;
        });

        const formatSize = (bytes) => {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        // Embed de resultado
        const color = failedCollections > 0 ? 'Orange' : 'Green';
        const statusIcon = failedCollections > 0 ? '⚠️' : '✅';
        const statusText = failedCollections > 0 ? 'Concluído com avisos' : 'Concluído com sucesso';

        const embedResult = new EmbedBuilder()
            .setColor(color)
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setTitle(`${statusIcon} Backup ${statusText}`)
            .setDescription('Processo de backup das coleções MongoDB finalizado')
            .addFields(
                { name: '📊 Resumo', value: `**Total de Coleções:** ${collections.length}\n**Sucessos:** ${successfulCollections}\n**Falhas:** ${failedCollections}\n**Total de Documentos:** ${totalDocuments}`, inline: true },
                { name: '📁 Arquivos', value: `**Localização:** \`${backupDir}\`\n**Tamanho Total:** ${formatSize(totalSize)}\n**Arquivos Criados:** ${files.length}`, inline: true },
                { name: '🕐 Detalhes', value: `**Data/Hora:** ${new Date().toLocaleString('pt-BR')}\n**Executor:** ${interaction.user.tag}\n**Servidor:** ${interaction.guild?.name || 'DM'}`, inline: false }
            )
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

        // Adicionar detalhes das coleções se houver falhas
        if (failedCollections > 0) {
            const failedList = backupResults
                .filter(result => result.status === 'failed')
                .map(result => `❌ ${result.collection}: ${result.error}`)
                .join('\n');
            
            if (failedList.length > 0 && failedList.length <= 1024) {
                embedResult.addFields({ name: '❌ Falhas Encontradas', value: failedList, inline: false });
            }
        }

        await interaction.editReply({ embeds: [embedResult] });

        // Log final
        commandExecuted('backup', interaction.user, interaction.guild, true);
        logger.info('Processo de backup finalizado', {
            ...context,
            successfulCollections,
            failedCollections,
            totalDocuments,
            totalSize: formatSize(totalSize),
            backupDir
        });

    } catch (error) {
        const errorMessage = error.message || 'Erro desconhecido durante o backup';
        
        logger.error('Erro crítico ao executar comando backup', {
            ...context,
            error: errorMessage,
            stack: error.stack
        });

        try {
            const embedError = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .setTitle('❌ Erro no Backup')
                .setDescription('Ocorreu um erro durante o processo de backup')
                .addFields(
                    { name: 'Erro', value: `\`${errorMessage}\``, inline: false },
                    { name: 'Coleções processadas', value: `${successfulCollections} de ${collections?.length || 0}`, inline: true },
                    { name: 'Documentos salvos', value: `${totalDocuments}`, inline: true }
                )
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

            await interaction.editReply({ embeds: [embedError] });
        } catch (replyError) {
            logger.error('Erro ao enviar resposta de erro', context, replyError);
        }

        commandExecuted('backup', interaction.user, interaction.guild, false, errorMessage);
    }
}

module.exports = { backup };
