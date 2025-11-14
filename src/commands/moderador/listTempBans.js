const { EmbedBuilder } = require('discord.js');
const { TempBan } = require('../../database/models/tempBan');
const { logger, commandExecuted } = require('../../logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function listTempBans(interaction) {
    if (!interaction.isCommand()) return;

    const context = {
        module: 'MODERATION',
        command: 'listarbanstemporarios',
        user: interaction.user.tag,
        guild: interaction.guild?.name
    };

    logger.debug('Iniciando comando listar bans temporários', context);

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) {
        logger.warn('Comando listar bans temporários bloqueado - canal não autorizado', context);
        return;
    }

    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) {
        logger.warn('Comando listar bans temporários negado - usuário sem permissão de moderador', context);
        return;
    }

    try {
        await interaction.deferReply({ ephemeral: true });

        const activeTempBans = await TempBan.find({
            guildId: interaction.guild.id,
            isActive: true
        }).sort({ unbanDate: 1 });

        if (activeTempBans.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('📋 Bans Temporários Ativos')
                .setDescription('Não há bans temporários ativos no momento.')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
            commandExecuted('listarbanstemporarios', interaction.user, interaction.guild, true);
            return;
        }

        const fields = activeTempBans.map((ban, index) => {
            const timeRemaining = ban.unbanDate.getTime() - Date.now();
            const timeRemainingText = timeRemaining > 0 
                ? `<t:${Math.floor(ban.unbanDate.getTime() / 1000)}:R>`
                : 'Expirando em breve';

            return {
                name: `${index + 1}. ${ban.username}`,
                value: `**Duração:** ${ban.duration}\n**Banido por:** ${ban.bannedBy}\n**Expira:** ${timeRemainingText}\n**Data do ban:** <t:${Math.floor(ban.banDate.getTime() / 1000)}:f>`,
                inline: true
            };
        });

        // Discord tem limite de 25 fields por embed
        const maxFields = 25;
        const totalPages = Math.ceil(fields.length / maxFields);
        const currentFields = fields.slice(0, maxFields);

        const embed = new EmbedBuilder()
            .setColor('Orange')
            .setTitle('📋 Bans Temporários Ativos')
            .setDescription(`Total de bans temporários ativos: **${activeTempBans.length}**${totalPages > 1 ? `\n*(Mostrando primeiros ${maxFields})*` : ''}`)
            .addFields(currentFields)
            .setTimestamp()
            .setFooter({ text: `Página 1${totalPages > 1 ? ` de ${totalPages}` : ''} • Comando executado por ${interaction.user.tag}` });

        await interaction.editReply({ embeds: [embed] });

        commandExecuted('listarbanstemporarios', interaction.user, interaction.guild, true);
        logger.info(`Lista de bans temporários exibida (${activeTempBans.length} bans ativos)`, context);

    } catch (error) {
        logger.error('Erro ao listar bans temporários', context, error);
        commandExecuted('listarbanstemporarios', interaction.user, interaction.guild, false);

        if (!interaction.replied && !interaction.deferred) {
            try {
                await interaction.reply({ content: 'Ocorreu um erro ao listar os bans temporários.', ephemeral: true });
            } catch (replyError) {
                logger.error('Erro ao responder interação após falha', context, replyError);
            }
        } else if (interaction.deferred) {
            try {
                await interaction.editReply({ content: 'Ocorreu um erro ao listar os bans temporários.' });
            } catch (editError) {
                logger.error('Erro ao editar resposta após falha', context, editError);
            }
        }
    }
};

module.exports = { listTempBans };
