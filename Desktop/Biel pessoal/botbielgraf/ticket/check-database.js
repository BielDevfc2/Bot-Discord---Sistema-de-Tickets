#!/usr/bin/env node

/**
 * Verificador de Integridade do Banco de Dados
 * Valida se todos os arquivos JSON estão corretos
 */

const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, './db');
let totalFiles = 0;
let errorCount = 0;
let warnings = 0;

console.log('\n🔍 VERIFICANDO INTEGRIDADE DO BANCO DE DADOS\n');

if (!fs.existsSync(dbPath)) {
    console.log('❌ Pasta /db não encontrada!');
    process.exit(1);
}

const files = fs.readdirSync(dbPath).filter(f => f.endsWith('.json'));

console.log(`📂 Encontrados ${files.length} arquivos JSON\n`);

files.forEach(file => {
    totalFiles++;
    const filePath = path.join(dbPath, file);
    
    try {
        const stat = fs.statSync(filePath);
        const sizeKB = (stat.size / 1024).toFixed(2);
        
        // Tentar fazer parse do JSON
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // Verificações adicionais
        const isArray = Array.isArray(data);
        const isObject = typeof data === 'object' && !isArray;
        const isEmpty = Object.keys(data || {}).length === 0;
        
        let status = '✅';
        let extra = '';
        
        if (isEmpty) {
            status = '⚠️';
            extra = ' [VAZIO]';
            warnings++;
        }
        
        if (isArray) {
            extra += ` [ARRAY: ${data.length} items]`;
        } else if (isObject) {
            extra += ` [OBJETO: ${Object.keys(data).length} chaves]`;
        }
        
        console.log(`${status} ${file.padEnd(30)} ${sizeKB}KB${extra}`);
        
    } catch (error) {
        errorCount++;
        console.log(`❌ ${file.padEnd(30)} ERRO: ${error.message}`);
    }
});

console.log('\n━'.repeat(70));
console.log(`\n📊 RESUMO DE VERIFICAÇÃO:\n`);
console.log(`  Total de arquivos: ${totalFiles}`);
console.log(`  Erros: ${errorCount}`);
console.log(`  Avisos (vazios): ${warnings}`);
console.log(`  Status: ${errorCount === 0 ? '✅ TODOS OK' : '⚠️ HÁ PROBLEMAS'}\n`);

// Mostrar recomendações
if (warnings > 0) {
    console.log('💡 Dica: Arquivos vazios são normais na primeira inicialização\n');
}

if (errorCount > 0) {
    console.log('⚠️  Atenção: Há arquivos JSON corrompidos!\n');
    console.log('Ações recomendadas:');
    console.log('1. Fazer backup dos dados importantes');
    console.log('2. Remover arquivos corrompidos');
    console.log('3. Deixar o bot recriá-los automaticamente\n');
}

console.log('━'.repeat(70) + '\n');

process.exit(errorCount > 0 ? 1 : 0);
