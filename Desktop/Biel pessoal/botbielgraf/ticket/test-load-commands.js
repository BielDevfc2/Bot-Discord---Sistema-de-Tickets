const fs = require("fs");
const path = require("path");

const commandsPath = path.join(__dirname, "./commands");
console.log("📂 Procurando comandos em:", commandsPath);

if (!fs.existsSync(commandsPath)) {
  console.error("❌ Pasta commands não encontrada!");
  process.exit(1);
}

const folders = fs.readdirSync(commandsPath);
console.log(`📁 Pastas encontradas: ${folders.join(", ")}`);

const loadedCommands = [];

for (const subfolder of folders) {
  const subfolderPath = path.join(commandsPath, subfolder);
  
  // Verificar se é um diretório
  const stat = fs.statSync(subfolderPath);
  if (!stat.isDirectory()) {
    console.warn(`  ⚠️ ${subfolder} não é um diretório, pulando`);
    continue;
  }

  const files = fs.readdirSync(subfolderPath);
  
  console.log(`  📂 ${subfolder}: ${files.join(", ")}`);

  for (const file of files) {
    if (!file.endsWith(".js")) continue;

    try {
      const filePath = path.join(subfolderPath, file);
      const command = require(filePath);

      const commandName = command?.data?.name || command?.name;

      if (!commandName) {
        console.warn(`  ⚠️ ${file} não tem 'name' ou 'data.name' definido`);
        console.log(`    Conteúdo do comando:`, command);
        continue;
      }

      loadedCommands.push(commandName);
      console.log(`  ✅ ${commandName} (arquivo: ${file})`);
    } catch (error) {
      console.error(`  ❌ Erro ao carregar ${file}:`, error.message);
    }
  }
}

console.log(`\n🎯 Comandos carregados (${loadedCommands.length}):`);
loadedCommands.forEach(cmd => console.log(`   - ${cmd}`));

// Verificar especificamente os comandos procurados
console.log("\n🔍 Verificando comandos específicos:");
console.log(`   antiabuso: ${loadedCommands.includes("antiabuso") ? "✅ ENCONTRADO" : "❌ NÃO ENCONTRADO"}`);
console.log(`   prioridade: ${loadedCommands.includes("prioridade") ? "✅ ENCONTRADO" : "❌ NÃO ENCONTRADO"}`);
