const fs = require("fs");
const path = require("path");

console.log("=== TESTE DE CARREGAMENTO DO HANDLER ===\n");

// Simulando o que o handler/index.js faz
const commandsPath = path.join(__dirname, "commands");
const SlashsArray = [];
const loadedNames = new Set();

console.log("📂 Carregando comandos...");

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

      SlashsArray.push(command.data || command);
      loadedNames.add(commandName);
    } catch (error) {
      console.error(`❌ Erro ao carregar ${file}:`, error.message);
      process.exit(1);
    }
  }
}

console.log(`✅ ${SlashsArray.length} comandos carregados\n`);

// Testar serialização como o handler faria
console.log("🔄 Convertendo comandos para JSON (como o handler faz)...\n");

let allSuccess = true;

const commandsToRegister = SlashsArray.map((cmd, index) => {
  try {
    if (cmd.toJSON && typeof cmd.toJSON === 'function') {
      const json = cmd.toJSON();
      console.log(`✅ [${index}] ${json.name} - convertido com sucesso`);
      console.log(`   - Opções: ${json.options?.length || 0}`);
      return json;
    } else {
      console.log(`❌ [${index}] Comando não tem método toJSON()`);
      allSuccess = false;
      return null;
    }
  } catch (e) {
    console.log(`❌ [${index}] Erro na conversão:`, e.message);
    allSuccess = false;
    return null;
  }
});

console.log(`\n════════════════════════════════════════`);
if (allSuccess && commandsToRegister.every(c => c !== null)) {
  console.log(`✅ TESTE DE HANDLER: PASSOU`);
  console.log(`   ${commandsToRegister.length} comandos prontos para registrar`);
} else {
  console.log(`❌ TESTE DE HANDLER: FALHOU`);
  process.exit(1);
}
console.log(`════════════════════════════════════════`);
