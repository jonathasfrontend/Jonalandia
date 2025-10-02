const { EmbedBuilder } = require('discord.js');
const { client } = require('../../Client');
const { logger, commandExecuted, databaseEvent, securityEvent } = require('../../logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');
const { TempBan } = require('../../models/tempBan');

async function banUser(interaction) {
    if (!interaction.isCommand()) return;

    const { options, member } = interaction;
    const context = {
        module: 'MODERATION',
        command: 'banir',
        user: interaction.user.tag,
        guild: interaction.guild?.name
    };

    logger.debug('Iniciando comando banir', context);

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) {
        logger.warn('Comando banir bloqueado - canal não autorizado', context);
        return;
    }

    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) {
        logger.warn('Comando banir negado - usuário sem permissão de moderador', context);
        return;
    }

    try {
        await interaction.deferReply({ ephemeral: true });

        const userToBan = options.getUser('usuario');
        const duration = options.getString('duracao');
        const memberToBan = await interaction.guild.members.fetch(userToBan.id);

        logger.info(`Iniciando processo de banimento para usuário: ${userToBan.tag}${duration ? ` (duração: ${duration})` : ' (permanente)'}`, {
            ...context,
            targetUser: userToBan.tag,
            duration: duration || 'permanente'
        });

        // Calcular data de unban se for ban temporário
        let unbanDate = null;
        let durationText = 'permanente';
        let dmMessage = "Você foi banido do servidor por atitudes que contrariam as regras do servidor.";

        if (duration) {
            const now = new Date();
            switch (duration) {
                case '1m':
                    unbanDate = new Date(now.getTime() + 1 * 60 * 1000);
                    durationText = '1 minuto';
                    break;
                case '1h':
                    unbanDate = new Date(now.getTime() + 1 * 60 * 60 * 1000);
                    durationText = '1 hora';
                    break;
                case '5h':
                    unbanDate = new Date(now.getTime() + 5 * 60 * 60 * 1000);
                    durationText = '5 horas';
                    break;
                case '1d':
                    unbanDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                    durationText = '1 dia';
                    break;
                case '10d':
                    unbanDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
                    durationText = '10 dias';
                    break;
                default:
                    logger.warn(`Duração de ban inválida: ${duration}`, context);
                    break;
            }

            if (unbanDate) {
                const userEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Você foi banido temporariamente')
                    .setDescription(`Você foi banido temporariamente do servidor por **${durationText}** por atitudes que contrariam as regras. O ban será removido automaticamente em ${unbanDate.toLocaleString('pt-BR')}.`)
                    .setTimestamp()
                    .setFooter({ text: `Banido por ${member.user.tag}` });
            }
        }

        // Tentativa de enviar DM
        try {
            await userToBan.send(userEmbed);
            logger.debug(`DM enviada com sucesso para ${userToBan.tag}`, context);
        } catch (dmError) {
            logger.warn(`Não foi possível enviar DM para ${userToBan.tag}`, context, dmError);
        }

        const reason = unbanDate 
            ? `O usuário ${userToBan.tag} foi banido temporariamente do servidor por ${durationText}.`
            : `O usuário ${userToBan.tag} foi banido do servidor.`;
        const type = 'bans';

        // Salvar infração no banco de dados
        try {
            await saveUserInfractions(
                userToBan.id,
                userToBan.tag,
                userToBan.displayAvatarURL({ dynamic: true }),
                userToBan.createdAt,
                memberToBan.joinedAt,
                type,
                reason,
                member.user.tag
            );
            databaseEvent('INSERT', 'UserInfractions', true, `Infração registrada para ${userToBan.tag}`);
        } catch (dbError) {
            logger.error('Erro ao salvar infração no banco', context, dbError);
            databaseEvent('INSERT', 'UserInfractions', false, dbError.message);
        }

        // Executar o banimento
        await memberToBan.ban({ reason: "Para dúvidas, fale com o dono do servidor." });

        // Se for ban temporário, salvar no banco de dados
        if (unbanDate) {
            try {
                const tempBan = new TempBan({
                    userId: userToBan.id,
                    username: userToBan.tag,
                    guildId: interaction.guild.id,
                    bannedBy: member.user.tag,
                    banReason: reason,
                    unbanDate: unbanDate,
                    duration: durationText
                });
                
                await tempBan.save();
                databaseEvent('INSERT', 'TempBan', true, `Ban temporário registrado para ${userToBan.tag}`);
                logger.info(`Ban temporário registrado no banco de dados para ${userToBan.tag}`, {
                    ...context,
                    unbanDate: unbanDate.toISOString(),
                    duration: durationText
                });
            } catch (tempBanError) {
                logger.error('Erro ao salvar ban temporário no banco', context, tempBanError);
                databaseEvent('INSERT', 'TempBan', false, tempBanError.message);
            }
        }

        securityEvent('USER_BANNED', userToBan, interaction.guild, `Banido por ${member.user.tag}${unbanDate ? ` (temporário: ${durationText})` : ''}`);
        logger.info(`Usuário ${userToBan.tag} banido com sucesso${unbanDate ? ` (temporário: ${durationText})` : ''}`, context);

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(unbanDate ? 'Usuário Banido Temporariamente' : 'Usuário Banido')
            .setDescription(unbanDate 
                ? `O usuário ${userToBan.tag} foi banido temporariamente por **${durationText}**.\nO ban será removido automaticamente em: ${unbanDate.toLocaleString('pt-BR')}`
                : `O usuário ${userToBan.tag} foi banido com sucesso.`)
            .setTimestamp()
            .setFooter({ text: `Ação realizada por ${member.user.tag}` });

        await interaction.editReply({ embeds: [embed] });

        // Log no canal
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
        if (logChannel) {
            try {
                const logMessage = unbanDate 
                    ? `🔨 O usuário ${userToBan.tag} foi banido temporariamente por **${durationText}**. Unban automático em: ${unbanDate.toLocaleString('pt-BR')}`
                    : `🔨 O usuário ${userToBan.tag} foi banido do servidor.`;
                await logChannel.send(logMessage);
                logger.debug('Mensagem de log enviada para canal', context);
            } catch (logError) {
                logger.error('Erro ao enviar log para canal', context, logError);
            }
        } else {
            logger.warn('Canal de logs não encontrado', context);
        }

        commandExecuted('banir', interaction.user, interaction.guild, true);
    } catch (error) {
        logger.error('Erro ao banir usuario', context, error);
        commandExecuted('banir', interaction.user, interaction.guild, false);

        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        if (logChannel) {
            try {
                await logChannel.send(`Erro ao banir usuario: ${error.message}`);
            } catch (logError) {
                logger.error('Erro ao enviar mensagem de erro para canal', context, logError);
            }
        }

        if (!interaction.replied && !interaction.deferred) {
            try {
                await interaction.reply({ content: 'Ocorreu um erro ao banir o usuário.', ephemeral: true });
            } catch (replyError) {
                logger.error('Erro ao responder interação após falha', context, replyError);
            }
        } else if (interaction.deferred) {
            try {
                await interaction.editReply({ content: 'Ocorreu um erro ao banir o usuário.' });
            } catch (editError) {
                logger.error('Erro ao editar resposta após falha', context, editError);
            }
        }
    }
};

module.exports = { banUser };
