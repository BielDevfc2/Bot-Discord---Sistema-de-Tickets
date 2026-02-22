const {Client , GatewayIntentBits,Collection, Partials } = require("discord.js");
const {JsonDatabase} = require("wio.db");
require("dotenv").config();
const config = new JsonDatabase({databasePath:"./db/config.json"});
const axios = require("axios");


console.clear();
console.log("🚀 Iniciando bot...");

const client = new Client({
    intents: Object.keys(GatewayIntentBits),
    partials: Object.keys(Partials),
});

module.exports = client;

client.slashCommands = new Collection();

const token = process.env.TOKEN;

if (!token) {
    console.error("❌ TOKEN não encontrado em .env!");
    process.exit(1);
}

client.login(token);

const evento = require("./handler/Events");

evento.run(client);

require("./handler/index")(client);

  process.on('unhandRejection', (reason, promise) => {
      console.log(`🚫 Erro Detectado:\n\n` + reason, promise);
  });

  process.on('uncaughtException', (error, origin) => {
    console.log(`🚫 Erro Detectado:\n\n` + error, origin);  
  });


axios.get("https://discord.com/api/v10/users/@me", {headers: {
  Authorization: `Bot ${token}`,
}}).then((response) => {
  const data = response.data;
  axios.patch(`https://discord.com/api/v9/applications/${data.id}`, {"flags": 8953856,}, { headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json",},}).catch(() => {});
}).catch(() => {}); 


async function t() {
  const t = await config.get("botconfig");
  if(!t) await config.set("botconfig", {
    systemavaliation: true,
    pix: "Não Configurado.",
    category: null,
    cor: "#00FFFF",
    systemsendmsg: true,
    topic: false
  });
}


t();
