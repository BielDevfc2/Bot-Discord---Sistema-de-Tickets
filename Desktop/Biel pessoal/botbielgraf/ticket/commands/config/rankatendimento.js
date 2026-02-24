const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readJson } = require('../../util/jsonDb');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rankatendimento')
    .setDescription('Mostra top staff por média de avaliações')
    .addIntegerOption(o => o.setName('limite').setDescription('Quantos mostrar').setRequired(false)),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const path = './db/avaliacoes.json';
    const data = readJson(path) || {};
    const guildData = data[guildId] || {};
    const limite = Math.min(interaction.options.getInteger('limite') || 10, 50);
    const list = Object.entries(guildData).map(([userId, stats]) => ({ userId, media: stats.media || 0, total: stats.total || 0 }))
      .filter(x => x.total > 0)
      .sort((a, b) => b.media - a.media)
      .slice(0, limite);
    if (list.length === 0) return interaction.reply({ content: 'Nenhuma avaliação registrada.', ephemeral: true });
    const desc = list.map((u, i) => `#${i+1} — <@${u.userId}> — Média: **${(u.media || 0).toFixed(2)}** (${u.total} avaliações)`);
    const embed = new EmbedBuilder().setTitle('Rank Atendimento').setColor('Purple').setDescription(desc.join('\n'));
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
