const { EmbedBuilder } = require('discord.js');
const { client } = require('../../Client');
const { logger, commandExecuted, securityEvent } = require('../../logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');
const { TempBan } = require('../../models/tempBan');

async function unbanUser(interaction) {
    if (!interaction.isCommand()) return;

    const { options, member } = interaction;
    const context = {
        module: 'MODERATION',
        command: 'desbanir',
        user: interaction.user.tag,
        guild: interaction.guild?.name
    };

    logger.debug('Iniciando comando desbanir', context);

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) {
        logger.warn('Comando desbanir bloqueado - canal não autorizado', context);
        return;
    }

    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) {
        logger.warn('Comando desbanir negado - usuário sem permissão de moderador', context);
        return;
    }

    try {
        const userToUnban = options.getUser('usuario');

        logger.info(`Iniciando processo de desbanimento para usuário: ${userToUnban.tag}`, {
            ...context,
            targetUser: userToUnban.tag
        });

        const banList = await interaction.guild.bans.fetch();
        const isBanned = banList.has(userToUnban.id);

        if (!isBanned) {
            logger.warn(`Tentativa de desbanir usuário não banido: ${userToUnban.tag}`, context);
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription('Este usuário não está banido.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const reason = 'Você foi desbanido do servidor';

        await interaction.guild.members.unban(userToUnban.id, reason);

        // Verificar se havia um ban temporário ativo e cancelá-lo
        let wasTempBan = false;
        try {
            const activeTempBan = await TempBan.findOne({
                userId: userToUnban.id,
                guildId: interaction.guild.id,
                isActive: true
            });

            if (activeTempBan) {
                activeTempBan.isActive = false;
                await activeTempBan.save();
                wasTempBan = true;
                logger.info(`Ban temporário cancelado manualmente para ${userToUnban.tag}`, {
                    ...context,
                    targetUser: userToUnban.tag,
                    originalDuration: activeTempBan.duration
                });
            }
        } catch (tempBanError) {
            logger.error('Erro ao verificar/cancelar ban temporário', context, tempBanError);
        }

        // Tentativa de enviar DM
        try {
            const dmMessage = wasTempBan 
                ? 'Você foi desbanido manualmente do servidor (seu ban temporário foi cancelado).'
                : reason;
            await userToUnban.send(dmMessage);
            logger.debug(`DM enviada com sucesso para ${userToUnban.tag}`, context);
        } catch (dmError) {
            logger.warn(`Não foi possível enviar DM para ${userToUnban.tag}`, context, dmError);
        }

        const type = 'unbans';

        saveUserInfractions(
            userToUnban.id,
            userToUnban.tag,
            userToUnban.displayAvatarURL({ dynamic: true }),
            userToUnban.createdAt,
            userToUnban.joinedAt,
            type,
            reason,
            member.user.tag
        )

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(wasTempBan 
                ? `${userToUnban.tag} foi desbanido com sucesso! (Ban temporário cancelado)`
                : `${userToUnban.tag} foi desbanido com sucesso!`);
        await interaction.reply({ embeds: [embed], ephemeral: true });

        commandExecuted('desbanir', interaction.user, interaction.guild, true);
        securityEvent('USER_UNBANNED', userToUnban, interaction.guild, `Desbanido por ${interaction.user.tag}`);

        logger.info(`${userToUnban.tag} foi desbanido com sucesso por ${interaction.user.tag}`, {
            ...context,
            targetUser: userToUnban.tag
        });
    } catch (error) {
        logger.error('Erro ao desbanir o usuário', context, error);
        commandExecuted('desbanir', interaction.user, interaction.guild, false);
    }
};
module.exports = { unbanUser };
