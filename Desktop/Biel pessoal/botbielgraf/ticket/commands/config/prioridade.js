const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readJson, writeJson } = require('../../util/jsonDb');
const cfg = require('../../db/config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('prioridade')
    .setDescription('Gerenciar prioridades por cargo')
    .addSubcommand(sc => sc.setName('adicionar')
      .setDescription('Adiciona uma prioridade para um cargo')
      .addRoleOption(o => o.setName('cargo').setDescription('Cargo').setRequired(true))
      .addStringOption(o => o.setName('nivel').setDescription('Nível/label da prioridade').setRequired(true))
      .addStringOption(o => o.setName('cor').setDescription('Cor HEX (ex: #FF0000)').setRequired(false))
    )
    .addSubcommand(sc => sc.setName('remover')
      .setDescription('Remove prioridade de um cargo')
      .addRoleOption(o => o.setName('cargo').setDescription('Cargo').setRequired(true))
    )
    .addSubcommand(sc => sc.setName('listar')
      .setDescription('Lista prioridades do servidor')
    ),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();
    const path = './db/prioridade.json';
    const data = readJson(path) || {};
    if (!data[guildId]) data[guildId] = {};

    const staffRole = cfg?.cargo_staff;
    const isStaff = (staffRole && interaction.member.roles.cache.has(staffRole)) || (interaction.user.id === process.env.OWNER_ID);
    if (!isStaff) return interaction.reply({ content: '❌ | Permissão negada.', ephemeral: true });

    if (sub === 'adicionar') {
      const role = interaction.options.getRole('cargo');
      const nivel = interaction.options.getString('nivel');
      const cor = interaction.options.getString('cor') || null;
      data[guildId][role.id] = { nivel, cor };
      writeJson(path, data);
      return interaction.reply({ content: `✅ Prioridade adicionada para ${role.name}.`, ephemeral: true });
    }

    if (sub === 'remover') {
      const role = interaction.options.getRole('cargo');
      if (!data[guildId][role.id]) return interaction.reply({ content: '❌ Cargo não tem prioridade configurada.', ephemeral: true });
      delete data[guildId][role.id];
      writeJson(path, data);
      return interaction.reply({ content: `✅ Prioridade removida de ${role.name}.`, ephemeral: true });
    }

    if (sub === 'listar') {
      const entries = Object.entries(data[guildId] || {});
      if (entries.length === 0) return interaction.reply({ content: 'Nenhuma prioridade configurada.', ephemeral: true });
      const embed = new EmbedBuilder().setTitle('Prioridades').setColor('Blue')
        .setDescription(entries.map(([roleId, info]) => `• <@&${roleId}> — **${info.nivel}** ${info.cor ? `(${info.cor})` : ''}`).join('\n'));
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
