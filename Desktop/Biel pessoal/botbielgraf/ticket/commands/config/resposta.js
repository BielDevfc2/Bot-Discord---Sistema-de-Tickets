const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readJson, writeJson } = require('../../util/jsonDb');
const cfg = require('../../db/config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resposta')
    .setDescription('Gerenciar templates de resposta')
    .addSubcommand(sub => sub.setName('criar')
      .setDescription('Cria um template')
      .addStringOption(o => o.setName('nome').setDescription('Nome do template').setRequired(true))
      .addStringOption(o => o.setName('titulo').setDescription('Título do embed').setRequired(true))
      .addStringOption(o => o.setName('mensagem').setDescription('Mensagem do template').setRequired(true))
    )
    .addSubcommand(sub => sub.setName('usar')
      .setDescription('Usar um template no canal')
      .addStringOption(o => o.setName('nome').setDescription('Nome do template').setRequired(true))
    )
    .addSubcommand(sub => sub.setName('deletar')
      .setDescription('Deleta um template')
      .addStringOption(o => o.setName('nome').setDescription('Nome do template').setRequired(true))
    )
    .addSubcommand(sub => sub.setName('listar')
      .setDescription('Lista templates do servidor')
    ),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();
    const path = './db/respostas.json';
    const data = readJson(path) || {};
    if (!data[guildId]) data[guildId] = {};

    // permission check for management
    const staffRole = cfg?.cargo_staff;
    const isStaff = (staffRole && interaction.member.roles.cache.has(staffRole)) || (interaction.user.id === process.env.OWNER_ID);

    if (sub === 'criar') {
      if (!isStaff) return interaction.reply({ content: '❌ | Permissão negada.', ephemeral: true });
      const nome = interaction.options.getString('nome');
      const titulo = interaction.options.getString('titulo');
      const mensagem = interaction.options.getString('mensagem');
      data[guildId][nome] = { titulo, mensagem };
      writeJson(path, data);
      return interaction.reply({ content: `✅ Template **${nome}** criado.`, ephemeral: true });
    }

    if (sub === 'usar') {
      const nome = interaction.options.getString('nome');
      const tpl = data[guildId][nome];
      if (!tpl) return interaction.reply({ content: '❌ Template não encontrado.', ephemeral: true });
      const embed = new EmbedBuilder().setTitle(tpl.titulo).setDescription(tpl.mensagem).setColor('Random');
      await interaction.channel.send({ embeds: [embed] });
      return interaction.reply({ content: `✅ Template **${nome}** enviado.`, ephemeral: true });
    }

    if (sub === 'deletar') {
      if (!isStaff) return interaction.reply({ content: '❌ | Permissão negada.', ephemeral: true });
      const nome = interaction.options.getString('nome');
      if (!data[guildId][nome]) return interaction.reply({ content: '❌ Template não encontrado.', ephemeral: true });
      delete data[guildId][nome];
      writeJson(path, data);
      return interaction.reply({ content: `✅ Template **${nome}** deletado.`, ephemeral: true });
    }

    if (sub === 'listar') {
      const keys = Object.keys(data[guildId] || {});
      if (keys.length === 0) return interaction.reply({ content: 'Nenhum template configurado.', ephemeral: true });
      const embed = new EmbedBuilder().setTitle('Templates').setDescription(keys.map(k => `• ${k}`).join('\n')).setColor('Random');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
