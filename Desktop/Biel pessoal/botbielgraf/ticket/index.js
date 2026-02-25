const {Client , GatewayIntentBits,Collection, Partials } = require("discord.js");
const {JsonDatabase} = require("wio.db");
require("dotenv").config();
const logger = require("./util/logger");
const config = new JsonDatabase({databasePath: require("path").join(__dirname, "db/config.json")});
const axios = require("axios");

logger.section("🚀 INICIANDO ALIENALES BOT V6");

const client = new Client({
    intents: Object.keys(GatewayIntentBits),
    partials: Object.keys(Partials),
});

module.exports = client;

client.slashCommands = new Collection();

const token = process.env.TOKEN;

if (!token) {
    logger.error("TOKEN não encontrado em .env!");
    logger.warn("Instruções: Copie .env.example para .env e presencha com seus valores");
    process.exit(1);
}

logger.info("Carregando handlers...");

// Carregar handlers ANTES de fazer login
try {
    const evento = require("./handler/Events");
    const commandHandler = require("./handler/index");

    // Carregar eventos e comandos
    evento.run(client);
    commandHandler(client);
    
    logger.success("Handlers carregados com sucesso");
} catch (error) {
    logger.error("Erro ao carregar handlers", { error: error.message, stack: error.stack });
    process.exit(1);
}

// Login após preparar tudo
logger.info("Realizando login no Discord...");

client.login(token)
    .then(() => {
        logger.success("Bot conectado com sucesso!");
    })
    .catch(error => {
        logger.error("Erro ao conectar ao Discord", { error: error.message });
        process.exit(1);
    });

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
    // Não fazer exit para que o bot continue funcionando
    // No caso de erro crítico, será encerrado manualmente
});

// Verificar credenciais e atualizar status
axios.get("https://discord.com/api/v10/users/@me", {headers: {
  Authorization: `Bot ${token}`,
}}).then((response) => {
  const data = response.data;
  logger.success(`Bot autenticado como: ${data.username}#${data.discriminator}`);
  
  axios.patch(`https://discord.com/api/v9/applications/${data.id}`, {"flags": 8953856}, { 
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
  logger.info("Inicializando configurações padrão...");
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
  } else {
    logger.info("Configurações já existentes, pulando inicialição");
  }
}

initializeConfig().catch(err => {
  logger.error("Erro ao inicializar configurações", { error: err.message });
});
