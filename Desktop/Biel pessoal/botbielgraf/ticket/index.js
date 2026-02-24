const {Client , GatewayIntentBits,Collection, Partials } = require("discord.js");
const {JsonDatabase} = require("wio.db");
require("dotenv").config();
const logger = require("./util/logger");
const config = new JsonDatabase({databasePath:"./db/config.json"});
const axios = require("axios");

logger.section("🚀 INICIANDO BOT");

const client = new Client({
    intents: Object.keys(GatewayIntentBits),
    partials: Object.keys(Partials),
});

module.exports = client;

client.slashCommands = new Collection();

const token = process.env.TOKEN;

if (!token) {
    logger.error("TOKEN não encontrado em .env!");
    process.exit(1);
}

logger.info("Carregando handlers...");

// Carregar handlers ANTES de fazer login
const evento = require("./handler/Events");
const commandHandler = require("./handler/index");

// Carregar eventos e comandos
evento.run(client);
commandHandler(client);

// Login após preparar tudo
logger.info("Realizando login no Discord...");
client.login(token);

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    logger.error("Rejeição não tratada", {
        reason: String(reason),
        promise: String(promise)
    });
});

process.on('uncaughtException', (error, origin) => {
    logger.error("Exceção não capturada", {
        error: error.message,
        origin: origin,
        stack: error.stack
    });
});

// Verificar credenciais e atualizar status
axios.get("https://discord.com/api/v10/users/@me", {headers: {
  Authorization: `Bot ${token}`,
}}).then((response) => {
  const data = response.data;
  logger.success(`Bot autenticado como: ${data.username}#${data.discriminator}`);
  
  axios.patch(`https://discord.com/api/v9/applications/${data.id}`, {"flags": 8953856,}, { 
    headers: { 
      Authorization: `Bot ${token}`, 
      "Content-Type": "application/json",
    },
  }).catch(() => {});
}).catch((error) => {
  logger.warn("Erro ao verificar credenciais do bot", { error: error.message });
});

// Inicializar configurações padrão
async function initializeConfig() {
  logger.info("Inicializando configurações...");
  const t = await config.get("botconfig");
  if(!t) {
    await config.set("botconfig", {
      systemavaliation: true,
      pix: "Não Configurado.",
      category: null,
      cor: "#00FFFF",
      systemsendmsg: true,
      topic: false
    });
    logger.success("Configurações padrão criadas");
  }
}

initializeConfig().catch(err => {
  logger.error("Erro ao inicializar configurações", { error: err.message });
});
