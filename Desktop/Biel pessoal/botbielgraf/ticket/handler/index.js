const fs = require("fs");
const path = require("path");
const logger = require("../util/logger");

module.exports = async (client) => {

  const SlashsArray = [];
  const loadedNames = new Set();
  let folderCount = 0;
  let fileCount = 0;
  let errorCount = 0;
  
  const commandsPath = path.join(__dirname, "../commands");
  
  logger.info("Procurando comandos em:", { path: commandsPath });

  if (!fs.existsSync(commandsPath)) {
    logger.error("Pasta commands não encontrada!");
    return;
  }

  const folders = fs.readdirSync(commandsPath);
  logger.info(`${folders.length} pastas encontradas: ${folders.join(", ")}`);
  logger.section("📦 CARREGANDO COMANDOS");

  for (const subfolder of folders) {

    const subfolderPath = path.join(commandsPath, subfolder);
    
    // Verificar se é um diretório
    const stat = fs.statSync(subfolderPath);
    if (!stat.isDirectory()) {
      logger.warn(`${subfolder} não é um diretório, pulando`);
      continue;
    }
    
    const files = fs.readdirSync(subfolderPath);
    folderCount++;
    
    logger.info(`📂 ${subfolder}/ (${files.filter(f => f.endsWith('.js')).length} arquivos)`);

    for (const file of files) {

      if (!file.endsWith(".js")) continue;

      fileCount++;

      try {
        const filePath = path.join(subfolderPath, file);
        const command = require(filePath);

        // Suporta tanto { name, execute } quanto { data, execute }
        const commandName = command?.data?.name || command?.name;

        if (!commandName) {
          logger.warn(`${file} não tem 'name' ou 'data.name' definido`);
          continue;
        }

        // Evitar duplicatas
        if (loadedNames.has(commandName)) {
          logger.warn(`${file} é duplicado (${commandName} já foi carregado)`);
          continue;
        }

        client.slashCommands.set(commandName, command);
        SlashsArray.push(command.data || command);
        loadedNames.add(commandName);
        logger.success(`${commandName} (${file})`);
      } catch (error) {
        errorCount++;
        logger.error(`Erro ao carregar ${file}`, {
          error: error.message,
          folder: subfolder
        });
      }
    }
  }

  logger.section(`🎯 RESUMO DE CARREGAMENTO`);
  logger.info(`Total de pastas processadas: ${folderCount}`);
  logger.info(`Total de arquivos processados: ${fileCount}`);
  logger.info(`Total de comandos carregados: ${SlashsArray.length}`);
  
  if (errorCount > 0) {
    logger.warn(`Total de erros: ${errorCount}`);
  }

  // Armazenar comandos no cliente para que ready.js possa acessá-los
  client.slashCommandsArray = SlashsArray;
};
