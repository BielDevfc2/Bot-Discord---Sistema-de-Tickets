const fs = require('fs');
const path = require('path');

const commandsPath = path.join(__dirname, "commands");
console.log("📂 Testando carregamento de comandos em:", commandsPath);

const loadedCommands = [];
const folders = fs.readdirSync(commandsPath);

for (const subfolder of folders) {
  const subfolderPath = path.join(commandsPath, subfolder);
  const files = fs.readdirSync(subfolderPath);
  
  console.log(`\n📁 Pasta: ${subfolder}`);
  
  for (const file of files) {
    if (!file.endsWith(".js")) continue;

    try {
      const filePath = path.join(subfolderPath, file);
      const command = require(filePath);
      
      const commandName = command?.data?.name || command?.name;
      
      if (!commandName) {
        console.log(`  ❌ ${file} - SEM NOME`);
        continue;
      }
      
      if (!command?.execute && !command?.run) {
        console.log(`  ❌ ${file} - SEM execute() OU run()`);
        continue;
      }
      
      console.log(`  ✅ ${commandName} - OK`);
      console.log(`     - Tem subcomandos: ${command?.data?._options?.length > 0 ? 'Sim' : 'Não'}`);
      
      loadedCommands.push(commandName);
    } catch (error) {
      console.log(`  ❌ ${file} - ERRO:`, error.message);
    }
  }
}

console.log(`\n🎯 Total carregado: ${loadedCommands.length}`);
console.log("Comandos:", loadedCommands.join(", "));
