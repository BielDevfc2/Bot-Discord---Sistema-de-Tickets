const { InteractionType } = require("discord.js");
const fs = require('fs');
const path = require('path');
const logger = require("../../util/logger");
const security = require("../../util/security");
const embeds = require("../../util/embeds");

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client = interaction.client) => {
        try {
            // Tratar AutocompleteInteraction
            if (interaction.type === 4) { // AutocompleteInteraction
                try {
                    const cmd = client.slashCommands.get(interaction.commandName);
                    if (cmd?.autocomplete) {
                        await cmd.autocomplete(interaction);
                    }
                } catch (error) {
                    logger.warn(`Erro em autocomplete: ${interaction.commandName}`, {
                        error: error.message
                    });
                }
                return;
            }

            if (interaction.type === InteractionType.ApplicationCommand) {
                const cmd = client.slashCommands.get(interaction.commandName);

                if (!cmd) {
                    // Tentar carregar dinamicamente o comando a partir da pasta `commands`
                    try {
                        const commandsRoot = path.join(__dirname, '../../commands');
                        const folders = fs.readdirSync(commandsRoot).filter(f => fs.statSync(path.join(commandsRoot, f)).isDirectory());
                        for (const folder of folders) {
                            const files = fs.readdirSync(path.join(commandsRoot, folder)).filter(f => f.endsWith('.js'));
                            for (const file of files) {
                                try {
                                    const filePath = path.join(commandsRoot, folder, file);
                                    delete require.cache[require.resolve(filePath)];
                                    const possible = require(filePath);
                                    const possibleName = possible?.data?.name || possible?.name;
                                    if (possibleName === interaction.commandName) {
                                        client.slashCommands.set(possibleName, possible);
                                        // garantir que o array de registro contenha o comando
                                        client.slashCommandsArray = client.slashCommandsArray || [];
                                        const payloadCmd = possible.data && typeof possible.data.toJSON === 'function' ? possible.data.toJSON() : (possible.data || possible);
                                        if (!client.slashCommandsArray.find(c => c && c.name === payloadCmd.name)) {
                                            client.slashCommandsArray.push(payloadCmd);
                                        }
                                        cmd = possible;
                                        logger.info(`Comando carregado dinâmicamente: ${possibleName}`);
                                        break;
                                    }
                                } catch (e) {
                                    // ignorar erros de require individuais
                                }
                            }
                            if (cmd) break;
                        }
                    } catch (e) {
                        logger.warn('Falha ao tentar carregar comando dinamicamente', { error: e.message });
                    }

                    if (!cmd) {
                        const loaded = Array.from((client.slashCommands && client.slashCommands.keys && typeof client.slashCommands.keys === 'function') ? client.slashCommands.keys() : []);
                        logger.warn(`Comando não encontrado: ${interaction.commandName}`, {
                            userId: interaction.user.id,
                            guild: interaction.guild?.name || 'DM',
                            loadedCount: loaded.length,
                            sampleLoaded: loaded.slice(0, 25)
                        });

                        const payload = {
                            embeds: [embeds.errorEmbed(
                                'Comando Não Encontrado',
                                `O comando \`/${interaction.commandName}\` não existe ou foi removido.`
                            )],
                            ephemeral: true
                        };

                        try {
                            return await interaction.reply(payload);
                        } catch (err) {
                            logger.warn('Falha ao responder comando não encontrado, tentando followUp', { error: err.message });
                            try {
                                return await interaction.followUp(payload);
                            } catch (err2) {
                                logger.error('Não foi possível notificar usuário sobre comando não encontrado', { error: err2.message });
                                return;
                            }
                        }
                    }
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
