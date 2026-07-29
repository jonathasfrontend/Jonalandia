const { logger } = require('../../logger');
const { client } = require('../../Client');
const { getRolePermissions } = require('../../utils/cache');

async function ruleMembreAdd(member) {
    const context = { module: 'ROLES', user: member.user.tag, guild: member.guild?.name };

    try {
        const roleConfig = await getRolePermissions(member.guild.id);
        let newMemberRoleId = roleConfig?.newMemberRoleId || process.env.CARGO_RECEM_CHEGADO;

        if (!newMemberRoleId) {
            logger.warn('Nenhum cargo de novo membro configurado', context);
            return;
        }

        await member.roles.add(newMemberRoleId);
        logger.info(`Cargo de novo membro adicionado para ${member.user.tag}`, context);

        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
        if (logChannel) logChannel.send(`Cargo de novo membro adicionado a ${member.user.tag}.`);
    } catch (error) {
        logger.error(`Erro ao adicionar cargo para ${member.user.tag}`, context, error);
    }
}

module.exports = { ruleMembreAdd };
