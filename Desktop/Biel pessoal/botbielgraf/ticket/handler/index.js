const fs = require("fs");
const path = require("path");

module.exports = async (client) => {

  const SlashsArray = [];
  
  const commandsPath = path.join(__dirname, "../commands");
  console.log("📂 Procurando comandos em:", commandsPath);

  if (!fs.existsSync(commandsPath)) {
    console.error("❌ Pasta commands não encontrada!");
    return;
  }

  const folders = fs.readdirSync(commandsPath);
  console.log(`📁 Pastas encontradas: ${folders.join(", ")}`);

  for (const subfolder of folders) {

    const subfolderPath = path.join(commandsPath, subfolder);
    const files = fs.readdirSync(subfolderPath);
    
    console.log(`  📂 ${subfolder}: ${files.join(", ")}`);

    for (const file of files) {

      if (!file.endsWith(".js")) continue;

      try {
        const filePath = path.join(subfolderPath, file);
        const command = require(filePath);

        if (!command?.name) {
          console.warn(`  ⚠️ ${file} não tem 'name' definido`);
          continue;
        }

        client.slashCommands.set(command.name, command);
        SlashsArray.push(command);
        console.log(`  ✅ ${command.name} carregado`);
      } catch (error) {
        console.error(`  ❌ Erro ao carregar ${file}:`, error.message);
      }
    }
  }

  console.log(`\n🎯 Total de comandos carregados: ${SlashsArray.length}\n`);

  // Registrar comandos assim que o bot ficar ready
  client.on("ready", async () => {

    console.log("🔄 Atualizando comandos...");

    for (const guild of client.guilds.cache.values()) {
      try {
        await guild.commands.set(SlashsArray);
        console.log(`✅ Comandos atualizados para ${guild.name}`);
      } catch (error) {
        console.error(`❌ Erro ao atualizar comandos em ${guild.name}:`, error.message);
      }
    }

    console.log("✅ Comandos atualizados com sucesso!");
  });
};