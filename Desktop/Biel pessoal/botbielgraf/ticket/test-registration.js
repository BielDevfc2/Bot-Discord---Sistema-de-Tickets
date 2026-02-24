const fs = require("fs");
const path = require("path");

console.log("=== TESTE FINAL - SIMULAÇÃO DE REGISTRO ===\n");

// Carregar comandos exatamente como o handler faz
const commandsPath = path.join(__dirname, "commands");
const SlashsArray = [];
const loadedNames = new Set();

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

      if (!commandName || loadedNames.has(commandName)) continue;

      // EXATAMENTE como o handler faz
      SlashsArray.push(command.data || command);
      loadedNames.add(commandName);
    } catch (error) {
      console.error(`❌ Erro: ${file} - ${error.message}`);
      process.exit(1);
    }
  }
}

console.log(`✅ ${SlashsArray.length} comandos carregados\n`);

// EXATAMENTE como o handler faz na conversão
console.log("🔄 Convertendo para formato Discord...\n");

let successCount = 0;
let errors = [];

const commandsToRegister = SlashsArray.map((cmd, idx) => {
  try {
    // EXATAMENTE como no handler corrigido
    if (cmd.toJSON && typeof cmd.toJSON === 'function') {
      const json = cmd.toJSON();
      console.log(`✅ [${idx + 1}/${SlashsArray.length}] ${json.name}`);
      successCount++;
      return json;
    } else {
      // Comando antigo - já está no formato correto
      console.log(`✅ [${idx + 1}/${SlashsArray.length}] ${cmd.name}`);
      successCount++;
      return cmd;
    }
  } catch (e) {
    errors.push(`${idx}: ${e.message}`);
    console.log(`❌ [${idx + 1}/${SlashsArray.length}] ERRO: ${e.message}`);
    return null;
  }
});

// Filtrar nulos
const validCommands = commandsToRegister.filter(c => c !== null);

console.log(`\n════════════════════════════════════════`);
console.log(`\n📊 RESULTADO FINAL:`);
console.log(`   Sucesso: ${successCount}/${SlashsArray.length}`);
console.log(`   Erros: ${errors.length}`);
console.log(`   Prontos para registrar: ${validCommands.length}`);

if (successCount === SlashsArray.length && errors.length === 0) {
  console.log(`\n🎉 PERFEITO! Sistema 100% funcional!`);
  console.log(`\n✅ Os seguintes ${validCommands.length} comandos estão prontos:`);
  validCommands.forEach((cmd, i) => {
    console.log(`   ${i + 1}. ${cmd.name}`);
  });
} else {
  console.log(`\n❌ Há ${errors.length} erro(s)`);
  process.exit(1);
}

console.log(`\n════════════════════════════════════════`);
