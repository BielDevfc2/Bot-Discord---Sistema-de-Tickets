const logger = require("../../util/logger");

module.exports = {
    name: "ready",
    once: true, // Executar apenas uma vez
    run: async (client) => {
        logger.section("✅ BOT PRONTO");

        logger.success(`Bot ${client.user.tag} iniciado com sucesso!`);
        logger.info(`Usuários em cache: ${client.users.cache.size}`);
        logger.info(`Servidores conectados: ${client.guilds.cache.size}`);
        logger.info(`Canais em cache: ${client.channels.cache.size}`);

        // Registrar comandos com Discord para cada servidor
        logger.info("Registrando comandos com Discord...");
        
        if (client.slashCommandsArray && client.slashCommandsArray.length > 0) {
            const commandsToRegister = client.slashCommandsArray.map(cmd => {
                if (cmd.toJSON && typeof cmd.toJSON === 'function') {
                    return cmd.toJSON();
                }
                return cmd;
            });

            let successCount = 0;
            let errorCount = 0;

            for (const guild of client.guilds.cache.values()) {
                try {
                    await guild.commands.set(commandsToRegister);
                    successCount++;
                    logger.success(`Comandos atualizados em: ${guild.name} (${guild.id})`);
                } catch (error) {
                    errorCount++;
                    logger.error(`Erro ao atualizar comandos em ${guild.name}`, {
                        guildId: guild.id,
                        error: error.message
                    });
                }
            }

            logger.section("📊 RESUMO DE REGISTRAÇÃO");
            logger.success(`Comandos atualizados com sucesso: ${successCount} servidor(es)`);
            if (errorCount > 0) {
                logger.error(`Erros ao atualizar: ${errorCount} servidor(es)`);
            }
            logger.info(`Total de comandos registrados: ${commandsToRegister.length}`);
        } else {
            logger.warn("Nenhum comando foi carregado!");
        }

        // Definir status do bot
        try {
            await client.user.setPresence({
                activities: [
                    {
                        name: 'tickets',
                        type: 2, // WATCHING
                    }
                ],
                status: 'online',
            });
            logger.success("Status do bot atualizado para online");
        } catch (error) {
            logger.warn("Erro ao atualizar status do bot", { error: error.message });
        }

        logger.section("🎉 BOT TOTALMENTE OPERACIONAL");
    }
};

