const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord.js");

/**
 * Cria um array de permissões para ticket
 * @param {Object} options - Opções de configuração
 * @returns {Array} Array com permissões
 */
function createTicketPermissions({
  userId,
  guildId,
  ownerId,
  botId,
  staffRoleId,
  additionalAllow = []
}) {
  const permissions = [
    {
      id: userId,
      allow: ["ViewChannel", "SendMessages", ...additionalAllow],
    },
    {
      id: guildId,
      deny: ["ViewChannel", "SendMessages"],
    },
    {
      id: ownerId,
      allow: ["ViewChannel", "SendMessages", PermissionFlagsBits.ManageMessages],
    },
    {
      id: botId,
      allow: ["ViewChannel", "SendMessages", PermissionFlagsBits.ManageMessages],
    },
  ];

  if (staffRoleId) {
    permissions.push({
      id: staffRoleId,
      allow: ["ViewChannel", "SendMessages", PermissionFlagsBits.ManageMessages],
    });
  }

  return permissions;
}

/**
 * Cria um embed com botões de ticket
 * @param {Object} config - Configuração do embed
 * @returns {Object} Retorna { embeds, components }
 */
function createTicketEmbed(config) {
  const { title, description, color, buttons, footer } = config;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color);

  if (footer) {
    embed.setFooter(footer);
  }

  const components = [];
  if (buttons && buttons.length > 0) {
    const row = new ActionRowBuilder();
    buttons.forEach((btn) => {
      row.addComponents(
        new ButtonBuilder()
          .setLabel(btn.label)
          .setStyle(btn.style)
          .setEmoji(btn.emoji)
          .setCustomId(btn.customId)
      );
    });
    components.push(row);
  }

  return { embeds: [embed], components };
}

/**
 * Formata data e hora no padrão brasileiro
 * @param {Date} date - Data a ser formatada
 * @returns {Object} Retorna { dataFormatada, horarioFormatado }
 */
function formatBrazilianDateTime(date = new Date()) {
  const opcoesData = {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const opcoesHora = {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const dataFormatada = date.toLocaleDateString("pt-BR", opcoesData);
  const horarioFormatado = date.toLocaleTimeString("pt-BR", opcoesHora);

  return { dataFormatada, horarioFormatado };
}

/**
 * Substitui placeholders em um texto
 * @param {string} text - Texto com placeholders
 * @param {Object} replacements - Objeto com os valores para substituir
 * @returns {string} Texto com substituições feitas
 */
function replaceText(text, replacements) {
  let result = text;
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`#{${key}}`, "g");
    result = result.replace(regex, value);
  }
  return result;
}

module.exports = {
  createTicketPermissions,
  createTicketEmbed,
  formatBrazilianDateTime,
  replaceText,
};
