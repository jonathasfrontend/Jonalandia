const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { db } = require('../../database/service');
const { client } = require("../../Client");
const { logger, securityEvent } = require('../../logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function voteParaBan(interaction) {
  if (!interaction.isCommand()) return;
  const { options } = interaction;

  const authorized = await checkingComandChannelBlocked(interaction);
  if (!authorized) return;
  const modAuthorized = await checkingComandExecuntionModerador(interaction);
  if (!modAuthorized) return;

  try {
      const targetUser = options.getUser('usuario');
      const endTime = new Date(Date.now() + 5 * 60 * 1000);
      const guildId = interaction.guild.id;

      const existingVote = await db.voteBan.findOne({ guildId, targetUserId: targetUser.id });
      if (existingVote && new Date(existingVote.endTime) > new Date()) {
        return interaction.reply({ content: 'Já existe uma votação ativa para este usuário.', ephemeral: true });
      }

      const newVote = await db.voteBan.create({
        guildId,
        targetUserId: targetUser.id, targetUsername: targetUser.username,
        targetAvatarUrl: targetUser.displayAvatarURL({ dynamic: true }),
        startedBy: interaction.user.id, endTime,
        votes: JSON.stringify([]),
      });

      const btnSim = new ButtonBuilder().setCustomId(`sim${newVote.id}`).setLabel('Sim').setStyle(ButtonStyle.Success);
      const btnNao = new ButtonBuilder().setCustomId(`nao${newVote.id}`).setLabel('Não').setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(btnSim, btnNao);

      const embed = new EmbedBuilder()
        .setColor("#ff0000").setTitle('Votação para Ban')
        .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`Votação para banir **${targetUser.tag}**. Votação termina <t:${Math.floor(endTime.getTime() / 1000)}:R>.`);

      await interaction.reply({ embeds: [embed], components: [row] });
      logger.info(`Votação criada para banir ${targetUser.tag}`);

      setTimeout(async () => {
        try {
          const voteData = await db.voteBan.findOne({ id: newVote.id });
          if (!voteData) return;
          const votes = Array.isArray(voteData.votes) ? voteData.votes : [];
          const simVotes = votes.filter(v => v.vote === 'sim').length;
          const naoVotes = votes.filter(v => v.vote === 'nao').length;

          const resultEmbed = new EmbedBuilder()
            .setColor(simVotes > naoVotes ? '#00ff00' : '#ff0000')
            .setTitle(simVotes > naoVotes ? '✅ Usuário Banido' : '❌ Votação Rejeitada')
            .setDescription(`**${targetUser.tag}**\nSim: ${simVotes} | Não: ${naoVotes}`);

          if (simVotes > naoVotes) {
            try {
              const member = await interaction.guild.members.fetch(targetUser.id);
              await member.ban({ reason: 'Banido por votação da comunidade.' });
            } catch (e) {
              logger.warn(`Não foi possível banir ${targetUser.tag} via votação`);
            }
          }

          await interaction.editReply({ embeds: [resultEmbed], components: [] });
        } catch (e) {
          logger.error('Erro ao finalizar votação', e);
        }
      }, 5 * 60 * 1000);

  } catch (error) {
      logger.error('Erro no voteparaban', error);
  }
}

async function handleVote(interaction) {
  if (!interaction.isButton()) return;
  const customId = interaction.customId;
  if (!customId.startsWith('sim') && !customId.startsWith('nao')) return;

  const voteId = customId.replace(/^(sim|nao)/, '');
  const voteValue = customId.startsWith('sim') ? 'sim' : 'nao';

  try {
    const vote = await db.voteBan.findOne({ id: parseInt(voteId) });
    if (!vote) return interaction.reply({ content: 'Votação não encontrada.', ephemeral: true });

    if (new Date(vote.endTime) < new Date()) {
      return interaction.reply({ content: 'Votação já encerrou.', ephemeral: true });
    }

    const votes = Array.isArray(vote.votes) ? vote.votes : [];
    if (votes.some(v => v.userId === interaction.user.id)) {
      return interaction.reply({ content: 'Você já votou.', ephemeral: true });
    }

    votes.push({ userId: interaction.user.id, username: interaction.user.username, vote: voteValue });
    await db.voteBan.update(vote.id, { votes: JSON.stringify(votes) });

    await interaction.reply({ content: `Voto registrado: **${voteValue.toUpperCase()}**`, ephemeral: true });
  } catch (error) {
    logger.error('Erro ao processar voto', error);
  }
}

client.on('interactionCreate', handleVote);

module.exports = { voteParaBan };
