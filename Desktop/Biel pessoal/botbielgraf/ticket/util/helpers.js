/**
 * Formata um número como moeda BRL
 * @param {number} value
 * @returns {string}
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata um tempo em milissegundos para string legível
 * @param {number} ms
 * @returns {string}
 */
function formatTime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.join(' ') || '0s';
}

/**
 * Formata uma data para string legível
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

/**
 * Aguarda um tempo específico
 * @param {number} ms
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Cria um array com números de range
 * @param {number} start
 * @param {number} end
 * @returns {array}
 */
function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Embaralha um array
 * @param {array} array
 * @returns {array}
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Trunca uma string com ellipsis
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
function truncate(str, maxLength = 100) {
  return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
}

/**
 * Capitaliza uma string
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Remove duplicatas de um array
 * @param {array} array
 * @returns {array}
 */
function unique(array) {
  return [...new Set(array)];
}

/**
 * Chunk um array em pedaços menores
 * @param {array} array
 * @param {number} size
 * @returns {array}
 */
function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Aguarda retry com exponential backoff
 * @param {function} fn
 * @param {number} maxRetries
 * @param {number} delay
 * @returns {Promise}
 */
async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await sleep(delay * Math.pow(2, i));
      }
    }
  }
  throw lastError;
}

/**
 * Valida um email
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida um URL
 * @param {string} url
 * @returns {boolean}
 */
function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Converte um valor para número seguro
 * @param {any} value
 * @param {number} fallback
 * @returns {number}
 */
function safeParseInt(value, fallback = 0) {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Converte um valor para float seguro
 * @param {any} value
 * @param {number} fallback
 * @returns {number}
 */
function safeParseFloat(value, fallback = 0) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

module.exports = {
  formatCurrency,
  formatTime,
  formatDate,
  sleep,
  range,
  shuffle,
  truncate,
  capitalize,
  unique,
  chunk,
  retryWithBackoff,
  isValidEmail,
  isValidURL,
  safeParseInt,
  safeParseFloat,
};
