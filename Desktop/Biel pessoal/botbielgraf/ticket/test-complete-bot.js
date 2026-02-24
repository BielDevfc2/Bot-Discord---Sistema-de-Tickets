/**
 * Script de teste completo do bot
 * Testa carregamento de comandos, eventos, validações e funcionalidades gerais
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function printHeader(title) {
  const line = '═'.repeat(60);
  console.log(`\n${colors.cyan}${line}`);
  console.log(`║ ${title.padEnd(58)} ║`);
  console.log(`${line}${colors.reset}\n`);
}

function testPass(message) {
  console.log(`${colors.green}✅ PASSAR${colors.reset} | ${message}`);
  testResults.passed++;
}

function testFail(message, error = null) {
  console.log(`${colors.red}❌ FALHAR${colors.reset} | ${message}`);
  if (error) console.log(`   ${colors.red}Erro: ${error}${colors.reset}`);
  testResults.failed++;
}

function testWarn(message) {
  console.log(`${colors.yellow}⚠️ AVISO${colors.reset} | ${message}`);
  testResults.warnings++;
}

// ============================================================
// TESTE 1: Estrutura de pastas
// ============================================================
printHeader('TESTE 1: Estrutura de Pastas');

const requiredDirs = [
  'commands',
  'events',
  'handler',
  'util',
  'db',
];

for (const dir of requiredDirs) {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    testPass(`Diretório '${dir}' encontrado`);
  } else {
    testFail(`Diretório '${dir}' não encontrado`);
  }
}

// ============================================================
// TESTE 2: Arquivo de configuração
// ============================================================
printHeader('TESTE 2: Arquivos de Configuração');

const requiredFiles = [
  { path: 'package.json', name: 'package.json' },
  { path: '.env', name: '.env (variáveis de ambiente)' },
  { path: 'index.js', name: 'index.js (arquivo principal)' },
  { path: 'db/config.json', name: 'db/config.json (config do bot)' },
];

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file.path);
  if (fs.existsSync(filePath)) {
    testPass(`${file.name} encontrado`);
  } else {
    testWarn(`${file.name} não encontrado`);
  }
}

// ============================================================
// TESTE 3: Carregamento de Comandos
// ============================================================
printHeader('TESTE 3: Carregamento de Comandos');

const commandsPath = path.join(__dirname, 'commands');
let totalCommands = 0;
let commandsByFolder = {};

if (fs.existsSync(commandsPath)) {
  const folders = fs.readdirSync(commandsPath);
  
  for (const folder of folders) {
    const folderPath = path.join(commandsPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
    commandsByFolder[folder] = files.length;
    totalCommands += files.length;

    for (const file of files) {
      try {
        const command = require(path.join(folderPath, file));
        const commandName = command?.data?.name || command?.name;

        if (!commandName) {
          testWarn(`${file} - Sem nome definido`);
        } else {
          testPass(`/${commandName} carregado (${folder}/${file})`);
        }
      } catch (error) {
        testFail(`${file}`, error.message);
      }
    }
  }

  console.log(`\n${colors.blue}Resumo:${colors.reset}`);
  for (const [folder, count] of Object.entries(commandsByFolder)) {
    console.log(`   • ${folder}: ${count} comando(s)`);
  }
  console.log(`   ${colors.cyan}Total: ${totalCommands} comandos${colors.reset}\n`);
} else {
  testFail('Diretório de comandos não encontrado');
}

// ============================================================
// TESTE 4: Carregamento de Eventos
// ============================================================
printHeader('TESTE 4: Carregamento de Eventos');

const eventsPath = path.join(__dirname, 'events');
let totalEvents = 0;

if (fs.existsSync(eventsPath)) {
  const folders = fs.readdirSync(eventsPath);

  for (const folder of folders) {
    const folderPath = path.join(eventsPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      try {
        const event = require(path.join(folderPath, file));
        
        if (!event.name) {
          testWarn(`${file} - Sem nome definido`);
        } else if (!event.run) {
          testWarn(`${file} - Sem função run definida`);
        } else {
          testPass(`Evento '${event.name}' carregado (${folder}/${file})`);
          totalEvents++;
        }
      } catch (error) {
        testFail(`${file}`, error.message);
      }
    }
  }

  console.log(`\n${colors.cyan}Total: ${totalEvents} evento(s)${colors.reset}\n`);
}

// ============================================================
// TESTE 5: Utilitários
// ============================================================
printHeader('TESTE 5: Módulos Utilitários');

const utilities = [
  { path: 'util/logger.js', name: 'logger' },
  { path: 'util/security.js', name: 'security' },
  { path: 'util/embeds.js', name: 'embeds' },
  { path: 'util/helpers.js', name: 'helpers' },
  { path: 'util/jsonDb.js', name: 'jsonDb' },
  { path: 'util/ticketUtils.js', name: 'ticketUtils' },
];

for (const util of utilities) {
  const utilPath = path.join(__dirname, util.path);
  if (fs.existsSync(utilPath)) {
    try {
      require(utilPath);
      testPass(`${util.name} - Carregado com sucesso`);
    } catch (error) {
      testFail(`${util.name}`, error.message);
    }
  } else {
    testWarn(`${util.name} - Arquivo não encontrado`);
  }
}

// ============================================================
// TESTE 6: Dependências do package.json
// ============================================================
printHeader('TESTE 6: Dependências');

try {
  const packageJson = require('./package.json');
  const deps = packageJson.dependencies || {};

  const requiredDeps = [
    'discord.js',
    'dotenv',
    'wio.db',
    'axios',
  ];

  for (const dep of requiredDeps) {
    if (dep in deps) {
      testPass(`${dep} instalado (v${deps[dep]})`);
    } else {
      testFail(`${dep} não está listado em dependencies`);
    }
  }

  console.log(`\n${colors.blue}Resumo:${colors.reset}`);
  console.log(`   Total de dependências: ${Object.keys(deps).length}\n`);
} catch (error) {
  testFail('Erro ao ler package.json', error.message);
}

// ============================================================
// TESTE 7: Variáveis de Ambiente
// ============================================================
printHeader('TESTE 7: Variáveis de Ambiente');

require('dotenv').config();

const envVars = [
  { name: 'TOKEN', required: true },
  { name: 'OWNER_ID', required: true },
];

for (const envVar of envVars) {
  if (process.env[envVar.name]) {
    testPass(`${envVar.name} definida`);
  } else if (envVar.required) {
    testFail(`${envVar.name} é obrigatória e não foi definida`);
  } else {
    testWarn(`${envVar.name} não está definida`);
  }
}

// ============================================================
// TESTE 8: Database
// ============================================================
printHeader('TESTE 8: Database');

const dbFiles = [
  'antiabuso.json',
  'avaliacoes.json',
  'category.json',
  'config.json',
  'perfil.json',
  'prioridade.json',
  'reputacao.json',
  'respostas.json',
];

const dbPath = path.join(__dirname, 'db');
for (const dbFile of dbFiles) {
  const filePath = path.join(dbPath, dbFile);
  if (fs.existsSync(filePath)) {
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      testPass(`${dbFile} - Válido e acessível`);
    } catch (error) {
      testFail(`${dbFile} - JSON inválido`, error.message);
    }
  } else {
    testWarn(`${dbFile} - Arquivo não encontrado`);
  }
}

// ============================================================
// RESULTADO FINAL
// ============================================================
printHeader('RESULTADO FINAL DO TESTE');

console.log(`${colors.green}✅ PASSOU: ${testResults.passed}${colors.reset}`);
console.log(`${colors.red}❌ FALHOU: ${testResults.failed}${colors.reset}`);
console.log(`${colors.yellow}⚠️  AVISOS: ${testResults.warnings}${colors.reset}\n`);

const totalTests = testResults.passed + testResults.failed + testResults.warnings;
const passPercentage = ((testResults.passed / totalTests) * 100).toFixed(1);

console.log(`${colors.blue}Taxa de Sucesso: ${passPercentage}%${colors.reset}\n`);

if (testResults.failed === 0) {
  console.log(`${colors.green}${colors.bright}🎉 TODOS OS TESTES PASSARAM! 🎉${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}${colors.bright}❌ ALGUNS TESTES FALHARAM${colors.reset}\n`);
  process.exit(1);
}
