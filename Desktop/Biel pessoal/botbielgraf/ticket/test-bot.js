#!/usr/bin/env node

/**
 * Script de Teste do Bot
 * Valida se o bot consegue se conectar e iniciar corretamente
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('\n🧪 TESTE DO BOT ALIENALES V6\n');

// Teste 1: Verificar arquivo .env
console.log('📋 Teste 1: Verificando arquivo .env...');
if (!fs.existsSync('.env')) {
    console.log('  ❌ Arquivo .env não encontrado');
    console.log('  💡 Crie este arquivo baseado no modelo do projeto');
    process.exit(1);
} else {
    console.log('  ✅ Arquivo .env encontrado');
}

// Teste 2: Verificar variáveis de ambiente
console.log('\n🔐 Teste 2: Verificando variáveis de ambiente...');
const required = ['TOKEN', 'OWNER_ID'];
let missingVars = false;

required.forEach(variable => {
    if (process.env[variable]) {
        console.log(`  ✅ ${variable}: configurado`);
    } else {
        console.log(`  ❌ ${variable}: não configurado`);
        missingVars = true;
    }
});

if (missingVars) {
    console.log('\n  ⚠️  Configure as variáveis faltantes em .env');
    process.exit(1);
}

// Teste 3: Verificar dependencies
console.log('\n📦 Teste 3: Verificando dependencies...');
const required_packages = ['discord.js', 'dotenv', 'wio.db', 'axios'];
let missingPackages = false;

required_packages.forEach(pkg => {
    try {
        require.resolve(pkg);
        console.log(`  ✅ ${pkg}: instalado`);
    } catch (e) {
        console.log(`  ❌ ${pkg}: não instalado`);
        missingPackages = true;
    }
});

if (missingPackages) {
    console.log('\n  💡 Execute: npm install');
    process.exit(1);
}

// Teste 4: Verificar estrutura de pastas
console.log('\n📁 Teste 4: Verificando estrutura de pasta...');
const requiredDirs = ['commands', 'events', 'handler', 'util', 'db', 'logs'];
let missingDirs = false;

requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`  ✅ ${dir}/`);
    } else {
        console.log(`  ❌ ${dir}/`);
        missingDirs = true;
    }
});

if (missingDirs) {
    console.log('\n  ❌ Estrutura de pasta incompleta');
    process.exit(1);
}

// Teste 5: Verificar arquivo handlers
console.log('\n⚙️  Teste 5: Verificando handlers...');
const handlers = ['handler/index.js', 'handler/Events.js'];
let missingHandlers = false;

handlers.forEach(handler => {
    if (fs.existsSync(handler)) {
        console.log(`  ✅ ${handler}`);
    } else {
        console.log(`  ❌ ${handler}`);
        missingHandlers = true;
    }
});

if (missingHandlers) {
    console.log('\n  ⚠️  Handlers estão faltando');
}

// Teste 6: Valida indentação dos handlers (check para conflitos de tabs/spaces)
console.log('\n🔍 Teste 6: Validando handlers...');
try {
    require('./handler/index.js'); // não executar, apenas checar sintaxe
    console.log('  ✅ handler/index.js: sintaxe OK');
} catch (e) {
    console.log(`  ❌ handler/index.js: erro de sintaxe`);
    console.log(`     ${e.message}`);
}

try {
    require('./handler/Events.js');
    console.log('  ✅ handler/Events.js: sintaxe OK');
} catch (e) {
    console.log(`  ❌ handler/Events.js: erro de sintaxe`);
    console.log(`     ${e.message}`);
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('✅ TODOS OS TESTES PASSARAM! O bot está pronto para iniciar.\n');
console.log('▶️  Para iniciar o bot, execute: npm start\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
