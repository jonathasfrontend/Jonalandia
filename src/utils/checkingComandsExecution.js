const { EmbedBuilder } = require('discord.js');
const { client } = require("../Client");
const channelsIdBLockeds = require('../database/models/addChannel');
const RolePermissionsModel = require('../database/models/rolePermissions');

async function getBlockedChannels() {
    try {
        const channels = await channelsIdBLockeds.find();
        return channels.map(channel => channel.channelId);
    } catch (error) {
        console.error("Erro ao buscar canais bloqueados:", error);
        return [];
    }
}

async function checkingComandChannelBlocked(interaction) {
    const { channelId } = interaction

    const channelsIdBLocke = await getBlockedChannels();

    if (channelsIdBLocke.includes(channelId)) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setTitle("Este comando não pode ser usado neste canal")
            .setDescription('Vá ao canal <#1253377239370698873> para executar os comandos')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return false;
    }

    return true;
}

async function checkingComandExecuntionModerador(interaction) {
    const { member } = interaction;

    try {
        // Buscar cargo de moderador do banco de dados
        const roleConfig = await RolePermissionsModel.findOne({ guildId: interaction.guild.id });
        
        let moderatorRoleId = null;
        
        if (roleConfig && roleConfig.moderatorRoleId) {
            moderatorRoleId = roleConfig.moderatorRoleId;
        } else if (process.env.CARGO_MODERADOR) {
            // Fallback para variável de ambiente (compatibilidade com sistema antigo)
            moderatorRoleId = process.env.CARGO_MODERADOR;
        }

        if (moderatorRoleId && !member.roles.cache.has(moderatorRoleId)) {
            await interaction.deferReply( { ephemeral: true } );

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .setDescription('Você não tem permissão para usar este comando.')
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

            await interaction.editReply({ embeds: [embed], ephemeral: true });
            return false;
        }

    } catch (error) {
        console.error('Erro ao verificar cargo de moderador:', error);
        
        // Em caso de erro, usar fallback para variável de ambiente
        if (process.env.CARGO_MODERADOR && !member.roles.cache.has(process.env.CARGO_MODERADOR)) {
            await interaction.deferReply( { ephemeral: true } );

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .setDescription('Você não tem permissão para usar este comando.')
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

            await interaction.editReply({ embeds: [embed], ephemeral: true });
            return false;
        }
    }

    return true;
}


module.exports = { checkingComandChannelBlocked, checkingComandExecuntionModerador, getBlockedChannels };