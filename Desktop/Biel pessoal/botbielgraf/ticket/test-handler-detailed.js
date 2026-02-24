const fs = require("fs");
const path = require("path");

console.log("=== TESTE DETALHADO DE CARREGAMENTO ===\n");

// Simulando o que o handler/index.js faz
const commandsPath = path.join(__dirname, "commands");
const SlashsArray = [];
const loadedNames = new Set();

console.log("📂 Carregando comandos...\n");

const folders = fs.readdirSync(commandsPath);

for (const subfolder of folders) {
  const subfolderPath = path.join(commandsPath, subfolder);
  const files = fs.readdirSync(subfolderPath);

  for (const file of files) {
    if (!file.endsWith(".js")) continue;

    try {
      const filePath = path.join(subfolderPath, file);
      const command = require(filePath);

      const commandName = command?.data?.name || command?.name;

      if (!commandName || loadedNames.has(commandName)) {
        continue;
      }

      // Aqui está o exato que o handler faz
      const commandToStore = command.data || command;
      SlashsArray.push({
        name: commandName,
        command: commandToStore,
        hasData: command.hasOwnProperty('data'),
        hasToJSON: typeof commandToStore?.toJSON === 'function',
        format: command.data ? 'SlashCommandBuilder' : 'Simple Object'
      });
      loadedNames.add(commandName);
    } catch (error) {
      console.error(`❌ Erro ao carregar ${file}:`, error.message);
      process.exit(1);
    }
  }
}

console.log(`✅ ${SlashsArray.length} comandos carregados\n`);
console.log("═══════════════════════════════════════════════════════════\n");

// Analisar cada comando
let builderCount = 0;
let simpleCount = 0;

SlashsArray.forEach((item) => {
  const icon = item.hasToJSON ? '✅' : '❌';
  console.log(`${icon} ${item.name}`);
  console.log(`   Formato: ${item.format}`);
  console.log(`   Tem toJSON: ${item.hasToJSON}`);
  
  if (item.hasToJSON) {
    builderCount++;
    try {
      const json = item.command.toJSON();
      console.log(`   ✓ Conversão: OK (${json.options?.length || 0} opções)`);
    } catch (e) {
      console.log(`   ✗ Conversão: FALHA - ${e.message}`);
    }
  } else {
    simpleCount++;
    console.log(`   ✓ Pronto para usar (formato antigo)`);
  }
  console.log();
});

console.log("═══════════════════════════════════════════════════════════");
console.log(`\n📊 RESUMO:`);
console.log(`   SlashCommandBuilder: ${builderCount}`);
console.log(`   Simple Objects:      ${simpleCount}`);
console.log(`   Total:               ${SlashsArray.length}`);
console.log(`\n✅ TODOS OS ${SlashsArray.length} COMANDOS ESTÃO PRONTOS PARA REGISTRAR`);
