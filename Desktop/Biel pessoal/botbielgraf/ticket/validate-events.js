#!/usr/bin/env node

/**
 * Script de Validação de Eventos
 * Verifica se todos os eventos têm estrutura correta
 */

const fs = require('fs');
const path = require('path');

const eventsPath = path.join(__dirname, './events');
let totalEvents = 0;
let errors = 0;

console.log('\n🔍 VERIFICANDO ESTRUTURA DE EVENTOS...\n');

// Varrer todas as pastas
const folders = fs.readdirSync(eventsPath);

folders.forEach(folder => {
    const folderPath = path.join(eventsPath, folder);
    const stat = fs.statSync(folderPath);
    
    if (!stat.isDirectory()) return;
    
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
    
    console.log(`📂 ${folder}/ (${files.length} eventos)\n`);
    
    files.forEach(file => {
        totalEvents++;
        const filePath = path.join(folderPath, file);
        
        try {
            const event = require(filePath);
            
            // Validações
            const hasName = event.name !== undefined;
            const hasRun = event.run !== undefined;
            
            if (!hasName) {
                console.log(`  ❌ ${file}: Falta 'name'`);
                errors++;
            } else if (!hasRun) {
                console.log(`  ❌ ${file}: Falta 'run()' function`);
                errors++;
            } else {
                const eventName = event.name;
                const once = event.once ? ' [ONCE]' : '';
                console.log(`  ✅ ${eventName}${once}`);
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
console.log(`  Total de eventos: ${totalEvents}`);
console.log(`  Erros: ${errors}`);
console.log(`  Status: ${errors === 0 ? '✅ TODOS OK' : '❌ HÁ PROBLEMAS'}\n`);

process.exit(errors > 0 ? 1 : 0);
