const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');

// Criar diretório de logs se não existir
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function getTimestamp() {
  return new Date().toLocaleString('pt-BR');
}

function formatLog(type, message, data = null) {
  const timestamp = getTimestamp();
  let colorCode = colors.reset;

  switch (type) {
    case 'success': colorCode = colors.green; break;
    case 'error': colorCode = colors.red; break;
    case 'warn': colorCode = colors.yellow; break;
    case 'info': colorCode = colors.blue; break;
    case 'debug': colorCode = colors.cyan; break;
    case 'command': colorCode = colors.magenta; break;
  }

  const logSymbols = {
    success: '✅',
    error: '❌',
    warn: '⚠️',
    info: 'ℹ️',
    debug: '🐛',
    command: '⚙️',
  };

  const symbol = logSymbols[type] || '📝';
  const coloredMsg = `${colorCode}${symbol} [${timestamp}] ${message}${colors.reset}`;

  // Mensagem simples para arquivo log
  let fileMsg = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  if (data) fileMsg += ` | ${JSON.stringify(data)}`;

  return { coloredMsg, fileMsg };
}

function saveLog(type, message, data = null) {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  const logFile = path.join(logsDir, `${dateStr}.log`);

  const { fileMsg } = formatLog(type, message, data);
  fs.appendFileSync(logFile, fileMsg + '\n');
}

const logger = {
  success(message, data = null) {
    const { coloredMsg } = formatLog('success', message, data);
    console.log(coloredMsg);
    saveLog('success', message, data);
  },

  error(message, data = null) {
    const { coloredMsg } = formatLog('error', message, data);
    console.error(coloredMsg);
    saveLog('error', message, data);
  },

  warn(message, data = null) {
    const { coloredMsg } = formatLog('warn', message, data);
    console.warn(coloredMsg);
    saveLog('warn', message, data);
  },

  info(message, data = null) {
    const { coloredMsg } = formatLog('info', message, data);
    console.log(coloredMsg);
    saveLog('info', message, data);
  },

  debug(message, data = null) {
    if (process.env.DEBUG === 'true') {
      const { coloredMsg } = formatLog('debug', message, data);
      console.log(coloredMsg);
      saveLog('debug', message, data);
    }
  },

  command(user, command, guild = 'DM', data = null) {
    const message = `Comando '${command}' executado por ${user} em ${guild}`;
    const { coloredMsg } = formatLog('command', message, data);
    console.log(coloredMsg);
    saveLog('command', message, data);
  },

  section(title) {
    const line = '═'.repeat(50);
    console.log(`\n${colors.bright}${colors.cyan}${line}`);
    console.log(`║ ${title.padEnd(48)} ║`);
    console.log(`${line}${colors.reset}\n`);
  },

  table(data) {
    console.table(data);
  },
};

module.exports = logger;
