const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const token = process.env.TOKEN;
if (!token) {
  console.error('TOKEN não definido em .env');
  process.exit(1);
}

async function getAppId() {
  const res = await axios.get('https://discord.com/api/v10/users/@me', {
    headers: { Authorization: `Bot ${token}` }
  });
  return res.data.id;
}

function loadCommands() {
  const commands = [];
  const commandsPath = path.join(__dirname, 'commands');
  const folders = fs.readdirSync(commandsPath);

  for (const folder of folders) {
    const folderPath = path.join(commandsPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      try {
        const cmd = require(path.join(folderPath, file));
        const payload = cmd.data ? (cmd.data.toJSON ? cmd.data.toJSON() : cmd.data) : (cmd);
        if (payload && payload.name) commands.push(payload);
      } catch (e) {
        console.warn(`Falha ao carregar ${file}: ${e.message}`);
      }
    }
  }
  return commands;
}

(async () => {
  try {
    const appId = await getAppId();
    console.log('Application ID:', appId);

    const cmds = loadCommands();
    if (cmds.length === 0) {
      console.error('Nenhum comando local encontrado para registrar.');
      process.exit(1);
    }

    const guildIds = process.argv.slice(2);
    if (guildIds.length === 0) {
      console.error('Uso: node register-commands.js <GUILD_ID> [GUILD_ID ...]');
      console.error('Exemplo: node register-commands.js 123456789012345678 987654321098765432');
      process.exit(1);
    }

    for (const guildId of guildIds) {
      try {
        const res = await axios.put(
          `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`,
          cmds,
          { headers: { Authorization: `Bot ${token}` } }
        );
        console.log(`Registrados ${res.data.length} comandos na guild ${guildId}`);
      } catch (err) {
        console.error(`Erro ao registrar na guild ${guildId}:`, err.response ? err.response.data : err.message);
      }
    }

    console.log('Registro concluído.');
  } catch (err) {
    console.error('Erro geral:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
})();
