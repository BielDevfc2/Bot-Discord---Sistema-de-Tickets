#!/usr/bin/env node

/**
 * Script de Validação de Comandos
 * Verifica se todos os comandos têm estrutura correta
 */

const fs = require('fs');
const path = require('path');

const commandsPath = path.join(__dirname, './commands');
let totalCommands = 0;
let errors = 0;
let warnings = 0;

console.log('\n🔍 VERIFICANDO ESTRUTURA DE COMANDOS...\n');

// Varrer todas as pastas
const folders = fs.readdirSync(commandsPath);

folders.forEach(folder => {
    const folderPath = path.join(commandsPath, folder);
    const stat = fs.statSync(folderPath);
    
    if (!stat.isDirectory()) return;
    
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
    
    console.log(`📂 ${folder}/ (${files.length} comandos)\n`);
    
    files.forEach(file => {
        totalCommands++;
        const filePath = path.join(folderPath, file);
        
        try {
            const command = require(filePath);
            
            // Validações
            const hasData = command.data !== undefined;
            const hasExecute = command.execute !== undefined;
            const hasName = hasData ? command.data.name !== undefined : false;
            
            if (!hasData) {
                console.log(`  ❌ ${file}: Falta 'data' (SlashCommandBuilder)`);
                errors++;
            } else if (!hasName) {
                console.log(`  ❌ ${file}: Falta 'data.name'`);
                errors++;
            } else if (!hasExecute) {
                console.log(`  ❌ ${file}: Falta 'execute()' function`);
                errors++;
            } else {
                const commandName = command.data.name;
                console.log(`  ✅ ${commandName}`);
            }
            
        } catch (error) {
            console.log(`  ⚠️  ${file}: ERRO AO CARREGAR - ${error.message}`);
            errors++;
        }
    });
    
    console.log('');
});

console.log('━'.repeat(50));
console.log(`\n📊 RESUMO DE VALIDAÇÃO:\n`);
console.log(`  Total de comandos: ${totalCommands}`);
console.log(`  Erros: ${errors}`);
console.log(`  Status: ${errors === 0 ? '✅ TODOS OK' : '❌ HÁ PROBLEMAS'}\n`);

process.exit(errors > 0 ? 1 : 0);
