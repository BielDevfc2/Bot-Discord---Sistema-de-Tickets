const { EmbedBuilder } = require('discord.js');

const colors = {
  primary: '#2F3136',      // Cinza escuro Discord
  success: '#43B581',      // Verde sucesso
  error: '#F04747',        // Vermelho erro
  warning: '#FAA61A',      // Laranja aviso
  info: '#00B0F4',         // Azul info
  accent: '#7289DA',       // Azul Discord blurple
};

/**
 * Cria um embed de sucesso
 * @param {string} title
 * @param {string} description
 * @param {object} options
 */
function successEmbed(title, description, options = {}) {
  const embed = new EmbedBuilder()
    .setColor(colors.success)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setFooter({ text: options.footer || 'Operação concluída com sucesso' });

  if (options.fields) {
    embed.addFields(options.fields);
  }

  if (options.thumbnail) {
    embed.setThumbnail(options.thumbnail);
  }

  if (options.image) {
    embed.setImage(options.image);
  }

  if (options.timestamp) {
    embed.setTimestamp();
  }

  return embed;
}

/**
 * Cria um embed de erro
 * @param {string} title
 * @param {string} description
 * @param {object} options
 */
function errorEmbed(title, description, options = {}) {
  const embed = new EmbedBuilder()
    .setColor(colors.error)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setFooter({ text: options.footer || 'Um erro ocorreu' });

  if (options.fields) {
    embed.addFields(options.fields);
  }

  if (options.timestamp) {
    embed.setTimestamp();
  }

  return embed;
}

/**
 * Cria um embed de aviso
 * @param {string} title
 * @param {string} description
 * @param {object} options
 */
function warningEmbed(title, description, options = {}) {
  const embed = new EmbedBuilder()
    .setColor(colors.warning)
    .setTitle(`⚠️ ${title}`)
    .setDescription(description)
    .setFooter({ text: options.footer || 'Atenção' });

  if (options.fields) {
    embed.addFields(options.fields);
  }

  if (options.timestamp) {
    embed.setTimestamp();
  }

  return embed;
}

/**
 * Cria um embed de informação
 * @param {string} title
 * @param {string} description
 * @param {object} options
 */
function infoEmbed(title, description, options = {}) {
  const embed = new EmbedBuilder()
    .setColor(colors.info)
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setFooter({ text: options.footer || 'Informação' });

  if (options.fields) {
    embed.addFields(options.fields);
  }

  if (options.image) {
    embed.setImage(options.image);
  }

  if (options.thumbnail) {
    embed.setThumbnail(options.thumbnail);
  }

  if (options.timestamp) {
    embed.setTimestamp();
  }

  return embed;
}

/**
 * Cria um embed customizado
 * @param {object} options
 */
function customEmbed(options = {}) {
  const {
    title,
    description,
    color = colors.primary,
    fields = [],
    footer = 'BielGraf Bot',
    image,
    thumbnail,
    timestamp = false,
    author,
  } = options;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setFooter({ text: footer });

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (fields.length > 0) embed.addFields(fields);
  if (image) embed.setImage(image);
  if (thumbnail) embed.setThumbnail(thumbnail);
  if (timestamp) embed.setTimestamp();
  if (author) embed.setAuthor(author);

  return embed;
}

/**
 * Cria um embed de confirmação
 * @param {string} action
 * @param {object} options
 */
function confirmEmbed(action, options = {}) {
  const embed = new EmbedBuilder()
    .setColor(colors.accent)
    .setTitle('🔍 Confirmação Necessária')
    .setDescription(`Tem certeza que deseja ${action}?`)
    .setFooter({ text: options.footer || 'Use os botões abaixo para confirmar' });

  if (options.fields) {
    embed.addFields(options.fields);
  }

  return embed;
}

/**
 * Cria um embed de permissão negada
 * @param {string} reason
 */
function permissionDeniedEmbed(reason = 'Você não tem permissão') {
  return new EmbedBuilder()
    .setColor(colors.error)
    .setTitle('❌ Permissão Negada')
    .setDescription(reason)
    .setFooter({ text: 'Entre em contato com a administração do servidor' });
}

/**
 * Cria um embed de carregando/processando
 * @param {string} message
 */
function loadingEmbed(message = 'Processando...') {
  return new EmbedBuilder()
    .setColor(colors.info)
    .setTitle('⏳ Processando')
    .setDescription(message)
    .setFooter({ text: 'Por favor aguarde' });
}

/**
 * Cria um embed com página (para paginação)
 * @param {string} title
 * @param {array} items
 * @param {number} page
 * @param {number} itemsPerPage
 * @param {object} options
 */
function pageableEmbed(title, items, page = 1, itemsPerPage = 10, options = {}) {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = items.slice(start, end);

  const fields = pageItems.map((item, idx) => ({
    name: `${start + idx + 1}. ${item.title || 'Item'}`,
    value: item.value || item,
    inline: options.inline || false,
  }));

  const embed = new EmbedBuilder()
    .setColor(options.color || colors.primary)
    .setTitle(title)
    .setDescription(options.description || '')
    .addFields(fields)
    .setFooter({
      text: `Página ${page}/${totalPages} - Total: ${items.length} itens`,
    });

  return embed;
}

module.exports = {
  colors,
  successEmbed,
  errorEmbed,
  warningEmbed,
  infoEmbed,
  customEmbed,
  confirmEmbed,
  permissionDeniedEmbed,
  loadingEmbed,
  pageableEmbed,
};
