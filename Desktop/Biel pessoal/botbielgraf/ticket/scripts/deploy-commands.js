const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

function loadEnv() {
  const candidates = [
    path.join(__dirname, '..', '..', '.env'),
    path.join(__dirname, '..', '.env')
  ];
  for (const envPath of candidates) {
    if (!fs.existsSync(envPath)) continue;
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
      const m = line.match(/^([^=]+)=(.*)$/);
      if (m) {
        const key = m[1].trim();
        let val = m[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        process.env[key] = val;
      }
    });
  }
}

loadEnv();
const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN || process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN) {
  console.error('DISCORD_TOKEN não encontrado em .env ou variáveis de ambiente. Abortando.');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, '..', 'commands');

function walk(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (item.endsWith('.js')) {
      try {
        const cmd = require(full);
        if (cmd && cmd.data && typeof cmd.data.toJSON === 'function') {
          commands.push(cmd.data.toJSON());
        }
      } catch (err) {
        console.warn('Falha ao carregar comando', full, err && err.message);
      }
    }
  }
}

walk(commandsPath);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  try {
    if (GUILD_ID) {
      await client.application.commands.set(commands, GUILD_ID);
      console.log(`Registrados ${commands.length} comandos na guild ${GUILD_ID}`);
    } else {
      await client.application.commands.set(commands);
      console.log(`Registrados ${commands.length} comandos globais`);
    }
  } catch (err) {
    console.error('Erro registrando comandos:', err);
  } finally {
    client.destroy();
    process.exit(0);
  }
});

client.login(TOKEN).catch(err => {
  console.error('Login falhou:', err && err.message);
  process.exit(1);
});
