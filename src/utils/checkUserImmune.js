const { PermissionFlagsBits } = require('discord.js');
const RolePermissionsModel = require('../database/models/rolePermissions');

/**
 * Verifica se o usuário tem permissões especiais (imune a punições)
 * @param {GuildMember} member - Membro do servidor
 * @returns {Promise<boolean>} - True se o usuário é imune, false caso contrário
 */
async function isUserImmune(member) {
    if (!member) return false;

    // Dono do servidor é imune
    if (member.id === member.guild.ownerId) return true;

    // Administradores são imunes
    if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;

    try {
        // Buscar cargo imune do banco de dados
        const roleConfig = await RolePermissionsModel.findOne({ guildId: member.guild.id });

        if (roleConfig && roleConfig.immuneRoleId) {
            // Verificar se o membro tem o cargo imune cadastrado
            if (member.roles.cache.has(roleConfig.immuneRoleId)) return true;
        }

        // Fallback para variável de ambiente (compatibilidade com sistema antigo)
        if (process.env.CARGO_ADM && member.roles.cache.has(process.env.CARGO_ADM)) return true;

    } catch (error) {
        console.error('Erro ao verificar cargo imune:', error);
        // Em caso de erro, usar fallback para variável de ambiente
        if (process.env.CARGO_ADM && member.roles.cache.has(process.env.CARGO_ADM)) return true;
    }

    return false;
}

module.exports = { isUserImmune };
