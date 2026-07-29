const { PermissionFlagsBits } = require('discord.js');
const { getRolePermissions } = require('./cache');

async function isUserImmune(member) {
    if (!member) return false;
    if (member.id === member.guild.ownerId) return true;
    if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;

    try {
        const roleConfig = await getRolePermissions(member.guild.id);
        if (roleConfig && roleConfig.immuneRoleId) {
            if (member.roles.cache.has(roleConfig.immuneRoleId)) return true;
        }
    } catch (error) {
        console.error('Erro ao verificar cargo imune:', error);
    }

    return false;
}

module.exports = { isUserImmune };
