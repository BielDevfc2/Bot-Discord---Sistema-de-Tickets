const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readJson } = require('../../util/jsonDb');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reputacao')
    .setDescription('Comandos de reputação')
    .addSubcommand(sc => sc.setName('perfil')
      .setDescription('Mostra seu perfil de reputação')
      .addUserOption(o => o.setName('usuario').setDescription('Usuário (opcional)'))
    )
    .addSubcommand(sc => sc.setName('top')
      .setDescription('Mostra top reputação')
      .addIntegerOption(o => o.setName('limite').setDescription('Quantos mostrar').setRequired(false))
    ),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();
    const path = './db/reputacao.json';
    const data = readJson(path) || {};
    if (!data[guildId]) data[guildId] = {};

    if (sub === 'perfil') {
      const user = interaction.options.getUser('usuario') || interaction.user;
      const rep = data[guildId][user.id] || { pontos: 0 };
      const embed = new EmbedBuilder().setTitle(`${user.username} — Reputação`).setColor('Green')
        .setDescription(`Pontos: **${rep.pontos || 0}**`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'top') {
      const limite = Math.min(interaction.options.getInteger('limite') || 10, 50);
      const list = Object.entries(data[guildId]).map(([id, v]) => ({ id, pontos: v.pontos || 0 }))
        .sort((a, b) => b.pontos - a.pontos).slice(0, limite);
      if (list.length === 0) return interaction.reply({ content: 'Nenhuma reputação registrada.', ephemeral: true });
      const desc = await Promise.all(list.map(async (u, i) => `#${i+1} — <@${u.id}> — ${u.pontos} pts`));
      const embed = new EmbedBuilder().setTitle('Top Reputação').setColor('Gold').setDescription(desc.join('\n'));
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
