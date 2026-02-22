const fs = require("fs");

module.exports = async (client) => {

  const SlashsArray = [];

  const folders = fs.readdirSync("./commands");

  for (const subfolder of folders) {

    const files = fs.readdirSync(`./commands/${subfolder}`);

    for (const file of files) {

      if (!file.endsWith(".js")) continue;

      const command = require(`../commands/${subfolder}/${file}`);

      if (!command?.name) continue;

      client.slashCommands.set(command.name, command);
      SlashsArray.push(command);
    }
  }

  client.once("ready", async () => {

    console.log("🔄 Atualizando comandos...");

    for (const guild of client.guilds.cache.values()) {
      await guild.commands.set(SlashsArray);
    }

    console.log("✅ Comandos atualizados com sucesso!");
  });
};