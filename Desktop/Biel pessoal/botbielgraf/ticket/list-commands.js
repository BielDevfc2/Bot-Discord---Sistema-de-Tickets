#!/usr/bin/env node

/**
 * Gera lista de todos os comandos disponíveis
 * Execute com: node list-commands.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n📋 LISTA DE COMANDOS - ALIENALES BOT V6\n');

const commandsPath = path.join(__dirname, './commands');
let totalCommands = 0;
const commandsByCategory = {};

// Varrer todas as pastas
const folders = fs.readdirSync(commandsPath);

folders.forEach(folder => {
    const folderPath = path.join(commandsPath, folder);
    const stat = fs.statSync(folderPath);
    
    if (!stat.isDirectory()) return;
    
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
    commandsByCategory[folder] = [];
    
    files.forEach(file => {
        const filePath = path.join(folderPath, file);
        
        try {
            const command = require(filePath);
            
            if (command.data && command.data.name) {
                totalCommands++;
                const name = command.data.name;
                const description = command.data.description || 'Sem descrição';
                const options = command.data.options?.length || 0;
                
                commandsByCategory[folder].push({
                    name,
                    description,
                    options,
                    file
                });
            }
        } catch (error) {
            console.log(`Aviso: Erro ao carregar ${file}`);
        }
    });
});

// Exibir comandos por categoria
const categoryIcons = {
    'config': '⚙️',
    'ticket': '🎫',
    'vendas': '💳',
    'ranking': '📊'
};

Object.entries(commandsByCategory).forEach(([category, commands]) => {
    const icon = categoryIcons[category] || '📦';
    console.log(`${icon} ${category.toUpperCase()} (${commands.length} comandos)\n`);
    
    commands.forEach(cmd => {
        const argsStr = cmd.options > 0 ? ` [${cmd.options} arg${cmd.options > 1 ? 's' : ''}]` : '';
        console.log(`  /${cmd.name}${argsStr}`);
        console.log(`    → ${cmd.description}`);
        console.log('');
    });
});

console.log('━'.repeat(60));
console.log(`\n✅ Total de ${totalCommands} comandos disponíveis\n`);
console.log('Para usar um comando, digite: /${nome-do-comando}\n');
console.log('━'.repeat(60) + '\n');
