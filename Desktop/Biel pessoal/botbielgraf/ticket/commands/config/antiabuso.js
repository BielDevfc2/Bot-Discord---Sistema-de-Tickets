const { SlashCommandBuilder } = require('discord.js');
const { readJson, writeJson } = require('../../util/jsonDb');
const { successEmbed, errorEmbed, warningEmbed, infoEmbed } = require('../../util/embeds');
const { validateInput, validateCommand } = require('../../util/security');
const logger = require('../../util/logger');
const cfg = require('../../db/config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antiabuso')
    .setDescription('🛡️ Configurar limites anti-abuso de tickets')
    .addSubcommand(sc => sc.setName('set')
      .setDescription('Define máximo de tickets e cooldown')
      .addIntegerOption(o => o.setName('max').setDescription('Máximo de tickets abertos por usuário').setRequired(true).setMinValue(1).setMaxValue(50))
      .addIntegerOption(o => o.setName('cooldown').setDescription('Cooldown em segundos entre aberturas').setRequired(true).setMinValue(1).setMaxValue(3600))
    )
    .addSubcommand(sc => sc.setName('info')
      .setDescription('Mostra a configuração atual de anti-abuso')
    )
    .addSubcommand(sc => sc.setName('reset')
      .setDescription('Reseta os dados anti-abuso do servidor')
    ),

  async execute(interaction) {
    try {
      const guildId = interaction.guild.id;
      const sub = interaction.options.getSubcommand();
      const path = require('path').join(__dirname, '../../db/antiabuso.json');

      // Verificar permissão
      const staffRole = cfg?.cargo_staff;
      const isStaff = (staffRole && interaction.member.roles.cache.has(staffRole)) || (interaction.user.id === process.env.OWNER_ID);
      
      if (!isStaff) {
        logger.warn(`Acesso negado ao comando antiabuso`, {
          userId: interaction.user.id,
          username: interaction.user.tag,
          guildId: guildId
        });

        return interaction.reply({
          embeds: [errorEmbed('Acesso Negado', 'Você não tem permissão para usar este comando. Entre em contato com a administração do servidor.')],
          ephemeral: true
        });
      }

      // Inicializar dados com garantia de existência
      let data = {};
      try {
        data = readJson(path) || {};
      } catch (e) {
        logger.warn('Erro ao ler antiabuso.json, criando novo', { error: e.message });
      }
      
      if (!data.settings) data.settings = {};
      if (!data.data) data.data = {};
      if (!data.data[guildId]) data.data[guildId] = {};

      // Subcomando: SET
      if (sub === 'set') {
        const max = interaction.options.getInteger('max');
        const cooldown = interaction.options.getInteger('cooldown');

        // Validar entrada
        if (max < 1 || max > 50) {
          return interaction.reply({
            embeds: [errorEmbed('Valor Inválido', 'O máximo de tickets deve estar entre 1 e 50.')],
            ephemeral: true
          });
        }

        if (cooldown < 1 || cooldown > 3600) {
          return interaction.reply({
            embeds: [errorEmbed('Valor Inválido', 'O cooldown deve estar entre 1 e 3600 segundos (1 hora).')],
            ephemeral: true
          });
        }

        data.settings[guildId] = { max, cooldown, updatedAt: new Date().toISOString(), updatedBy: interaction.user.id };
        writeJson(path, data);

        logger.command(
          interaction.user.tag,
          'antiabuso set',
          interaction.guild.name,
          { max, cooldown }
        );

        return interaction.reply({
          embeds: [successEmbed(
            'Anti-Abuso Configurado',
            'As configurações de anti-abuso foram atualizadas com sucesso!',
            {
              fields: [
                { name: '📊 Máximo de Tickets', value: `${max} ticket(s) por usuário`, inline: true },
                { name: '⏱️ Cooldown', value: `${cooldown} segundo(s)`, inline: true },
                { name: '👤 Configurado por', value: `${interaction.user.tag}`, inline: false },
              ],
              timestamp: true
            }
          )],
          ephemeral: true
        });
      }

      // Subcomando: INFO
      if (sub === 'info') {
        const settings = data.settings[guildId];

        if (!settings) {
          return interaction.reply({
            embeds: [warningEmbed(
              'Sem Configuração',
              'Nenhuma configuração de anti-abuso foi encontrada. Use `/antiabuso set` para configurar.',
              { timestamp: true }
            )],
            ephemeral: true
          });
        }

        const abuseCount = Object.keys(data.data[guildId] || {}).length;

        return interaction.reply({
          embeds: [infoEmbed(
            'Configurações de Anti-Abuso',
            `Aqui estão as configurações atuais do sistema anti-abuso para ${interaction.guild.name}`,
            {
              fields: [
                { name: '📊 Máximo de Tickets', value: `**${settings.max}** ticket(s) por usuário`, inline: true },
                { name: '⏱️ Cooldown', value: `**${settings.cooldown}** segundo(s)`, inline: true },
                { name: '⚠️ Usuários em Monitoramento', value: `**${abuseCount}** usuário(s)`, inline: true },
                { name: '⏰ Última Atualização', value: `<t:${Math.floor(new Date(settings.updatedAt).getTime() / 1000)}:R>`, inline: false },
              ],
              timestamp: true
            }
          )],
          ephemeral: true
        });
      }

      // Subcomando: RESET
      if (sub === 'reset') {
        const previousCount = Object.keys(data.data[guildId] || {}).length;
        data.data[guildId] = {};
        writeJson(path, data);

        logger.command(
          interaction.user.tag,
          'antiabuso reset',
          interaction.guild.name,
          { resetCount: previousCount }
        );

        return interaction.reply({
          embeds: [successEmbed(
            'Dados Resetados',
            'O sistema de monitoramento anti-abuso foi resetado com sucesso!',
            {
              fields: [
                { name: '🔄 Registros Limpos', value: `${previousCount} registro(s) removido(s)`, inline: false },
                { name: '👤 Resetado por', value: `${interaction.user.tag}`, inline: true },
              ],
              timestamp: true
            }
          )],
          ephemeral: true
        });
      }

    } catch (error) {
      logger.error('Erro ao executar comando antiabuso', {
        error: error.message,
        userId: interaction.user.id,
        guildId: interaction.guild.id,
        stack: error.stack
      });

      return interaction.reply({
        embeds: [errorEmbed(
          'Erro ao Executar',
          'Ocorreu um erro ao executar este comando. A equipe de suporte foi notificada.'
        )],
        ephemeral: true
      });
    }
  }
};

