const logger = require('./logger');

// Rate limiter por usuário
const userRateLimits = new Map();
const RATE_LIMIT_WINDOW = 1000; // 1 segundo
const RATE_LIMIT_MAX = 5; // máximo 5 comandos por segundo

// Guilds com rate limit ativado
const guildRateLimits = new Map();
const GUILD_RATE_LIMIT_WINDOW = 5000; // 5 segundos
const GUILD_RATE_LIMIT_MAX = 20; // máximo 20 comandos por 5 segundos

// Usuários bloqueados
const blockedUsers = new Set();

// Whitelist de comandos que pulam rate limit (admin, owner)
const bypassCommands = ['ping', 'help', 'status'];

/**
 * Valida se o usuário pode executar comandos
 * @param {Interaction} interaction
 * @param {string} commandName
 * @returns {Object} { allowed: boolean, reason?: string }
 */
function checkUserRateLimit(interaction, commandName = null) {
  const userId = interaction.user.id;
  const now = Date.now();

  // Verificar se está bloqueado
  if (blockedUsers.has(userId)) {
    return {
      allowed: false,
      reason: '🚫 Você foi bloqueado de usar comandos.',
    };
  }

  // Bypass para owner
  if (userId === process.env.OWNER_ID) {
    return { allowed: true };
  }

  // Bypass para certos comandos
  if (commandName && bypassCommands.includes(commandName)) {
    return { allowed: true };
  }

  // Inicializar rate limit
  if (!userRateLimits.has(userId)) {
    userRateLimits.set(userId, { count: 0, resetAt: now + RATE_LIMIT_WINDOW });
  }

  const userLimit = userRateLimits.get(userId);

  // Resetar se passou o tempo
  if (now > userLimit.resetAt) {
    userLimit.count = 0;
    userLimit.resetAt = now + RATE_LIMIT_WINDOW;
  }

  userLimit.count++;

  if (userLimit.count > RATE_LIMIT_MAX) {
    return {
      allowed: false,
      reason: `⏱️ Você está usando comandos muito rápido. Tente novamente em ${Math.ceil((userLimit.resetAt - now) / 1000)}s`,
    };
  }

  return { allowed: true };
}

/**
 * Valida se a guild pode executar comandos
 * @param {Guild} guild
 * @returns {Object} { allowed: boolean, reason?: string }
 */
function checkGuildRateLimit(guild) {
  if (!guild) return { allowed: true };

  const guildId = guild.id;
  const now = Date.now();

  if (!guildRateLimits.has(guildId)) {
    guildRateLimits.set(guildId, { count: 0, resetAt: now + GUILD_RATE_LIMIT_WINDOW });
  }

  const guildLimit = guildRateLimits.get(guildId);

  if (now > guildLimit.resetAt) {
    guildLimit.count = 0;
    guildLimit.resetAt = now + GUILD_RATE_LIMIT_WINDOW;
  }

  guildLimit.count++;

  if (guildLimit.count > GUILD_RATE_LIMIT_MAX) {
    return {
      allowed: false,
      reason: '⚠️ Servidor atingiu o limite de requisições. Tente novamente em alguns segundos.',
    };
  }

  return { allowed: true };
}

/**
 * Valida entrada do usuário
 * @param {string} input
 * @param {object} options
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateInput(input, options = {}) {
  const {
    maxLength = 2000,
    minLength = 1,
    pattern = null,
    allowedChars = null,
  } = options;

  if (!input) {
    return { valid: false, error: 'Input não pode estar vazio' };
  }

  if (input.length < minLength) {
    return { valid: false, error: `Input deve ter pelo menos ${minLength} caracteres` };
  }

  if (input.length > maxLength) {
    return { valid: false, error: `Input não pode exceder ${maxLength} caracteres` };
  }

  if (pattern && !pattern.test(input)) {
    return { valid: false, error: 'Input contém caracteres inválidos' };
  }

  if (allowedChars && !input.split('').every(c => allowedChars.includes(c))) {
    return { valid: false, error: 'Input contém caracteres não permitidos' };
  }

  return { valid: true };
}

/**
 * Bloqueia um usuário
 * @param {string} userId
 */
function blockUser(userId, reason = 'unspecified') {
  blockedUsers.add(userId);
  logger.warn(`Usuário bloqueado: ${userId}`, { reason });
}

/**
 * Desbloqueia um usuário
 * @param {string} userId
 */
function unblockUser(userId) {
  if (blockedUsers.has(userId)) {
    blockedUsers.delete(userId);
    logger.success(`Usuário desbloqueado: ${userId}`);
  }
}

/**
 * Valida comando
 * @param {Interaction} interaction
 * @param {string} commandName
 * @returns {Object} { proceed: boolean, error?: string }
 */
function validateCommand(interaction, commandName = null) {
  // Verificar rate limit do usuário
  const userCheck = checkUserRateLimit(interaction, commandName);
  if (!userCheck.allowed) {
    return {
      proceed: false,
      error: userCheck.reason,
    };
  }

  // Verificar rate limit da guild
  const guildCheck = checkGuildRateLimit(interaction.guild);
  if (!guildCheck.allowed) {
    return {
      proceed: false,
      error: guildCheck.reason,
    };
  }

  return { proceed: true };
}

/**
 * Limpa rate limits antigos (executar periodicamente)
 */
function cleanupRateLimits() {
  const now = Date.now();

  // Limpar usuários
  for (const [userId, data] of userRateLimits.entries()) {
    if (now > data.resetAt + 60000) { // 1 minuto após expiração
      userRateLimits.delete(userId);
    }
  }

  // Limpar guilds
  for (const [guildId, data] of guildRateLimits.entries()) {
    if (now > data.resetAt + 60000) {
      guildRateLimits.delete(guildId);
    }
  }
}

// Executar limpeza a cada minuto
setInterval(cleanupRateLimits, 60000);

module.exports = {
  checkUserRateLimit,
  checkGuildRateLimit,
  validateInput,
  validateCommand,
  blockUser,
  unblockUser,
  cleanupRateLimits,
};
