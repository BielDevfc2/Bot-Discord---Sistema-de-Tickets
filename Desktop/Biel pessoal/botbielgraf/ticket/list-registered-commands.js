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

async function listGlobal(appId) {
  const res = await axios.get(`https://discord.com/api/v10/applications/${appId}/commands`, {
    headers: { Authorization: `Bot ${token}` }
  });
  return res.data;
}

async function listGuild(appId, guildId) {
  const res = await axios.get(`https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`, {
    headers: { Authorization: `Bot ${token}` }
  });
  return res.data;
}

(async () => {
  try {
    const appId = await getAppId();
    console.log('Application ID:', appId);

    console.log('\nGlobal commands:');
    const global = await listGlobal(appId);
    if (global.length === 0) console.log('  (nenhum comando global registrado)');
    else global.forEach(c => console.log(`  - ${c.name} (id: ${c.id})`));

    const guildId = process.argv[2];
    if (guildId) {
      console.log(`\nGuild commands for ${guildId}:`);
      const guildCmds = await listGuild(appId, guildId);
      if (guildCmds.length === 0) console.log('  (nenhum comando de guild registrado)');
      else guildCmds.forEach(c => console.log(`  - ${c.name} (id: ${c.id})`));
    } else {
      console.log('\nPara listar comandos por guild, rode: node list-registered-commands.js <GUILD_ID>');
    }
  } catch (err) {
    console.error('Erro:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
})();
