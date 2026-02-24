const { InteractionType } = require("discord.js");
const logger = require("../../util/logger");
const security = require("../../util/security");
const embeds = require("../../util/embeds");

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        try {
            if (interaction.type === InteractionType.ApplicationCommand) {
                const cmd = client.slashCommands.get(interaction.commandName);

                if (!cmd) {
                    logger.warn(`Comando não encontrado: ${interaction.commandName}`, {
                        userId: interaction.user.id,
                        guild: interaction.guild?.name || 'DM'
                    });
                    
                    return interaction.reply({
                        embeds: [embeds.errorEmbed(
                            'Comando Não Encontrado',
                            `O comando \`/${interaction.commandName}\` não existe ou foi removido.`
                        )],
                        ephemeral: true
                    });
                }

                // Validar rate limit e segurança
                const securityCheck = security.validateCommand(interaction, interaction.commandName);
                if (!securityCheck.proceed) {
                    logger.warn(`Rate limit atingido: ${interaction.commandName}`, {
                        userId: interaction.user.id
                    });
                    
                    return interaction.reply({
                        embeds: [embeds.warningEmbed(
                            'Limite de Requisições',
                            securityCheck.error
                        )],
                        ephemeral: true
                    });
                }

                // Preparar membro
                interaction["member"] = interaction.guild?.members.cache.get(interaction.user.id);

                // Tentar executar comando
                try {
                    if (cmd.execute) {
                        await cmd.execute(interaction);
                    } else if (cmd.run) {
                        await cmd.run(client, interaction);
                    } else {
                        return interaction.reply({
                            embeds: [embeds.errorEmbed(
                                'Erro de Configuração',
                                'Este comando não está configurado corretamente.'
                            )],
                            ephemeral: true
                        });
                    }

                    // Log de comando executado com sucesso
                    logger.command(
                        interaction.user.tag,
                        interaction.commandName,
                        interaction.guild?.name || 'DM'
                    );

                } catch (error) {
                    logger.error(`Erro ao executar comando: ${interaction.commandName}`, {
                        error: error.message,
                        stack: error.stack,
                        userId: interaction.user.id
                    });

                    const reply = {
                        embeds: [embeds.errorEmbed(
                            'Erro ao Executar Comando',
                            'Ocorreu um erro ao tentar executar este comando. A equipe de suporte foi notificada.'
                        )],
                        ephemeral: true
                    };

                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp(reply);
                    } else {
                        await interaction.reply(reply);
                    }
                }
            }
        } catch (error) {
            logger.error(`Erro crítico em interactionCreate`, {
                error: error.message,
                stack: error.stack
            });
        }
    }
};
