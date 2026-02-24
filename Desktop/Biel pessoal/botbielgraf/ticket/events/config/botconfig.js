const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const config = new JsonDatabase({ databasePath: "./db/config.json" });
const perfil = new JsonDatabase({ databasePath: "./db/perfil.json" });
const ct = new JsonDatabase({ databasePath: "./db/category.json" });
const https = require("https");

// Função para consolidar o objeto painel com todos os campos obrigatórios
async function consolidarPainel() {
  try {
    const painelAtual = await config.get("painel") || {};
    
    // Garantir que todos os campos obrigatórios existem
    const painelConsolidado = {
      title: painelAtual.title || "🎲・Central de atendimento",
      footer: painelAtual.footer || "Horário de atendimento: 10:00 até 23:00",
      desc: painelAtual.desc || "**・Olá, seja bem-vindo(a) a central de atendimento da ${interaction.guild.name}, abaixo vamos listar os tipos de departamentos e suporte presentes na nossa empresa escolha um para abrir seu chamando.\n\n📂・Atendimento via ticket\n\n・Selecione abaixo qual departamento está relacionado a sua dúvida ou problema e será gerado um canal de texto privado para que seu atendimento seja realizado de forma segura e ágil.**",
      banner: painelAtual.banner || "https://media.discordapp.net/attachments/1234696813165023303/1237228543021158501/nulledticket_1707888290521.png?ex=663ae25f&is=663990df&hm=bf8ebfef87325092861314fcb99d1c4194a8598048c3ea84d303f7e53d7e076f&=&format=webp&quality=lossless&width=550&height=143",
      cor: painelAtual.cor || "Random",
      placeholder: painelAtual.placeholder || "Escolha uma opção:"
    };
    
    // Salvar o painel consolidado
    await config.set("painel", painelConsolidado);
    return painelConsolidado;
  } catch (error) {
    console.error("Erro ao consolidar painel:", error);
    return null;
  }
}

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        const { customId } = interaction;
        if (!customId) return;
        const userid = customId.split("_")[0];
        if (interaction.user.id !== userid) return;
        const color = await config.get("botconfig.cor");

        if (customId.endsWith("_botconfig")) {
            const options = interaction.values[0];
            if (options === "personalizar") {
                interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`${interaction.guild.name} | Personalização`)
                            .setDescription(`❔ | Qual Opção você deseja **Personalizar**`)
                            .setThumbnail(interaction.client.user.displayAvatarURL())
                            .setColor(color)
                            .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
                            .setTimestamp()
                    ], 
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId(`${userid}_personalizar`)
                                    .setPlaceholder("Escolha Qual parte você deseja personalizar")
                                    .setMaxValues(1)
                                    .addOptions(
                                        {
                                            label: "Painel do Ticket",
                                            description: "Personalize a Embed do /ticket",
                                            emoji: "<:hyperapps39:1218972749050150984>",
                                            value: "painel"
                                        },

                                        {
                                            label: "Embed do Ticket",
                                            description: "Personalize a Embed que fica Dentro do Ticket",
                                            emoji: "<:hyperapps45:1218985928652099594>",
                                            value: "ticket"
                                        },

                                        {
                                            label: "Botões do Ticket",
                                            description: "Personalize os Botões do Ticket",
                                            emoji: "<:hyperapps42:1218973368540463114>",
                                            value: "button"
                                        },

                                        {
                                            label: "Mensagem das Funções",
                                            description: "Personalize as Mensagens das Funções",
                                            emoji: "<:hyperapps40:1218972946316394677>",
                                            value: "function"
                                        },

                                    )
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`${userid}_voltar`)
                                    .setLabel("Voltar")
                                    .setStyle(2)
                                    .setEmoji("<:hyperapps26:1215836101080776704>")
                            )
                    ]
                });
            }
            if (options === "staff") {
                const role = interaction.guild.roles.cache.get(await config.get("cargo_staff")) || "`Não Configurado`";
                interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`${interaction.guild.name} | Gerenciar Cargo Staff`)
                            .setColor(color)
                            .setDescription(`❔ | Escolha qual cargo terá permissão nos **TICKET** (Cargo Staff)\n🔎 | Cargo Staff Atual: ${role}`)
                    ],
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new RoleSelectMenuBuilder()
                                    .setCustomId(`${userid}_roleselect`)
                                    .setMaxValues(1)
                                    .setPlaceholder("Escolha o Cargo STAFF")
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`${userid}_voltar`)
                                    .setLabel("Voltar")
                                    .setStyle(1)
                                    .setEmoji("<:hyperapps26:1215836101080776704>")
                            )
                    ]
                })
            }
            if (options === "logs") {
                const channel = interaction.guild.channels.cache.get(await config.get("channel_logs")) || "`Não Definido`";
                const channel_ava = interaction.guild.channels.cache.get(await config.get("channel_ava")) || "`Não Definido`";
                interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`${interaction.guild.name} | Canais de Logs`)
                            .setDescription(`❔ | Escolha qual Canal deseja configurar. \n🔎 | Canal de LOGS Atual: ${channel}\n🔎 | Canal de Avaliação: ${channel_ava}`)
                            .setColor(color)
                    ],
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId(`${userid}_channelskkk`)
                                    .setMaxValues(1)
                                    .setPlaceholder("Escolha qual Canal deseja configurar")
                                    .addOptions(
                                        {
                                            label: "Canal de Logs",
                                            description: "Configure o Canal que irá as LOGS-TICKET",
                                            value: "logs",
                                            emoji: "<:hyperapps25:1215832166781550684>"
                                        },
                                        {
                                            label: "Canal de Avaliação",
                                            description: "Configure o Canal que irá as Avaliações",
                                            value: "avaliation",
                                            emoji: "<:hyperapps30:1216370471361183884>"
                                        },
                                    )
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`${userid}_voltar`)
                                    .setLabel("Voltar")
                                    .setStyle(1)
                                    .setEmoji("<:hyperapps26:1215836101080776704>")
                            )
                    ]
                })
            }
            if (options === "category") {
                category();
            }
            if (options === "system") {
                interaction.update({
                    content: "",
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`${interaction.guild.name} | Configurar Ticket`)
                            .setDescription(`🔎 | Escolha qual opção você deseja configurar`)
                            .setThumbnail(interaction.client.user.displayAvatarURL())
                            .setColor(color)
                            .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
                            .setTimestamp()
                    ],
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`${userid}_systemopen`)
                                    .setLabel("Sistema de Abertura")
                                    .setStyle(2)
                                    .setEmoji("<:hyperapps25:1215832166781550684>"),
                                new ButtonBuilder()
                                    .setCustomId(`${userid}_button`)
                                    .setLabel("Configurar Botão")
                                    .setStyle(2)
                                    .setEmoji("<:hyperapps25:1215832166781550684>"),
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`${userid}_transcriptconfig`)
                                    .setLabel("Configurar Transcript")
                                    .setStyle(2)
                                    .setEmoji("<:hyperapps25:1215832166781550684>"),
                                new ButtonBuilder()
                                    .setCustomId(`${userid}_voltar`)
                                    .setLabel("Voltar")
                                    .setStyle(1)
                                    .setEmoji("<:hyperapps26:1215836101080776704>"),
                            ),
                    ]
                });
            }
            if (options == "botconfig") {
                botconfig();
            }
        }
        if (customId.endsWith("_transcriptconfig")) {
            const tr = await config.get("transcript");
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setDescription(`- Sistema de Transcript (Logs): ${tr.sistema ? "`Sistema Ativado`" : "`Sistema Desativado`"}\n- Sistema de Transcript (Usuário):  ${tr.usuario ? "`Sistema Ativado`" : "`Sistema Desativado`"}`)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_systemtranscript`)
                                .setLabel("Transcript LOGS ON/OFF")
                                .setEmoji("<:hyperapps52:1219086937734910004>")
                                .setStyle(1),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_usertranscript`)
                                .setLabel("Transcript USER ON/OFF")
                                .setEmoji("<:hyperapps49:1219003103517343784>")
                                .setStyle(1),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar`)
                                .setLabel("Voltar")
                                .setEmoji("<:hyperapps26:1215836101080776704>")
                                .setStyle(2),
                        )
                ]
            });
        }
        if (customId.endsWith("_usertranscript")) {
            const tr1 = await config.get("transcript");
            await config.set("transcript.usuario", !tr1.usuario);
            const tr = await config.get("transcript");
            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setDescription(`- Sistema de Transcript (Logs): ${tr.sistema ? "`Sistema Ativado`" : "`Sistema Desativado`"}\n- Sistema de Transcript (Usuário):  ${tr.usuario ? "`Sistema Ativado`" : "`Sistema Desativado`"}`)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_systemtranscript`)
                                .setLabel("Transcript LOGS ON/OFF")
                                .setEmoji("<:hyperapps52:1219086937734910004>")
                                .setStyle(1),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_usertranscript`)
                                .setLabel("Transcript USER ON/OFF")
                                .setEmoji("<:hyperapps49:1219003103517343784>")
                                .setStyle(1),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar`)
                                .setLabel("Voltar")
                                .setEmoji("<:hyperapps26:1215836101080776704>")
                                .setStyle(2),
                        )
                ]
            });

        }
        if (customId.endsWith("_systemtranscript")) {
            const tr1 = await config.get("transcript");
            await config.set("transcript.sistema", !tr1.sistema);
            const tr = await config.get("transcript");
            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setDescription(`- Sistema de Transcript (Logs): ${tr.sistema ? "`Sistema Ativado`" : "`Sistema Desativado`"}\n- Sistema de Transcript (Usuário):  ${tr.usuario ? "`Sistema Ativado`" : "`Sistema Desativado`"}`)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_systemtranscript`)
                                .setLabel("Transcript LOGS ON/OFF")
                                .setEmoji("<:hyperapps52:1219086937734910004>")
                                .setStyle(1),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_usertranscript`)
                                .setLabel("Transcript USER ON/OFF")
                                .setEmoji("<:hyperapps49:1219003103517343784>")
                                .setStyle(1),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar`)
                                .setLabel("Voltar")
                                .setEmoji("<:hyperapps26:1215836101080776704>")
                                .setStyle(2),
                        )
                ]
            });

        }
        if (customId.endsWith("_channelskkk")) {
            const values = interaction.values[0];
            if (values === "avaliation") {
                interaction.update({
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ChannelSelectMenuBuilder()
                                    .setChannelTypes(ChannelType.GuildText)
                                    .setCustomId(`${userid}_channelavaliationselect`)
                                    .setMaxValues(1)
                                    .setPlaceholder("Escolha o Canal de Avaliação")
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`${userid}_voltar`)
                                    .setLabel("Voltar")
                                    .setStyle(1)
                                    .setEmoji("<:hyperapps26:1215836101080776704>")
                            )
                    ]
                });
            }
            if (values === "logs") {
                interaction.update({
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ChannelSelectMenuBuilder()
                                    .setChannelTypes(ChannelType.GuildText)
                                    .setCustomId(`${userid}_channellogsselect`)
                                    .setMaxValues(1)
                                    .setPlaceholder("Escolha o Canal de LOGS")
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`${userid}_voltar`)
                                    .setLabel("Voltar")
                                    .setStyle(1)
                                    .setEmoji("<:hyperapps26:1215836101080776704>")
                            )
                    ]
                });
            }
        }
        if (customId.endsWith("_channelavaliationselect")) {
            const channelid = interaction.values[0];
            await config.set("channel_ava", channelid);
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Sistema do Ticket`)
                        .setThumbnail(interaction.client.user.displayAvatarURL())
                        .setDescription(`👋 Olá ***${interaction.user.username}***, Seja Bem-Vindo(a) ao Painel de Configuração do Sistema de **TICKET**, Veja abaixo qual opção você deseja configurar neste momento!`)
                        .setColor(color)
                        .setFooter({ text: `${interaction.guild.name} - Todos os Direitos Reservados`, iconURL: interaction.guild.iconURL() })
                        .setTimestamp()
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setPlaceholder("Escolha qual opção você deseja configurar:")
                                .setMaxValues(1)
                                .addOptions(
                                    {
                                        label: "Configurar Categoria",
                                        description: "Configure todas as Categorias do Ticket",
                                        value: "category",
                                        emoji: "<:hyperapps39:1218972749050150984>"
                                    },
                                    {
                                        label: "Configurar Ticket",
                                        description: "Configure o sistema de Ticket",
                                        value: "system",
                                        emoji: "<:hyperapps40:1218972946316394677>"
                                    },
                                    {
                                        label: "Configurar Canal",
                                        description: "Configure o Canal de LOGS Staff",
                                        value: "logs",
                                        emoji: "<:hyperapps41:1218973013748355132>"
                                    },
                                    {
                                        label: "Configurar Cargo",
                                        description: "Configure o Cargo que terá permissões de Staff",
                                        value: "staff",
                                        emoji: "<:hyperapps42:1218973368540463114>"
                                    },
                                    {
                                        label: "Personalizar",
                                        description: "Personalize Embeds E Botões",
                                        value: "personalizar",
                                        emoji: "<:hyperapps25:1215832166781550684>"
                                    },
                                    {
                                        label: "Configuração do Bot",
                                        description: "Configure funcionalidades do bot",
                                        value: "botconfig",
                                        emoji: "<:hyperapps22:1215826999872852091>"
                                    }
                                )
                                .setCustomId(`${interaction.user.id}_botconfig`)
                        )
                ]
            });
        }
        if (customId.endsWith("_button")) {
            boto();
        }

        if (interaction.customId.endsWith("_alterar_biografia")) {
            const text = interaction.fields.getTextInputValue("text");
            const url = 'https://discord.com/api/v10/applications/@me';
            await interaction.reply({ content: `🔁 | Aguarde um momento...`, ephemeral: true });

            const data = {
                description: text
            };

            const jsonData = JSON.stringify(data);

            const options = {
                method: 'PATCH',
                headers: {
                    Authorization: `Bot ${client.token}`,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(jsonData)
                }
            };

            const req = https.request(url, options, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    if (res.statusCode === 200) {
                        interaction.editReply({ content: `✅ | Biografia alterada com sucesso!` });
                    } else {
                        interaction.editReply({ content: `❌ | Ocorreu um erro ao tentar alterar a Biografia do Bot` });
                    }
                });
            });

            req.on('error', (error) => {
                interaction.editReply({ content: `❌ | Ocorreu um erro ao tentar alterar a Biografia do Bot` });
            });

            req.write(jsonData);
            req.end();
        }

        if (customId.endsWith("_systemopen")) {
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Sistema de Abertura`)
                        .setDescription(`❔ | Sistema Atual: ${await config.get("open.system")}`)
                        .setColor(color)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_Select_open`)
                                .setLabel("Select")
                                .setEmoji("<:hyperapps25:1215832166781550684>")
                                .setStyle(2),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_Botão_open`)
                                .setLabel("Botão")
                                .setEmoji("<:hyperapps25:1215832166781550684>")
                                .setStyle(2),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar`)
                                .setLabel("Voltar")
                                .setEmoji("<:hyperapps26:1215836101080776704>")
                                .setStyle(1),
                        )
                ]
            });
        }
        if (customId.endsWith("_open")) {
            const a = customId.split("_")[1];
            await config.set("open.system", a);
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Sistema de Abertura`)
                        .setDescription(`❔ | Sistema Atual: ${await config.get("open.system")}`)
                        .setColor(color)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_Select_open`)
                                .setLabel("Select")
                                .setEmoji("<:hyperapps25:1215832166781550684>")
                                .setStyle(2),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_Botão_open`)
                                .setLabel("Botão")
                                .setEmoji("<:hyperapps25:1215832166781550684>")
                                .setStyle(2),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar`)
                                .setLabel("Voltar")
                                .setEmoji("<:hyperapps26:1215836101080776704>")
                                .setStyle(1),
                        )
                ]
            })
        }
        if (customId.endsWith("_addcategory")) {
            const modal = new ModalBuilder()
                .setTitle(`🔧 - Adicionar Categoria`)
                .setCustomId(`${userid}_addcategorymodal`);

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("Coloque o nome da categoria")
                .setStyle(1)
                .setMaxLength(25)
                .setRequired(true)
                .setPlaceholder("Ex: Suporte/Bugs/Vendas");

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if (customId.endsWith("_addcategorymodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const cap = await ct.get(`${text}`);
            if (cap) return interaction.reply({ content: `❌ | Já existe uma categoria com esse nome.`, ephemeral: true });
            await ct.set(`${text}`, {
                titulo: `${text}`,
                desc: `Clique aqui Para Abrir Ticket`,
                emoji: `🎫`,
                categoria: "Não Configurado"
            });
            category();
        }
        if (customId.endsWith("_removecategory")) {
            const modal = new ModalBuilder()
                .setTitle(`🔧 - Remover Categoria`)
                .setCustomId(`${userid}_removecategorymodal`);

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("Coloque o nome da categoria")
                .setStyle(1)
                .setMaxLength(25)
                .setRequired(true)
                .setPlaceholder("Ex: Suporte/Bugs/Vendas");

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if (customId.endsWith("_removecategorymodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const cap = await ct.get(`${text}`);
            if (!cap) return interaction.reply({ content: `❌ | Não existe uma categoria com esse nome.`, ephemeral: true });
            await ct.delete(`${text}`);
            category();
        }
        if (customId.endsWith("_channellogsselect")) {
            const channelid = interaction.values[0];
            await config.set("channel_logs", channelid);
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Sistema do Ticket`)
                        .setThumbnail(interaction.client.user.displayAvatarURL())
                        .setDescription(`👋 Olá ***${interaction.user.username}***, Seja Bem-Vindo(a) ao Painel de Configuração do Sistema de **TICKET**, Veja abaixo qual opção você deseja configurar neste momento!`)
                        .setColor(color)
                        .setFooter({ text: `${interaction.guild.name} - Todos os Direitos Reservados`, iconURL: interaction.guild.iconURL() })
                        .setTimestamp()
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setPlaceholder("Escolha qual opção você deseja configurar:")
                                .setMaxValues(1)
                                .addOptions(
                                    {
                                        label: "Configurar Categoria",
                                        description: "Configure todas as Categorias do Ticket",
                                        value: "category",
                                        emoji: "<:hyperapps39:1218972749050150984>"
                                    },
                                    {
                                        label: "Configurar Ticket",
                                        description: "Configure o sistema de Ticket",
                                        value: "system",
                                        emoji: "<:hyperapps40:1218972946316394677>"
                                    },
                                    {
                                        label: "Configurar Canal",
                                        description: "Configure o Canal de LOGS Staff",
                                        value: "logs",
                                        emoji: "<:hyperapps41:1218973013748355132>"
                                    },
                                    {
                                        label: "Configurar Cargo",
                                        description: "Configure o Cargo que terá permissões de Staff",
                                        value: "staff",
                                        emoji: "<:hyperapps42:1218973368540463114>"
                                    },
                                    {
                                        label: "Personalizar",
                                        description: "Personalize Embeds E Botões",
                                        value: "personalizar",
                                        emoji: "<:hyperapps25:1215832166781550684>"
                                    },
                                    {
                                        label: "Configuração do Bot",
                                        description: "Configure funcionalidades do bot",
                                        value: "botconfig",
                                        emoji: "<:hyperapps22:1215826999872852091>"
                                    }
                                )
                                .setCustomId(`${interaction.user.id}_botconfig`)
                        )
                ]
            });
        }
        if (customId.endsWith("_roleselect")) {
            const roleid = interaction.values[0];
            await config.set("cargo_staff", roleid);
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Sistema do Ticket`)
                        .setThumbnail(interaction.client.user.displayAvatarURL())
                        .setDescription(`👋 Olá ***${interaction.user.username}***, Seja Bem-Vindo(a) ao Painel de Configuração do Sistema de **TICKET**, Veja abaixo qual opção você deseja configurar neste momento!`)
                        .setColor(color)
                        .setFooter({ text: `${interaction.guild.name} - Todos os Direitos Reservados`, iconURL: interaction.guild.iconURL() })
                        .setTimestamp()
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setPlaceholder("Escolha qual opção você deseja configurar:")
                                .setMaxValues(1)
                                .addOptions(
                                    {
                                        label: "Configurar Categoria",
                                        description: "Configure todas as Categorias do Ticket",
                                        value: "category",
                                        emoji: "<:hyperapps39:1218972749050150984>"
                                    },
                                    {
                                        label: "Configurar Ticket",
                                        description: "Configure o sistema de Ticket",
                                        value: "system",
                                        emoji: "<:hyperapps40:1218972946316394677>"
                                    },
                                    {
                                        label: "Configurar Canal",
                                        description: "Configure o Canal de LOGS Staff",
                                        value: "logs",
                                        emoji: "<:hyperapps41:1218973013748355132>"
                                    },
                                    {
                                        label: "Configurar Cargo",
                                        description: "Configure o Cargo que terá permissões de Staff",
                                        value: "staff",
                                        emoji: "<:hyperapps42:1218973368540463114>"
                                    },
                                    {
                                        label: "Personalizar",
                                        description: "Personalize Embeds E Botões",
                                        value: "personalizar",
                                        emoji: "<:hyperapps25:1215832166781550684>"
                                    },
                                    {
                                        label: "Configuração do Bot",
                                        description: "Configure funcionalidades do bot",
                                        value: "botconfig",
                                        emoji: "<:hyperapps22:1215826999872852091>"
                                    }
                                )
                                .setCustomId(`${interaction.user.id}_botconfig`)
                        )
                ]
            });
        }
        if (customId.endsWith("_personalizar")) {
            const options = interaction.values[0];
            if (options === "painel") {
                painel();
            }
            if (options === "ticket") {
                embedticket();
            }
            if (options === "button") {
                button();
            }
            if (options === "function") {
                funcoes();
            }
        }
        if (customId.endsWith("_voltar1")) {
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Personalização`)
                        .setDescription(`❔ | Qual Opção você deseja **Personalizar**`)
                        .setThumbnail(interaction.client.user.displayAvatarURL())
                        .setColor(color)
                        .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
                        .setTimestamp()
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId(`${userid}_personalizar`)
                                .setPlaceholder("Escolha Qual parte você deseja personalizar")
                                .setMaxValues(1)
                                .addOptions(
                                    {
                                        label: "Painel do Ticket",
                                        description: "Personalize a Embed do /ticket",
                                        emoji: "<:hyperapps39:1218972749050150984>",
                                        value: "painel"
                                    },

                                    {
                                        label: "Embed do Ticket",
                                        description: "Personalize a Embed que fica Dentro do Ticket",
                                        emoji: "<:hyperapps45:1218985928652099594>",
                                        value: "ticket"
                                    },

                                    {
                                        label: "Botões do Ticket",
                                        description: "Personalize os Botões do Ticket",
                                        emoji: "<:hyperapps42:1218973368540463114>",
                                        value: "button"
                                    },

                                    {
                                        label: "Mensagem das Funções",
                                        description: "Personalize as Mensagens das Funções",
                                        emoji: "<:hyperapps40:1218972946316394677>",
                                        value: "function"
                                    },

                                )
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar`)
                                .setLabel("Voltar")
                                .setStyle(2)
                                .setEmoji("<:hyperapps26:1215836101080776704>")
                        )
                ]
            });
        }
        if (customId.endsWith("_voltar")) {
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Sistema do Ticket`)
                        .setThumbnail(interaction.client.user.displayAvatarURL())
                        .setDescription(`👋 Olá ***${interaction.user.username}***, Seja Bem-Vindo(a) ao Painel de Configuração do Sistema de **TICKET**, Veja abaixo qual opção você deseja configurar neste momento!`)
                        .setColor(color)
                        .setFooter({ text: `${interaction.guild.name} - Todos os Direitos Reservados`, iconURL: interaction.guild.iconURL() })
                        .setTimestamp()
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setPlaceholder("Escolha qual opção você deseja configurar:")
                                .setMaxValues(1)
                                .addOptions(
                                    {
                                        label: "Configurar Categoria",
                                        description: "Configure todas as Categorias do Ticket",
                                        value: "category",
                                        emoji: "<:hyperapps39:1218972749050150984>"
                                    },
                                    {
                                        label: "Configurar Ticket",
                                        description: "Configure o sistema de Ticket",
                                        value: "system",
                                        emoji: "<:hyperapps40:1218972946316394677>"
                                    },
                                    {
                                        label: "Configurar Canal",
                                        description: "Configure o Canal de LOGS Staff",
                                        value: "logs",
                                        emoji: "<:hyperapps41:1218973013748355132>"
                                    },
                                    {
                                        label: "Configurar Cargo",
                                        description: "Configure o Cargo que terá permissões de Staff",
                                        value: "staff",
                                        emoji: "<:hyperapps42:1218973368540463114>"
                                    },
                                    {
                                        label: "Personalizar",
                                        description: "Personalize Embeds E Botões",
                                        value: "personalizar",
                                        emoji: "<:hyperapps25:1215832166781550684>"
                                    },
                                    {
                                        label: "Configuração do Bot",
                                        description: "Configure funcionalidades do bot",
                                        value: "botconfig",
                                        emoji: "<:hyperapps22:1215826999872852091>"
                                    }
                                )
                                .setCustomId(`${interaction.user.id}_botconfig`)
                        )
                ]
            });
        }


        if (customId.endsWith("_titulopainel")) {
            const tick = await config.get(`painel`);
            const modal = new ModalBuilder()
                .setCustomId(`${userid}_titulomodalpainel`)
                .setTitle(`🔧 - Configurar Titulo`);

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("Coloque o Novo titulo:")
                .setStyle(1)
                .setValue(`${tick.title}`)
                .setRequired(true)
                .setMaxLength(200);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if (customId.endsWith("_titulomodalpainel")) {
            const text = interaction.fields.getTextInputValue("text");
            // Obter painel atual e atualizar apenas o título
            const painelAtual = await config.get("painel") || {};
            painelAtual.title = text;
            await config.set("painel", painelAtual);
            painel();
        } //


        if (customId.endsWith("_descpainel")) {
            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${interaction.client.user.username} | Alterar Descrição Embed`)
                        .setColor(color)
                        .setImage("https://media.discordapp.net/attachments/1234696813165023303/1237228078984597557/ticketzada.png?ex=663ae1f0&is=66399070&hm=07fd61a0d2e109128b2d839a7fd6d65d3571db6d685216cf3e3175d2b1dee8e7&=&format=webp&quality=lossless")
                        .setDescription(`➡️ | Envie a nova descrição da embed do ticket\n\n➡️ Segue o **Exemplo** Abaixo`)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_cancelled`)
                                .setLabel("Cancelar")
                                .setEmoji("<a:hyperapps39:1218671477990232086>")
                                .setStyle(4)
                        )
                ]
            });

            const filterMensagem = (msg) => msg.author.id === interaction.user.id;
            const collectorMensagem = interaction.channel.createMessageCollector({ filter: filterMensagem });


            collectorMensagem.on("collect", async (mensagem) => {
                await mensagem.delete();
                collectorMensagem.stop();
                const emojis = mensagem.content;
                const painelAtual = await config.get("painel") || {};
                const titleold = painelAtual.desc;

                try {
                    painelAtual.desc = emojis;
                    await config.set("painel", painelAtual);
                    await paineledit()
                } catch {
                    interaction.channel.send({
                        content: `⚠ | Ocorreu um erro ao tentar colocar essa descrição, Recomendo Diminuir!`
                    }).then((msg) => {
                        setTimeout(() => {
                            msg.delete()
                        }, 2700);
                    })
                    painelAtual.desc = titleold;
                    await config.set("painel", painelAtual);
                    await paineledit();
                }
            });


            const filterBotao = (i) => i.message.id === interaction.message.id
            const collectorBotao = interaction.channel.createMessageComponentCollector({ filter: filterBotao });


            collectorBotao.on("collect", (i) => {
                collectorMensagem.stop();
                collectorBotao.stop("cancelled");
                i.deferUpdate();
                paineledit();
            });
        } //


        if (customId.endsWith("_footerpainel")) {
            const tick = await config.get(`painel`);
            const modal = new ModalBuilder()
                .setCustomId(`${userid}_footerpainelmodal`)
                .setTitle(`🔧 - Configurar Footer`);

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("Coloque o Novo Footer:")
                .setStyle(1)
                .setValue(`${tick.footer}`)
                .setRequired(true)
                .setMaxLength(55);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if (customId.endsWith("_footerpainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const painelAtual = await config.get("painel") || {};
            painelAtual.footer = text;
            await config.set("painel", painelAtual);
            painel();
        } //


        if (customId.endsWith("_bannerpainel")) {
            const tick = await config.get(`painel`);
            const modal = new ModalBuilder()
                .setCustomId(`${userid}_bannerpainelmodal`)
                .setTitle(`🔧 - Configurar Banner`);

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("Coloque a url do banner:")
                .setStyle(1)
                .setPlaceholder(`Digite "remover", para Retirar`)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if (customId.endsWith("_bannerpainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const painelAtual = await config.get("painel") || {};
            if (text === "remover") {
                painelAtual.banner = text;
                await config.set("painel", painelAtual);
                painel();
                return;
            }
            try {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(color)
                            .setDescription(`📋 | Seu Novo Banner:`)
                            .setImage(text)
                    ],
                    ephemeral: true
                }).then(async () => {
                    painelAtual.banner = text;
                    await config.set("painel", painelAtual);
                    paineledit();
                }).catch(() => {
                    interaction.reply({ content: `❌ | Coloque uma Imagem Valida`, ephemeral: true });
                })
            } catch {
                interaction.reply({ content: `❌ | Coloque uma imagem Valida!`, ephemeral: true });
            }
        } //


        if (customId.endsWith("_corpainel")) {
            const tick = await config.get(`painel`);
            const modal = new ModalBuilder()
                .setCustomId(`${userid}_corpainelmodal`)
                .setTitle(`🔧 - Configurar Cor da Embed`);

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("Coloque a nova cor:")
                .setStyle(1)
                .setValue(`${tick.cor}`)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if (customId.endsWith("_corpainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const painelAtual = await config.get("painel") || {};
            try {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`📋 | Nova cor adicionada: \`${text}\``)
                            .setColor(text)
                    ],
                    ephemeral: true
                }).then(async () => {
                    painelAtual.cor = text;
                    await config.set("painel", painelAtual);
                    paineledit();
                }).catch(() => {
                    interaction.reply({ content: `❌ | Coloque uma Cor Valida`, ephemeral: true });
                })
            } catch {
                interaction.reply({ content: `❌ | Coloque uma Cor Valida!`, ephemeral: true });
            }
        } //


        if (customId.endsWith("_placeholderpainal")) {
            const tick = await config.get(`painel`);
            const modal = new ModalBuilder()
                .setCustomId(`${userid}_placeholderpainelmodal`)
                .setTitle(`🔧 - Configurar Placeholder`);

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("Coloque o Novo Placeholder:")
                .setStyle(1)
                .setValue(`${tick.placeholder}`)
                .setRequired(true)
                .setMaxLength(25);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if (customId.endsWith("_placeholderpainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const painelAtual = await config.get("painel") || {};
            painelAtual.placeholder = text;
            await config.set("painel", painelAtual);
            painel();
        } //


        if (customId.endsWith("_resetpainel")) {
            const modal = new ModalBuilder()
                .setCustomId(`${userid}_resetpainelmodal`)
                .setTitle(`🔧 - Resetar Painel`);

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("Você realmente deseja Resetar?")
                .setStyle(1)
                .setPlaceholder('Digite: "SIM"')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(3);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if (customId.endsWith("_resetpainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            if (text !== "SIM") return interaction.reply({ content: `✅ | Cancelado com sucesso!`, ephemeral: true });
            await config.set(`painel`, {
                "title": "🎲・Central de atendimento",
                "footer": "Horário de atendimento: 10:00 até 23:00",
                "desc": "**・Olá, seja bem-vindo(a) a central de atendimento da ${interaction.guild.name}, abaixo vamos listar os tipos de departamentos e suporte presentes na nossa empresa escolha um para abrir seu chamando.\n\n📂・Atendimento via ticket\n\n・Selecione abaixo qual departamento está relacionado a sua dúvida ou problema e será gerado um canal de texto privado para que seu atendimento seja realizado de forma segura e ágil.**",
                "banner": "https://media.discordapp.net/attachments/1234696813165023303/1237228543021158501/nulledticket_1707888290521.png?ex=663ae25f&is=663990df&hm=bf8ebfef87325092861314fcb99d1c4194a8598048c3ea84d303f7e53d7e076f&=&format=webp&quality=lossless&width=550&height=143",
                "cor": "Random",
                "placeholder": "Escolha uma opção:"
            });
            painel();
        } //
        if (customId.endsWith("_titleembed")) {
            const tick = await config.get("dentro");
            const modal = new ModalBuilder()
                .setCustomId(`${userid}_titleembedmodal`)
                .setTitle("🔧 - Alterar Titulo");

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("Coloque o novo titulo:")
                .setStyle(1)
                .setRequired(true)
                .setMaxLength(200)
                .setValue(`${tick.title}`);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if (customId.endsWith("_titleembedmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const dentroAtual = await config.get("dentro") || {};
            dentroAtual.title = text;
            await config.set("dentro", dentroAtual);
            embedticket();
        }
        if (customId.endsWith("_descembed")) {
            editembeddentro();
        }
        if (customId.endsWith("_footerembed")) {
            const tick = await config.get("dentro");
            const modal = new ModalBuilder()
                .setCustomId(`${userid}_footerembedmodal`)
                .setTitle("🔧 - Alterar Rodapé");

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("Digite o novo rodapé:")
                .setStyle(1)
                .setValue(`${tick.rodape}`)
                .setPlaceholder('Digite "remover", para retirar')
                .setMaxLength(40)
                .setPlaceholder("Hyper Apps - Todos os direitos reservados.")
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));


            return interaction.showModal(modal);
        }
        if (customId.endsWith("_footerembedmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const dentroAtual = await config.get("dentro") || {};
            dentroAtual.footer = text;
            await config.set("dentro", dentroAtual);
            embedticket();
        }
        if (customId.endsWith("_corembed")) {
            const modal = new ModalBuilder()
                .setCustomId(`${userid}_corembedmodal`)
                .setTitle("🔧 - Cor da Embed");

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("Coloque a nova cor da Embed")
                .setStyle(1)
                .setMaxLength(12)
                .setRequired(true)
                .setPlaceholder("#000000");

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if (customId.endsWith("_corembedmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const dentroAtual = await config.get("dentro") || {};
            try {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`Cor alterada para: \`${text}\``)
                            .setColor(text)
                    ],
                    ephemeral: true
                }).then(async () => {
                    dentroAtual.cor = text;
                    await config.set("dentro", dentroAtual);
                    embedticketedit();
                }).catch(() => {
                    interaction.reply({ content: `❌ | Coloque uma cor hexadecimal valida!`, ephemeral: true });
                })
            } catch {
                interaction.reply({ content: `❌ | Coloque uma cor hexadecimal valida!`, ephemeral: true });
            }
        }
        if (customId.endsWith("_bannerembed")) {
            const modal = new ModalBuilder()
                .setTitle("🔧 - Alterar Banner da Embed")
                .setCustomId(`${userid}_bannerembedmodal`);

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("coloque um novo banner:")
                .setStyle(1)
                .setRequired(true)
                .setPlaceholder('Digite "remover", para retirar o banner');

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if (customId.endsWith("_bannerembedmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const dentroAtual = await config.get("dentro") || {};
            if (text === "remover") {
                dentroAtual.banner = text;
                await config.set("dentro", dentroAtual);
                embedticket();
                return;
            }
            try {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`Novo banner logo abaixo:`)
                            .setImage(text)
                    ],
                    ephemeral: true
                }).then(async () => {
                    dentroAtual.banner = text;
                    await config.set("dentro", dentroAtual);
                    embedticketedit();
                }).catch(() => {
                    interaction.reply({ content: `❌ | Coloque uma imagem valida!`, ephemeral: true });
                })
            } catch {
                interaction.reply({ content: `❌ | Coloque uma imagem valida!`, ephemeral: true });
            }
        }
        if (customId.endsWith("_resetembed")) {
            const modal = new ModalBuilder()
                .setTitle(`❌ - Resetar Embed`)
                .setCustomId(`${userid}_resetembedmodal`);

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("você deseja realmente deletar?")
                .setStyle(1)
                .setMaxLength(3)
                .setMinLength(3)
                .setRequired(true)
                .setPlaceholder('Digite: "SIM"');

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if (customId.endsWith("_resetembedmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            if (text !== "SIM") return interaction.reply({ content: `✅ | Cancelado com sucesso!`, ephemeral: true });
            await config.set("dentro", {
                "title": "${interaction.guild.name} | TICKET",
                "desc": "👋・Olá #{user} Seja Bem-Vindo(A) Como podemos te ajudar ?\n\n👤・Usuário: #{user} (#{userid})\n\n📅・Horário: #{data}\n\n📄・Motivo: #{motivo} (apenas se tiver usando o ticket no modo form)\n\n👮・Staff Que Assumiu: #{assumido}\n\nBom #{user}, Peço que aguarde pacientemente a nossa equipe vir lhe atender. Eles já foram acionados.",
                "banner": "https://media.discordapp.net/attachments/1211407216335134743/1226191319500587068/nulledticket_1707888290521.png?ex=6623dea8&is=661169a8&hm=f52b6338e18c40af25186677304d1e4a6fea722763b26f4b8b384476b0b0c6eb&=&format=webp&quality=lossless&width=1440&height=375",
                "footer": "remover",
                "cor": "Random"
            });
            embedticket();
        }
        if (customId.endsWith("textobutton")) {
            const a = customId.split("_")[1];
            const modal = new ModalBuilder()
                .setCustomId(`${userid}_${a}_textobuttonmodal`)
                .setTitle(`🔎 - Alterar Texto ${a}`);

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setStyle(1)
                .setLabel("Coloque o novo texto:")
                .setPlaceholder("Ex: Sair, Fechar, Membro, Staff")
                .setRequired(true)
                .setMaxLength(50);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if (customId.endsWith("_textobuttonmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const a = customId.split("_")[1];
            await config.set(`button.${a}.label`, text);
            button();
        }
        if (customId.endsWith("_resetbutton")) {
            const modal = new ModalBuilder()
                .setCustomId(`${userid}_resetbuttonmodal`)
                .setTitle("🔎 - Resetar os Botões");

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("Você tem certeza que deseja resetar?")
                .setStyle(1)
                .setRequired(true)
                .setPlaceholder('Digite "SIM", sem aspas')
                .setMaxLength(3)
                .setMinLength(3);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if (customId.endsWith("_resetbuttonmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            if (text !== "SIM") return interaction.reply({ content: `✅ | Cancelado com sucesso!`, ephemeral: true });
            await config.set("button", {
                "sair": {
                    "emoji": "<:hyperapps56:1225925677019299911>",
                    "label": "Sair do Ticket",
                    "style": 1,
                    "ativado": true
                },
                "membro": {
                    "emoji": "<:hyperapps14:1213993959857066084>",
                    "label": "Painel Membro",
                    "style": 3,
                    "ativado": true
                },
                "staff": {
                    "emoji": "<:hyperapps57:1225926013398024315>",
                    "label": "Painel Staff",
                    "style": 3,
                    "ativado": true
                },
                "fechar": {
                    "emoji": "<a:hyperapps39:1218671477990232086>",
                    "label": "Fechar Ticket",
                    "style": 4,
                    "ativado": true
                }
            });
            button();

        }
        if (customId.endsWith("_emojibutton")) {
            const e = customId.split("_")[1];
            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setTitle(`${interaction.client.user.username} | Alterar Emoji da Embed Fora`)
                        .setDescription(`➡️ | Envie o Emoji abaixo: \n ** O emoji tem que estar em um server que o bot também está!**`)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_cancelled`)
                                .setLabel("Cancelar")
                                .setEmoji("<:hyperapps48:1218998701737902151>")
                                .setStyle(4)
                        )
                ]
            });

            const filterMensagem = (msg) => msg.author.id === interaction.user.id;
            const collectorMensagem = interaction.channel.createMessageCollector({ filter: filterMensagem });


            collectorMensagem.on("collect", async (mensagem) => {
                await mensagem.delete();
                collectorMensagem.stop();
                const emojis = mensagem.content;

                const emojiverification = interaction.client.emojis.cache.find(emoji => `<:${emoji.name}:${emoji.id}>` === emojis) || interaction.client.emojis.cache.find(emoji => emoji.name === emojis) || interaction.client.emojis.cache.get(emojis);

                function emojiverification2(str) {
                    const customEmojiRegex = /<a?:\w+:\d+>/g;
                    const unicodeEmojiRegex = /[\p{Emoji}]/gu;
                    const animatedEmojiRegex = /<a:\w+:\d+>/g;

                    const customEmojiMatches = str.match(customEmojiRegex) || [];
                    const unicodeEmojiMatches = str.match(unicodeEmojiRegex) || [];
                    const animatedEmojiMatches = str.match(animatedEmojiRegex) || [];

                    const totalEmojiCount = customEmojiMatches.length + unicodeEmojiMatches.length + animatedEmojiMatches.length;

                    return totalEmojiCount === 1;
                }


                if (!emojiverification && !emojiverification2(emojis)) {
                    await interaction.followUp({
                        ephemeral: true,
                        content: `❌ | Coloque um emoji Valido!`
                    });
                    buttonedit()
                    return;
                }
                await config.set(`button.${e}.emoji`, emojis);
                await buttonedit();

            });


            const filterBotao = (i) => i.customId.startsWith(userid) && i.customId.endsWith("_cancelled") && i.user.id === interaction.user.id && i.message.id === interaction.message.id;
            const collectorBotao = interaction.channel.createMessageComponentCollector({ filter: filterBotao });


            collectorBotao.on("collect", (i) => {
                collectorMensagem.stop();
                collectorBotao.stop("cancelled");
                i.deferUpdate();
                buttonedit();
            });
        }
        if (customId.endsWith("_corbutton")) {
            const e = customId.split("_")[1];
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Configurar Cor do Botão`)
                        .setDescription(`Escolha qual Cor você deseja Colocar`)
                        .setColor(color)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_${e}_1_corbo`)
                                .setLabel("Azul")
                                .setStyle(1),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_${e}_2_corbo`)
                                .setLabel("Cinza")
                                .setStyle(2),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_${e}_3_corbo`)
                                .setLabel("Verde")
                                .setStyle(3),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_${e}_4_corbo`)
                                .setLabel("Vermelho")
                                .setStyle(4),
                        )
                ]
            })
        }
        if (customId.endsWith("_corbo")) {
            const e = customId.split("_")[1];
            const a = Number(customId.split("_")[2]);
            await config.set(`button.${e}.style`, a);
            button();
        }
        if (customId.endsWith("ativarbutton")) {
            const e = customId.split("_")[1];
            const a = await config.get(`button.${e}.ativado`);
            if (a) {
                await config.set(`button.${e}.ativado`, false);
            } else {
                await config.set(`button.${e}.ativado`, true);
            }
            button();
        }
        if (customId.endsWith("_funcoes")) {
            const e = interaction.values[0];
            const kkk = {
                "staff": "https://media.discordapp.net/attachments/1234696813165023303/1237256841340391514/ticketmembro.png?ex=663afcba&is=6639ab3a&hm=1cd240c677124fd70e206a0265ab339e4e13d68fbff45f78c00f42d017d20bdc&=&format=webp&quality=lossless",
                "member": "https://media.discordapp.net/attachments/1234696813165023303/1237255658659909633/staffnotificacao.png?ex=663afba0&is=6639aa20&hm=80e0ab19671ef76581023cc3dd0b9ef644241639b237581e52a1a46b3ba83fef&=&format=webp&quality=lossless",
                "logs_member": "https://media.discordapp.net/attachments/1234696813165023303/1237260249224839189/ticketfechamento.png?ex=663affe6&is=6639ae66&hm=2e7271f2a282a6a96c58abf821b7e25b4355e05b4971ac7ec0c0532bfeefeccf&=&format=webp&quality=lossless",
                "logs_admin": "https://media.discordapp.net/attachments/1234696813165023303/1237262187685482537/ticket_logs.png?ex=663b01b4&is=6639b034&hm=e135f253500598e2640f03c3e0fb90785af3355f63295ac2206f300db27f3303&=&format=webp&quality=lossless&width=329&height=350",
                "assumed": "https://media.discordapp.net/attachments/1234696813165023303/1237264173327581276/logs_pv.png?ex=663b038e&is=6639b20e&hm=7a7c6d5cd88ca1a16351154883406dfeca406bf9d2da356548767dc85095bf6f&=&format=webp&quality=lossless",
                "ticket_assumed": "https://media.discordapp.net/attachments/1234696813165023303/1237263858654249042/logs_assumed.png?ex=663b0343&is=6639b1c3&hm=806f92075165501254bd7d590ea88a5e2b251d149b1e07a084f025b89577b4d8&=&format=webp&quality=lossless"
            };
            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${interaction.client.user.username} | Alterar Descrição Embed`)
                        .setFooter({ text: "Lembrando, as váriaveis não são obrigatórias" })
                        .setColor(color)
                        .setImage(kkk[e])
                        .setDescription(`➡️ | Envie a nova descrição da embed do ticket, caso queira use as váriaveis:\n- \`#{user}\` - Marcar o Usuário. \n\n- \`#{staff}\` - Marcar o Staff. \n\n- \`#{data}\` - Data do Ticket. \n\n- \`#{assumido}\` - Quem Assumiu o Ticket. \n\n- \`#{ticket}\` - Marca o canal do ticket.\n\n\➡️ Segue o **Exemplo** Abaixo`)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_cancelled`)
                                .setLabel("Cancelar")
                                .setEmoji("<a:hyperapps39:1218671477990232086>")
                                .setStyle(4)
                        )
                ]
            });

            const filterMensagem = (msg) => msg.author.id === interaction.user.id;
            const collectorMensagem = interaction.channel.createMessageCollector({ filter: filterMensagem, limit: 1 });
            const filterBotao = (i) => i.message.id === interaction.message.id
            const collectorBotao = interaction.channel.createMessageComponentCollector({ filter: filterBotao, limit: 1 });




            collectorMensagem.on("collect", async (mensagem) => {
                await mensagem.delete();
                collectorMensagem.stop();
                collectorBotao.stop("cancelled");
                const emojis = mensagem.content;
                const titleold = await config.get(`mensagem.${e}`);

                try {
                    await config.set(`mensagem.${e}`, emojis);
                    await funcoesedt();
                } catch {
                    interaction.channel.send({
                        content: `⚠ | Ocorreu um erro ao tentar colocar essa descrição, Recomendo Diminuir!`
                    }).then((msg) => {
                        setTimeout(() => {
                            msg.delete()
                        }, 2700);
                    })
                    await config.set(`mensagem.${e}`, titleold);
                    await funcoesedt();
                }
            });


            collectorBotao.on("collect", (i) => {
                collectorMensagem.stop();
                collectorBotao.stop("cancelled");
                i.deferUpdate();
                funcoesedt();
            });
        }
        if (customId.endsWith("_resetarfuncoes")) {
            const modal = new ModalBuilder()
                .setCustomId(`${userid}_resetarfuncoesmodal`)
                .setTitle("🔎 - Resetar Funções");

            const text = new TextInputBuilder()
                .setLabel("você realmente deseja Resetar?")
                .setStyle(1)
                .setCustomId("text")
                .setPlaceholder('Digite "SIM", sem aspas')
                .setRequired(true)
                .setMaxLength(3)
                .setMinLength(3);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if (customId.endsWith("_resetarfuncoesmodal")) {
            const e = interaction.fields.getTextInputValue("text");
            if (e !== "SIM") return interaction.reply({ content: `✅ | Cancelado com sucesso!`, ephemeral: true });
            await config.set(`mensagem`, { // teu audio ta cortando, volto agr veinho
                "staff": "👋・**Olá**, **#{staff}**, o usuário **#{user}** **requer sua atenção** no **ticket** que você está trabalhando.\n📁・**Canal do Ticket**: Por favor, **clique** no botão abaixo para ir para o **ticket**",
                "member": "👋・**Olá, #{user}, **O **responsável** pelo seu ticket, **#{staff}** está solicitando sua **presença** no ticket.\n📁・**Canal do Ticket:**  Por favor, **clique** no botão abaixo para ir para o **ticket**",
                "logs_member": "👋 Olá #{user} Seu ticket foi Finalizado!\n\n- Data de fechamento: #{data}\n- Staff Responsavel: #{assumido}\n- Fechado Por: #{staff}",
                "logs_admin": "👥・Dono do Ticket: #{user}\n🛠️・Staff que Fechou: #{staff}\n🔎・Assumido por: #{assumido}\n📅・Data: #{data}",
                "assumed": "👋・Olá **#{user}**, seu ticket foi assumido pelo **Staff: #{staff}**.\n📁・Canal do Ticket: **#{ticket}**",
                "ticket_assumed": "👮・**Staff** que assumiu: #{assumido}\n📁・**Ticket** assumido: #{ticket}"

            });
            funcoes();
        }
        if (customId.endsWith("_categoryselect")) {
            const a = interaction.values[0]; 
            const b = await ct.get(`${a}`);
            const category = interaction.guild.channels.cache.get(b.categoria) || "`Não Configurado`";
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | `)
                        .setColor(color)
                        .setDescription(`🔎 | ID: ${a}\n📝 | Titulo: ${b.titulo}\n📋 | Descrição: \`${b.desc}\`\n🎨 | Emoji: ${b.emoji}\n📕 | Categoria: ${category}`)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_${a}_titlecategory`)
                                .setLabel("Alterar Título")
                                .setStyle(1)
                                .setEmoji("<:hyperapps27:1215838168419532852>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_${a}_desccategory`)
                                .setLabel("Alterar Descrição")
                                .setStyle(1)
                                .setEmoji("<:hyperapps29:1216103847072890890>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_${a}_emojicategory`)
                                .setLabel("Alterar Emoji")
                                .setStyle(1)
                                .setEmoji("<:hyperapps27:1215838168419532852>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_${a}_categorycategory`)
                                .setLabel("Alterar Categoria")
                                .setStyle(1)
                                .setEmoji("<:hyperapps29:1216103847072890890>"),
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar3`)
                                .setLabel("Voltar")
                                .setStyle(2)
                                .setEmoji("<:hyperapps26:1215836101080776704>")
                        )
                ]
            });
        }
        if (customId.endsWith("_categorycategory")) {
            const ae = customId.split("_")[1];
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`❔ | Escolha qual será a nova Categoria`)
                        .setColor(color)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ChannelSelectMenuBuilder()
                                .setCustomId(`${userid}_${ae}_category12354`)
                                .setChannelTypes(ChannelType.GuildCategory)
                                .setPlaceholder("Escolha qual categoria seria aberto")
                                .setMaxValues(1)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_${ae}_voltar4`)
                                .setLabel("Voltar")
                                .setStyle(2)
                                .setEmoji("<:hyperapps26:1215836101080776704>")
                        )
                ]
            })
        }
        if (customId.endsWith("_category12354")) {
            const a = customId.split("_")[1];
            const e = interaction.values[0];
            await ct.set(`${a}.categoria`, e);
            editable(a);
        }
        if (customId.endsWith("_voltar4")) {
            const a = customId.split("_")[1];
            editable(a);
        }
        if (customId.endsWith("_emojicategory")) {
            const e = customId.split("_")[1];
            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${interaction.client.user.username} | Alterar Emoji da Categoria`)
                        .setColor(color)
                        .setDescription(`➡️ | Envie o Emoji abaixo: \n ** O emoji tem que estar em um server que o bot também está!**`)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_cancelled`)
                                .setLabel("Cancelar")
                                .setEmoji("<:hyperapps48:1218998701737902151>")
                                .setStyle(4)
                        )
                ]
            });

            const filterMensagem = (msg) => msg.author.id === interaction.user.id;
            const collectorMensagem = interaction.channel.createMessageCollector({ filter: filterMensagem });


            collectorMensagem.on("collect", async (mensagem) => {
                await mensagem.delete();
                collectorMensagem.stop();
                const emojis = mensagem.content;

                const emojiverification = interaction.client.emojis.cache.find(emoji => `<:${emoji.name}:${emoji.id}>` === emojis) || interaction.client.emojis.cache.find(emoji => emoji.name === emojis) || interaction.client.emojis.cache.get(emojis);

                function emojiverification2(str) {
                    const customEmojiRegex = /<a?:\w+:\d+>/g;
                    const unicodeEmojiRegex = /[\p{Emoji}]/gu;
                    const animatedEmojiRegex = /<a:\w+:\d+>/g;

                    const customEmojiMatches = str.match(customEmojiRegex) || [];
                    const unicodeEmojiMatches = str.match(unicodeEmojiRegex) || [];
                    const animatedEmojiMatches = str.match(animatedEmojiRegex) || [];

                    const totalEmojiCount = customEmojiMatches.length + unicodeEmojiMatches.length + animatedEmojiMatches.length;

                    return totalEmojiCount === 1;
                }


                if (!emojiverification && !emojiverification2(emojis)) {
                    await interaction.followUp({
                        ephemeral: true,
                        content: `❌ | Coloque um emoji Valido!`
                    });
                    editable
                    return;
                }
                await ct.set(`${e}.emoji`, emojis);
                await editableedit(e);

            });


            const filterBotao = (i) => i.customId.startsWith(userid) && i.customId.endsWith("_cancelled") && i.user.id === interaction.user.id && i.message.id === interaction.message.id;
            const collectorBotao = interaction.channel.createMessageComponentCollector({ filter: filterBotao });


            collectorBotao.on("collect", (i) => {
                collectorMensagem.stop();
                collectorBotao.stop("cancelled");
                i.deferUpdate();
                editableedit(e);
            });
        }
        if (customId.endsWith("_desccategory")) {
            const a = customId.split("_")[1];
            const modal = new ModalBuilder()
                .setCustomId(`${userid}_${a}_desccategorymodal`)
                .setTitle("🔧 - Alterar Descrição da Categoria");

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("coloque a nova descrição:")
                .setStyle(1)
                .setRequired(true)
                .setMaxLength(45);

            modal.addComponents(new ActionRowBuilder().addComponents(text));


            return interaction.showModal(modal);
        }
        if (customId.endsWith("_desccategorymodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const a = customId.split("_")[1];
            await ct.set(`${a}.desc`, text);
            editable(a);
        }
        if (customId.endsWith("_titlecategory")) {
            const a = customId.split("_")[1];
            const modal = new ModalBuilder()
                .setCustomId(`${userid}_${a}_titlecategorymodal`)
                .setTitle("🔧 - Alterar Titulo da Categoria");

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("coloque o novo titulo:")
                .setStyle(1)
                .setRequired(true)
                .setMaxLength(25);

            modal.addComponents(new ActionRowBuilder().addComponents(text));


            return interaction.showModal(modal);
        }
        if (customId.endsWith("_titlecategorymodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const a = customId.split("_")[1];
            await ct.set(`${a}.titulo`, text);
            editable(a);
        }
        if (customId.endsWith("_voltar3")) {
            category();
        }
        if (customId.endsWith("_labelbutton123")) {
            const modal = new ModalBuilder()
                .setCustomId(`${userid}_labelmodalk1o2i3`)
                .setTitle("❔ - Qual será o novo Texto?");

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setStyle(1)
                .setLabel("Coloque o novo texto:")
                .setMaxLength(30)
                .setRequired(true)
                .setPlaceholder("Abrir Ticket")
                .setValue(await config.get("open.button.label"));

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if (customId.endsWith("_labelmodalk1o2i3")) {
            const text = interaction.fields.getTextInputValue("text");
            await config.set("open.button.label", text);
            boto();
        } //
        if (customId.endsWith("_emojibutton123")) {
            const modal = new ModalBuilder()
                .setCustomId(`${userid}_emojibutton123modal`)
                .setTitle("❔ - Qual será o novo emoji?");

            const text = new TextInputBuilder()
                .setCustomId("text")
                .setLabel("Coloque o novo emoji:")
                .setStyle(1)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if (customId.endsWith("_emojibutton123modal")) {
            const text = interaction.fields.getTextInputValue("text");
            try {
                await interaction.reply({
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId("asdiosadmnas")
                                    .setStyle(2)
                                    .setEmoji(text)
                            )
                    ],
                    ephemeral: true
                }).then(async () => {
                    await config.set("open.button.emoji", text);
                    const b = await config.get("open.button");
                    interaction.message.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(color)
                                .setTitle(`${interaction.guild.name} | Configurar Botão`)
                                .setDescription(`- Texto do Botão: \`${b.label}\`\n- Emoji do Botão: \`${b.emoji}\`\n- Cor do Emoji: ${colorbutton(b.style)}`)
                        ],
                        components: [
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`${userid}_labelbutton123`)
                                        .setLabel("Alterar Texto")
                                        .setEmoji("<:hyperapps29:1216103847072890890>")
                                        .setStyle(1),
                                    new ButtonBuilder()
                                        .setCustomId(`${userid}_emojibutton123`)
                                        .setLabel("Alterar Emoji")
                                        .setEmoji("<:hyperapps27:1215838168419532852>")
                                        .setStyle(1),
                                    new ButtonBuilder()
                                        .setCustomId(`${userid}_corbutton123`)
                                        .setLabel("Alterar Cor")
                                        .setEmoji("<:hyperapps22:1215826999872852091>")
                                        .setStyle(1),
                                    new ButtonBuilder()
                                        .setCustomId(`${userid}_voltar`)
                                        .setLabel("Voltar")
                                        .setEmoji("<:hyperapps26:1215836101080776704>")
                                        .setStyle(2),
                                )
                        ]
                    });
                }).catch(() => {
                    interaction.reply({
                        content: `❌ | Coloque um emoji valido.`,
                        ephemeral: true
                    });
                })
            } catch {
                interaction.reply({
                    content: `❌ | Coloque um emoji valido.`,
                    ephemeral: true
                });
            }
        }
        if (customId.endsWith("_corbutton123")) {
            interaction.update({
                embeds: [],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_colorbutton123_1`)
                                .setLabel("Azul")
                                .setStyle(1),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_colorbutton123_2`)
                                .setLabel("Cinza")
                                .setStyle(2),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_colorbutton123_3`)
                                .setLabel("Verde")
                                .setStyle(3),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_colorbutton123_4`)
                                .setLabel("Vermelho")
                                .setStyle(4),
                        )
                ]
            })
        }
        if (customId.includes("_colorbutton123")) {
            const ok = Number(customId.split("_")[2]);
            await config.set("open.button.style", ok);
            boto();
        }
        if (customId.endsWith("_selectbotconfig")) {
            const options = interaction.values[0];
            if (options == "biografia") {
                const modal = new ModalBuilder()
                    .setCustomId(`${userid}_alterar_biografia`)
                    .setTitle("❔ - Qual Biografia você deseja colocar?");

                const text = new TextInputBuilder()
                    .setCustomId("text")
                    .setStyle(2)
                    .setMaxLength(399)
                    .setMinLength(3)
                    .setLabel("Coloque a nova biografia:")
                    .setPlaceholder("Hyper Apps");

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            } else if (options == "name") {
                const modal = new ModalBuilder()
                    .setCustomId(`${userid}_alterarnamebot`)
                    .setTitle("Alterar Nome do Bot");

                const text = new TextInputBuilder()
                    .setCustomId("text")
                    .setLabel("Coloque o novo nome:")
                    .setStyle(1)
                    .setMaxLength(100)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            } else if (options === "avatar") {
                const modal = new ModalBuilder()
                    .setCustomId(`${userid}_alteraravatarbot`)
                    .setTitle("Alterar Avatar do Bot");

                const text = new TextInputBuilder()
                    .setCustomId("text")
                    .setLabel("Coloque a url da imagem:")
                    .setStyle(1)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            } else if (options === "color") {
                const modal = new ModalBuilder()
                    .setCustomId(`${userid}_alterarcolorpadrao`)
                    .setTitle("Alterar Cor Padrão");

                const text = new TextInputBuilder()
                    .setCustomId("text")
                    .setLabel("Coloque a nova cor:")
                    .setStyle(1)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            } else if (options === "pix") {
                const modal = new ModalBuilder()
                    .setCustomId(`${userid}_alterarpixbot`)
                    .setTitle("Alterar Pix");

                const text = new TextInputBuilder()
                    .setCustomId("text")
                    .setLabel("Coloque a nova chave pix:")
                    .setStyle(1)
                    .setMaxLength(100)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            } else if (options === "category") {
                interaction.update({
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ChannelSelectMenuBuilder()
                                    .setChannelTypes(ChannelType.GuildCategory)
                                    .setCustomId(`${userid}_categorykkmodassad`)
                                    .setMaxValues(1)
                                    .setPlaceholder("Escolha a Categoria do Ticket")
                            )
                    ]
                });
            } else if (options === "avaliation") {
                await config.set("botconfig.systemavaliation", !await config.get("botconfig.systemavaliation"));
                botconfig();
            } else if (options === "staff") {
                await config.set("botconfig.systemsendmsg", !await config.get("botconfig.systemsendmsg"));
                botconfig();
            } else if (options === "topicorcategory") {
                await config.set("botconfig.topic", !await config.get("botconfig.topic"));
                botconfig();   
            }
        }
        if (customId.endsWith("_alterarnamebot")) {
            const avatar = interaction.fields.getTextInputValue("text");
            await interaction.reply({ content: `🔁 **| Aguarde um momento...**`, ephemeral: true });
            try {
                await client.user.setUsername(avatar).then(() => {
                    botconfigedit();
                    interaction.editReply({ content: `✅ | Alterado com sucesso!`, ephemeral: true });
                }).catch((err) => {
                    interaction.editReply({ content: `❌ | Aconteceu um erro...\n⚠️ Mensagem do Erro: \`\`\`${err.message}\`\`\``, ephemeral: true });
                    botconfigedit();
                });
            } catch (err) {
                interaction.editReply({ content: `❌ | Aconteceu um erro...\n⚠️ Mensagem do Erro: \`\`\`${err.message}\`\`\``, ephemeral: true });
                botconfigedit();
            }
        }
        if (customId.endsWith("_alteraravatarbot")) {
            const avatar = interaction.fields.getTextInputValue("text");
            await interaction.reply({ content: `🔁 **| Aguarde um momento...**`, ephemeral: true });
            try {
                await client.user.setAvatar(avatar).then(() => {
                    botconfigedit();
                    interaction.editReply({ content: `✅ | Alterado com sucesso!`, ephemeral: true });
                }).catch((err) => {
                    interaction.editReply({ content: `❌ | Aconteceu um erro...\n⚠️ Mensagem do Erro: \`\`\`${err.message}\`\`\``, ephemeral: true });
                    botconfigedit();
                });
            } catch (err) {
                interaction.editReply({ content: `❌ | Aconteceu um erro...\n⚠️ Mensagem do Erro: \`\`\`${err.message}\`\`\``, ephemeral: true });
                botconfigedit();
            }
        }
        if (customId.endsWith("_alterarcolorpadrao")) {
            const text = interaction.fields.getTextInputValue("text");
            try {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`**✅ | Sua nova cor foi alterada com sucesso para: \`${text}\`**`)
                            .setColor(text)
                    ],
                    ephemeral: true
                }).then(async () => {
                    await config.set("botconfig.cor", text);
                    botconfigedit();
                }).catch(() => {
                    interaction.reply({
                        content: `❌** | Coloque uma cor valida!**`,
                        ephemeral: true
                    });
                });
            } catch {
                interaction.reply({
                    content: `❌** | Coloque uma cor valida!**`,
                    ephemeral: true
                });
            }
        }
        if (customId.endsWith("_alterarpixbot")) {
            const text = interaction.fields.getTextInputValue("text");
            await config.set("botconfig.pix", text);
            botconfig();
        }
        if (customId.endsWith("_categorykkmodassad")) {
            await config.set("botconfig.category", interaction.values[0]);
            botconfig()
        }
        async function botconfigedit() {
            const botc = await config.get("botconfig");
            const category = interaction.client.channels.cache.get(botc.category);

            await interaction.message.edit({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: `${interaction.user.username} - Outras Configurações`, iconURL: interaction.member.displayAvatarURL() })
                        .setColor(color)
                        .setDescription(`🔎** | Configure as outras configurações do seu Bot de Ticket!**`)
                        .addFields(
                            {
                                name: ":robot: Nome do Bot:",
                                value: `${interaction.client.user.username}`

                            },
                            {
                                name: ":frame_photo: Avatar do Bot:",
                                value: `[Download do Avatar](${interaction.client.user.displayAvatarURL()})`
                            },
                            {
                                name: ":notebook_with_decorative_cover: Cor Atual:",
                                value: `\`${botc.cor}\``
                            },
                            {
                                name: ":diamond_shape_with_a_dot_inside: Chave Pix:",
                                value: `\`${botc.pix}\``
                            },
                            {
                                name: ":hash: Categoria Padrão",
                                value: `${category ? `${category} (\`${category.id}\`)` : "`Não Configurado.`"}`
                            },
                            {
                                name: ":star: Sistema de Avaliação:",
                                value: `${botc.systemavaliation ? "**Sistema Ativado**" : "**Sistema Desativado**"}`
                            },
                            {
                                name: ":police_officer: Marcar Cargo Staff",
                                value: `${botc.systemsendmsg ? "**Sistema Ativado**" : "**Sistema Desativado**"}`
                            },
                            {
                                name: ":hash: Tópico ou Categoria",
                                value: `${botc.topic ? "`Tópico`" : "`Categoria`"}`
                            }
                        )
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId(`${userid}_selectbotconfig`)
                                .setMaxValues(1)
                                .setMinValues(1)
                                .setPlaceholder("Escolha qual opção deseja configurar.")
                                .addOptions(
                                    {
                                        label: "Nome do Bot",
                                        value: "name",
                                        emoji: "<:hyperapps23:1215827177812000788>"
                                    },
                                    {
                                        label: "Avatar do Bot",
                                        value: "avatar",
                                        emoji: "<:hyperapps49:1219003103517343784>"
                                    },
                                    {
                                        label: "Biografia",
                                        value: "biografia",
                                        emoji: "<:hyperapps22:1215826999872852091>"
                                    },
                                    {
                                        label: "Cor Padrão",
                                        value: "color",
                                        emoji: "<:hyperapps27:1215838168419532852>"
                                    },
                                    {
                                        label: "Chave Pix",
                                        value: "pix",
                                        emoji: "<:hyperapps35:1217496476599582720>"
                                    },
                                    {
                                        label: "Categoria Padrão",
                                        value: "category",
                                        emoji: "<:hyperapps27:1215838168419532852>"
                                    },
                                    {
                                        label: "Sistema de Avaliação (ON/OFF)",
                                        value: "avaliation",
                                        emoji: "<:hyperapps30:1216370471361183884>"
                                    },
                                    {
                                        label: "Marcar o Cargo Staff (ON/OFF)",
                                        value: "staff",
                                        emoji: "<:hyperapps42:1218973368540463114>"
                                    },
                                    {
                                        label: "Tópico Ou Categoria",
                                        value: "topicorcategory",
                                        emoji: "<:hyperapps41:1218973013748355132>"
                                    },
                                )
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar`)
                                .setLabel("Voltar")
                                .setStyle(1)
                                .setEmoji("<:hyperapps26:1215836101080776704>"),
                        )
                ]
            })
        }
        async function botconfig() {
            const botc = await config.get("botconfig");
            const category = interaction.client.channels.cache.get(botc.category);

            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: `${interaction.user.username} - Outras Configurações`, iconURL: interaction.member.displayAvatarURL() })
                        .setColor(color)
                        .setDescription(`🔎** | Configure as outras configurações do seu Bot de Ticket!**`)
                        .addFields(
                            {
                                name: ":robot: Nome do Bot:",
                                value: `${interaction.client.user.username}`

                            },
                            {
                                name: ":frame_photo: Avatar do Bot:",
                                value: `[Download do Avatar](${interaction.client.user.displayAvatarURL()})`
                            },
                            {
                                name: ":notebook_with_decorative_cover: Cor Atual:",
                                value: `\`${botc.cor}\``
                            },
                            {
                                name: ":diamond_shape_with_a_dot_inside: Chave Pix:",
                                value: `\`${botc.pix}\``
                            },
                            {
                                name: ":hash: Categoria Padrão",
                                value: `${category ? `${category} (\`${category.id}\`)` : "`Não Configurado.`"}`
                            },
                            {
                                name: ":star: Sistema de Avaliação:",
                                value: `${botc.systemavaliation ? "**Sistema Ativado**" : "**Sistema Desativado**"}`
                            },
                            {
                                name: ":police_officer: Marcar Cargo Staff",
                                value: `${botc.systemsendmsg ? "**Sistema Ativado**" : "**Sistema Desativado**"}`
                            },
                            {
                                name: ":hash: Tópico ou Categoria",
                                value: `${botc.topic ? "`Tópico`" : "`Categoria`"}`
                            }
                        )
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId(`${userid}_selectbotconfig`)
                                .setMaxValues(1)
                                .setMinValues(1)
                                .setPlaceholder("Escolha qual opção deseja configurar.")
                                .addOptions(
                                    {
                                        label: "Nome do Bot",
                                        value: "name",
                                        emoji: "<:hyperapps23:1215827177812000788>"
                                    },
                                    {
                                        label: "Avatar do Bot",
                                        value: "avatar",
                                        emoji: "<:hyperapps49:1219003103517343784>"
                                    },
                                    {
                                        label: "Biografia",
                                        value: "biografia",
                                        emoji: "<:hyperapps22:1215826999872852091>"
                                    },
                                    {
                                        label: "Cor Padrão",
                                        value: "color",
                                        emoji: "<:hyperapps27:1215838168419532852>"
                                    },
                                    {
                                        label: "Chave Pix",
                                        value: "pix",
                                        emoji: "<:hyperapps35:1217496476599582720>"
                                    },
                                    {
                                        label: "Categoria Padrão",
                                        value: "category",
                                        emoji: "<:hyperapps27:1215838168419532852>"
                                    },
                                    {
                                        label: "Sistema de Avaliação (ON/OFF)",
                                        value: "avaliation",
                                        emoji: "<:hyperapps30:1216370471361183884>"
                                    },
                                    {
                                        label: "Marcar o Cargo Staff (ON/OFF)",
                                        value: "staff",
                                        emoji: "<:hyperapps42:1218973368540463114>"
                                    },
                                    {
                                        label: "Tópico Ou Categoria",
                                        value: "topicorcategory",
                                        emoji: "<:hyperapps41:1218973013748355132>"
                                    },
                                )
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar`)
                                .setLabel("Voltar")
                                .setStyle(1)
                                .setEmoji("<:hyperapps26:1215836101080776704>"),
                        )
                ]
            })
        }
        async function boto() {
            const b = await config.get("open.button");
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setTitle(`${interaction.guild.name} | Configurar Botão`)
                        .setDescription(`- Texto do Botão: \`${b.label}\`\n- Emoji do Botão: \`${b.emoji}\`\n- Cor do Emoji: ${colorbutton(b.style)}`)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_labelbutton123`)
                                .setLabel("Alterar Texto")
                                .setEmoji("<:hyperapps29:1216103847072890890>")
                                .setStyle(1),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_emojibutton123`)
                                .setLabel("Alterar Emoji")
                                .setEmoji("<:hyperapps27:1215838168419532852>")
                                .setStyle(1),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_corbutton123`)
                                .setLabel("Alterar Cor")
                                .setEmoji("<:hyperapps22:1215826999872852091>")
                                .setStyle(1),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar`)
                                .setLabel("Voltar")
                                .setEmoji("<:hyperapps26:1215836101080776704>")
                                .setStyle(2),
                        )
                ]
            });
        }
        async function editable(text) {
            const b = await ct.get(`${text}`);
            const category = interaction.guild.channels.cache.get(b.categoria) || "`Não Configurado`";
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setTitle(`${interaction.guild.name} | Configurar Categoria`)
                        .setDescription(`🔎 | ID: ${text}\n📝 | Titulo: ${b.titulo}\n📋 | Descrição: \`${b.desc}\`\n🎨 | Emoji: ${b.emoji}\n📕 | Categoria: ${category}`)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_${text}_titlecategory`)
                                .setLabel("Alterar Título")
                                .setStyle(1)
                                .setEmoji("<:hyperapps27:1215838168419532852>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_${text}_desccategory`)
                                .setLabel("Alterar Descrição")
                                .setStyle(1)
                                .setEmoji("<:hyperapps29:1216103847072890890>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_${text}_emojicategory`)
                                .setLabel("Alterar Emoji")
                                .setStyle(1)
                                .setEmoji("<:hyperapps27:1215838168419532852>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_${text}_categorycategory`)
                                .setLabel("Alterar Categoria")
                                .setStyle(1)
                                .setEmoji("<:hyperapps29:1216103847072890890>"),
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar3`)
                                .setLabel("Voltar")
                                .setStyle(2)
                                .setEmoji("<:hyperapps26:1215836101080776704>")
                        )
                ]
            });
        }
        async function editableedit(text) {
            const b = await ct.get(`${text}`);
            const category = interaction.guild.channels.cache.get(b.categoria) || "`Não Configurado`";
            interaction.message.edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setTitle(`${interaction.guild.name} | Configurar Categoria`)
                        .setDescription(`🔎 | ID: ${text}\n📝 | Titulo: ${b.titulo}\n📋 | Descrição: \`${b.desc}\`\n🎨 | Emoji: ${b.emoji}\n📕 | Categoria: ${category}`)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_${text}_titlecategory`)
                                .setLabel("Alterar Título")
                                .setStyle(1)
                                .setEmoji("<:hyperapps27:1215838168419532852>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_${text}_desccategory`)
                                .setLabel("Alterar Descrição")
                                .setStyle(1)
                                .setEmoji("<:hyperapps29:1216103847072890890>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_${text}_emojicategory`)
                                .setLabel("Alterar Emoji")
                                .setStyle(1)
                                .setEmoji("<:hyperapps27:1215838168419532852>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_${text}_categorycategory`)
                                .setLabel("Alterar Categoria")
                                .setStyle(1)
                                .setEmoji("<:hyperapps29:1216103847072890890>"),
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar3`)
                                .setLabel("Voltar")
                                .setStyle(2)
                                .setEmoji("<:hyperapps26:1215836101080776704>")
                        )
                ]
            });
        }
        async function category() {
            const select = new StringSelectMenuBuilder().setCustomId(`${userid}_categoryselect`).setPlaceholder("Escolha Qual Categoria Configurar").setMaxValues(1);
            const all = await ct.all();
            if (all.length <= 0) {
                select.addOptions({ label: "adas", value: "asdasdas" }).setDisabled(true).setPlaceholder("Adicione uma Categoria")
            } else {
                all.forEach((a) => {
                    select.addOptions(
                        {
                            label: `${a.data.titulo}`,
                            description: `${a.data.desc}`,
                            emoji: a.data.emoji,
                            value: `${a.ID}`
                        }
                    )
                })
            }
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Gerenciamento de Categoria`)
                        .setDescription(`🔎 | Escolha o que você deseja fazer.`)
                        .setColor(color)
                        .setTimestamp()
                        .setFooter({ text: `${interaction.guild.name} - Todos os Direitos Reservados`, iconURL: interaction.guild.iconURL() })
                        .setThumbnail(interaction.guild.iconURL())
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_addcategory`)
                                .setLabel("Adicionar Categoria")
                                .setEmoji("<:hyperapps43:1218977376172507227>")
                                .setStyle(3)
                                .setDisabled(all.length > 23),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_removecategory`)
                                .setLabel("Remover Categoria")
                                .setEmoji("<:hyperapps44:1218977445944758354>")
                                .setStyle(2)
                                .setDisabled(all.length < 1),
                        ),
                    new ActionRowBuilder()
                        .addComponents(select),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar`)
                                .setLabel("Voltar")
                                .setStyle(2)
                                .setEmoji("<:hyperapps26:1215836101080776704>")
                        )
                ]
            });
        }
        async function funcoes() {
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Mensagens de Funções`)
                        .setDescription("🔎 | Escolha qual opção você deseja alterar a descrição!")
                        .setColor(color)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId(`${userid}_funcoes`)
                                .setPlaceholder("Escolha qual você deseja:")
                                .setMaxValues(1)
                                .addOptions(
                                    {
                                        label: "Notificação Staff",
                                        description: "Notificação que os staffs enviarão para os membros.",
                                        emoji: "<:hyperapps25:1215832166781550684>",
                                        value: "member"
                                    },
                                    {
                                        label: "Notificação Membro",
                                        description: "Notificação que os membros enviarão para os staffs.",
                                        emoji: "<:hyperapps54:1219088734801100884>",
                                        value: "staff"
                                    },
                                    {
                                        label: "Finalização De Ticket",
                                        description: "Notificação de ticket finalizado.",
                                        emoji: "<:hyperapps29:1216103847072890890>",
                                        value: "logs_member"
                                    },
                                    {
                                        label: "Finalização Logs ADM",
                                        description: "Logs de ticket finalizado.",
                                        emoji: "<:hyperapps42:1218973368540463114>",
                                        value: "logs_admin"
                                    },
                                    {
                                        label: "Ticket Assumido Notificação",
                                        description: "Notificação ao membro quando o ticket for assumido.",
                                        emoji: "<:hyperapps52:1219086937734910004>",
                                        value: "assumed"
                                    },
                                    {
                                        label: "Ticket Assumido Logs ADM",
                                        description: "Logs ADM de ticket assumido.",
                                        emoji: "<:hyperapps53:1219087554981265470>",
                                        value: "ticket_assumed"
                                    },
                                )
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_resetarfuncoes`)
                                .setLabel("Resetar Mensagens")
                                .setStyle(4)
                                .setEmoji("<:hyperapps47:1218994379239460936>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar1`)
                                .setLabel("Voltar")
                                .setStyle(2)
                                .setEmoji("<:hyperapps26:1215836101080776704>"),
                        )
                ]
            })
        }
        async function funcoesedt() {
            interaction.message.edit({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Mensagens de Funções`)
                        .setDescription("🔎 | Escolha qual opção você deseja alterar a descrição!")
                        .setColor(color)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId(`${userid}_funcoes`)
                                .setPlaceholder("Escolha qual você deseja:")
                                .setMaxValues(1)
                                .addOptions(
                                    {
                                        label: "Notificação Staff",
                                        description: "Notificação que os staffs enviarão para os membros.",
                                        emoji: "<:hyperapps25:1215832166781550684>",
                                        value: "member"
                                    },
                                    {
                                        label: "Notificação Membro",
                                        description: "Notificação que os membros enviarão para os staffs.",
                                        emoji: "<:hyperapps54:1219088734801100884>",
                                        value: "staff"
                                    },
                                    {
                                        label: "Finalização De Ticket",
                                        description: "Notificação de ticket finalizado.",
                                        emoji: "<:hyperapps29:1216103847072890890>",
                                        value: "logs_member"
                                    },
                                    {
                                        label: "Finalização Logs ADM",
                                        description: "Logs de ticket finalizado.",
                                        emoji: "<:hyperapps42:1218973368540463114>",
                                        value: "logs_admin"
                                    },
                                    {
                                        label: "Ticket Assumido Notificação",
                                        description: "Notificação ao membro quando o ticket for assumido.",
                                        emoji: "<:hyperapps52:1219086937734910004>",
                                        value: "assumed"
                                    },
                                    {
                                        label: "Ticket Assumido Logs ADM",
                                        description: "Logs ADM de ticket assumido.",
                                        emoji: "<:hyperapps53:1219087554981265470>",
                                        value: "ticket_assumed"
                                    },
                                )
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_resetarfuncoes`)
                                .setLabel("Resetar Mensagens")
                                .setStyle(4)
                                .setEmoji("<:hyperapps47:1218994379239460936>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar1`)
                                .setLabel("Voltar")
                                .setStyle(2)
                                .setEmoji("<:hyperapps26:1215836101080776704>"),
                        )
                ]
            })
        }
        async function button() {
            const button = await config.get("button"); // pronto
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setTitle(`${interaction.guild.name} | Configurar botões`)
                        .setDescription(`- Botão de Sair do Ticket\n - Emoji: ${button.sair.emoji}\n - Texto do botão: \`${button.sair.label}\`\n - Cor do Botão: \`${colorbutton(button.sair.style)}\n - O Botão está ${button.sair.ativado == true ? "Ativado" : "Desativado"}\`\n\n- Botão de Painel Membro\n - Emoji: ${button.membro.emoji}\n - Texto do botão: \`${button.membro.label}\`\n - Cor do Botão: \`${colorbutton(button.membro.style)}\`\n - O Botão está ${button.membro.ativado == true ? "Ativado" : "Desativado"}\n\n- Botão de Painel Staff\n - Emoji: ${button.staff.emoji}\n - Texto do botão: \`${button.staff.label}\`\n - Cor do Botão: \`${colorbutton(button.staff.style)}\`\n - O Botão está ${button.staff.ativado == true ? "Ativado" : "Desativado"}\n\n- Botão de Fechar o Ticket\n - Emoji: ${button.fechar.emoji}\n - Texto do botão: \`${button.fechar.label}\`\n - Cor do Botão: \`${colorbutton(button.fechar.style)}\`\n - O Botão está ${button.fechar.ativado == true ? "Ativado" : "Desativado"}`)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_sair_emojibutton`)
                                .setLabel("Emoji SAIR")
                                .setStyle(2)
                                .setEmoji("<:hyperapps25:1215832166781550684>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_membro_emojibutton`)
                                .setLabel("Emoji MEMBRO")
                                .setStyle(2)
                                .setEmoji("<:hyperapps25:1215832166781550684>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_staff_emojibutton`)
                                .setLabel("Emoji STAFF")
                                .setStyle(2)
                                .setEmoji("<:hyperapps25:1215832166781550684>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_fechar_emojibutton`)
                                .setLabel("Emoji FECHAR")
                                .setStyle(2)
                                .setEmoji("<:hyperapps25:1215832166781550684>"),
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_sair_corbutton`)
                                .setLabel("Cor SAIR")
                                .setStyle(button.sair.style)
                                .setEmoji("<:hyperapps22:1215826999872852091>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_membro_corbutton`)
                                .setLabel("Cor MEMBRO")
                                .setStyle(button.membro.style)
                                .setEmoji("<:hyperapps22:1215826999872852091>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_staff_corbutton`)
                                .setLabel("Cor STAFF")
                                .setStyle(button.staff.style)
                                .setEmoji("<:hyperapps22:1215826999872852091>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_fechar_corbutton`)
                                .setLabel("Cor FECHAR")
                                .setStyle(button.fechar.style)
                                .setEmoji("<:hyperapps22:1215826999872852091>"),
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_sair_ativarbutton`)
                                .setLabel(button.sair.ativado == true ? "Ativado SAIR" : "Desativado SAIR")
                                .setStyle(button.sair.ativado === true ? 3 : 4)
                                .setEmoji("<:hyperapps50:1219007103696637993>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_membro_ativarbutton`)
                                .setLabel(button.membro.ativado == true ? "Ativado MEMBRO" : "Desativado MEMBRO")
                                .setStyle(button.membro.ativado === true ? 3 : 4)
                                .setEmoji("<:hyperapps50:1219007103696637993>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_staff_ativarbutton`)
                                .setLabel(button.staff.ativado == true ? "Ativado STAFF" : "Desativado STAFF")
                                .setStyle(button.staff.ativado === true ? 3 : 4)
                                .setEmoji("<:hyperapps50:1219007103696637993>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_fechar_ativarbutton`)
                                .setLabel(button.fechar.ativado == true ? "Ativado FECHAR" : "Desativado FECHAR")
                                .setStyle(button.fechar.ativado === true ? 3 : 4)
                                .setEmoji("<:hyperapps50:1219007103696637993>"),
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_resetbutton`)
                                .setLabel("Resetar Botões")
                                .setStyle(4)
                                .setEmoji("<:hyperapps47:1218994379239460936>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar1`)
                                .setLabel("Voltar")
                                .setStyle(1)
                                .setEmoji("<:hyperapps26:1215836101080776704>"),
                        )
                ]
            })
        }
        async function buttonedit() {
            const button = await config.get("button");
            interaction.message.edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setTitle(`${interaction.guild.name} | Configurar botões`)
                        .setDescription(`- Botão de Sair do Ticket\n - Emoji: ${button.sair.emoji}\n - Texto do botão: \`${button.sair.label}\`\n - Cor do Botão: \`${colorbutton(button.sair.style)}\n - O Botão está ${button.sair.ativado == true ? "Ativado" : "Desativado"}\`\n\n- Botão de Painel Membro\n - Emoji: ${button.membro.emoji}\n - Texto do botão: \`${button.membro.label}\`\n - Cor do Botão: \`${colorbutton(button.membro.style)}\`\n - O Botão está ${button.membro.ativado == true ? "Ativado" : "Desativado"}\n\n- Botão de Painel Staff\n - Emoji: ${button.staff.emoji}\n - Texto do botão: \`${button.staff.label}\`\n - Cor do Botão: \`${colorbutton(button.staff.style)}\`\n - O Botão está ${button.staff.ativado == true ? "Ativado" : "Desativado"}\n\n- Botão de Fechar o Ticket\n - Emoji: ${button.fechar.emoji}\n - Texto do botão: \`${button.fechar.label}\`\n - Cor do Botão: \`${colorbutton(button.fechar.style)}\`\n - O Botão está ${button.fechar.ativado == true ? "Ativado" : "Desativado"}`)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_sair_emojibutton`)
                                .setLabel("Emoji SAIR")
                                .setStyle(2)
                                .setEmoji("<:hyperapps25:1215832166781550684>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_membro_emojibutton`)
                                .setLabel("Emoji MEMBRO")
                                .setStyle(2)
                                .setEmoji("<:hyperapps25:1215832166781550684>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_staff_emojibutton`)
                                .setLabel("Emoji STAFF")
                                .setStyle(2)
                                .setEmoji("<:hyperapps25:1215832166781550684>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_fechar_emojibutton`)
                                .setLabel("Emoji FECHAR")
                                .setStyle(2)
                                .setEmoji("<:hyperapps25:1215832166781550684>"),
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_sair_corbutton`)
                                .setLabel("Cor SAIR")
                                .setStyle(button.sair.style)
                                .setEmoji("<:hyperapps22:1215826999872852091>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_membro_corbutton`)
                                .setLabel("Cor MEMBRO")
                                .setStyle(button.membro.style)
                                .setEmoji("<:hyperapps22:1215826999872852091>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_staff_corbutton`)
                                .setLabel("Cor STAFF")
                                .setStyle(button.staff.style)
                                .setEmoji("<:hyperapps22:1215826999872852091>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_fechar_corbutton`)
                                .setLabel("Cor FECHAR")
                                .setStyle(button.fechar.style)
                                .setEmoji("<:hyperapps22:1215826999872852091>"),
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_sair_ativarbutton`)
                                .setLabel(button.sair.ativado == true ? "Ativado SAIR" : "Desativado SAIR")
                                .setStyle(button.sair.ativado === true ? 3 : 4)
                                .setEmoji("<:hyperapps50:1219007103696637993>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_membro_ativarbutton`)
                                .setLabel(button.membro.ativado == true ? "Ativado MEMBRO" : "Desativado MEMBRO")
                                .setStyle(button.membro.ativado === true ? 3 : 4)
                                .setEmoji("<:hyperapps50:1219007103696637993>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_staff_ativarbutton`)
                                .setLabel(button.staff.ativado == true ? "Ativado STAFF" : "Desativado STAFF")
                                .setStyle(button.staff.ativado === true ? 3 : 4)
                                .setEmoji("<:hyperapps50:1219007103696637993>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_fechar_ativarbutton`)
                                .setLabel(button.fechar.ativado == true ? "Ativado FECHAR" : "Desativado FECHAR")
                                .setStyle(button.fechar.ativado === true ? 3 : 4)
                                .setEmoji("<:hyperapps50:1219007103696637993>"),
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_resetbutton`)
                                .setLabel("Resetar Botões")
                                .setStyle(4)
                                .setEmoji("<:hyperapps47:1218994379239460936>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar1`)
                                .setLabel("Voltar")
                                .setStyle(1)
                                .setEmoji("<:hyperapps26:1215836101080776704>"),
                        )
                ]
            })
        }
        async function painel() {

            const tick = await config.get(`painel`);
            const embed = new EmbedBuilder()
                .setAuthor({ name: "Personalização do Painel Ticket", iconURL: interaction.client.user.displayAvatarURL() })
                .setColor(tick.cor)
                .setTitle(`${tick.title}`);
            let desc = tick.desc;
            desc = desc.replace("${interaction.guild.name}", interaction.guild.name);
            embed.setDescription(`${desc}`);
            if (tick.banner.startsWith("https://")) {
                embed.setImage(tick.banner);
            }
            if (tick.footer !== "remover") {
                embed.setFooter({ text: `${tick.footer}` });
            }
            interaction.update({
                embeds: [
                    embed
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId(`${userid}_asdioasndouias`)
                                .setDisabled(true)
                                .addOptions({ label: "a", value: "a" })
                                .setPlaceholder(tick.placeholder)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setLabel("Configurar Titulo")
                                .setStyle(1)
                                .setEmoji("<:hyperapps27:1215838168419532852>")
                                .setCustomId(`${userid}_titulopainel`),
                            new ButtonBuilder()
                                .setLabel("Configurar Descrição")
                                .setStyle(1)
                                .setEmoji("<:hyperapps29:1216103847072890890>")
                                .setCustomId(`${userid}_descpainel`),
                            new ButtonBuilder()
                                .setLabel("Configurar Rodapé")
                                .setStyle(1)
                                .setEmoji("<:hyperapps25:1215832166781550684>")
                                .setCustomId(`${userid}_footerpainel`),
                            new ButtonBuilder()
                                .setLabel("Mudar Banner")
                                .setStyle(1)
                                .setCustomId(`${userid}_bannerpainel`)
                                .setEmoji("<:hyperapps46:1218989288071495811>")
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_corpainel`)
                                .setLabel("Mudar Cor")
                                .setStyle(1)
                                .setEmoji("<:hyperapps22:1215826999872852091>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_placeholderpainal`)
                                .setLabel("Mudar PlaceHolder")
                                .setStyle(1)
                                .setEmoji("<:hyperapps27:1215838168419532852>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_resetpainel`)
                                .setLabel("Resetar Embed")
                                .setStyle(4)
                                .setEmoji("<:hyperapps47:1218994379239460936>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar1`)
                                .setLabel("Voltar")
                                .setStyle(2)
                                .setEmoji("<:hyperapps26:1215836101080776704>"),
                        )
                ]
            });
        }
        async function embedticket() {
            const tick = await config.get(`dentro`);
            const embed = new EmbedBuilder().setAuthor({ name: `Personalização da Embed de Ticket`, iconURL: interaction.client.user.displayAvatarURL() })
                .setColor(tick.cor)
                .setDescription(`${tick.desc}`);
            if (tick.banner.startsWith("https://")) {
                embed.setImage(tick.banner);
            }
            if (tick.footer !== "remover") {
                embed.setFooter({ text: `${tick.footer}` });
            }
            let title = tick.title;
            title = title.replace("${interaction.guild.name}", interaction.guild.name);
            embed.setTitle(`${title}`);
            interaction.update({
                embeds: [embed],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_titleembed`)
                                .setLabel("Alterar Titulo")
                                .setStyle(1)
                                .setEmoji("<:hyperapps27:1215838168419532852>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_descembed`)
                                .setLabel("Alterar Descrição")
                                .setStyle(1)
                                .setEmoji("<:hyperapps29:1216103847072890890>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_footerembed`)
                                .setLabel("Alterar Rodapé")
                                .setStyle(1)
                                .setEmoji("<:hyperapps25:1215832166781550684>"),
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_corembed`)
                                .setLabel("Cor da Embed")
                                .setStyle(1)
                                .setEmoji("<:hyperapps46:1218989288071495811>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_bannerembed`)
                                .setLabel("Alterar Banner")
                                .setStyle(1)
                                .setEmoji("<:hyperapps22:1215826999872852091>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_resetembed`)
                                .setLabel("Resetar Embed")
                                .setStyle(4)
                                .setEmoji("<:hyperapps47:1218994379239460936>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar1`)
                                .setLabel("Voltar")
                                .setStyle(2)
                                .setEmoji("<:hyperapps26:1215836101080776704>"),
                        ),
                ]
            })

        }
        async function embedticketedit() {
            const tick = await config.get(`dentro`);
            const embed = new EmbedBuilder().setAuthor({ name: `Personalização da Embed de Ticket`, iconURL: interaction.client.user.displayAvatarURL() })
                .setColor(tick.cor)
                .setDescription(`${tick.desc}`);
            if (tick.banner.startsWith("https://")) {
                embed.setImage(tick.banner);
            }
            if (tick.footer !== "remover") {
                embed.setFooter({ text: `${tick.footer}` });
            }
            let title = tick.title;
            title = title.replace("${interaction.guild.name}", interaction.guild.name);
            embed.setTitle(`${title}`);
            interaction.message.edit({
                embeds: [embed],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_titleembed`)
                                .setLabel("Alterar Titulo")
                                .setStyle(1)
                                .setEmoji("<:hyperapps27:1215838168419532852>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_descembed`)
                                .setLabel("Alterar Descrição")
                                .setStyle(1)
                                .setEmoji("<:hyperapps29:1216103847072890890>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_footerembed`)
                                .setLabel("Alterar Rodapé")
                                .setStyle(1)
                                .setEmoji("<:hyperapps25:1215832166781550684>"),
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_corembed`)
                                .setLabel("Cor da Embed")
                                .setStyle(1)
                                .setEmoji("<:hyperapps46:1218989288071495811>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_bannerembed`)
                                .setLabel("Alterar Banner")
                                .setStyle(1)
                                .setEmoji("<:hyperapps22:1215826999872852091>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_resetembed`)
                                .setLabel("Resetar Embed")
                                .setStyle(4)
                                .setEmoji("<:hyperapps47:1218994379239460936>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar1`)
                                .setLabel("Voltar")
                                .setStyle(2)
                                .setEmoji("<:hyperapps26:1215836101080776704>"),
                        ),
                ]
            })

        }
        async function editembeddentro() {

            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${interaction.client.user.username} | Alterar Descrição Embed`)
                        .setFooter({ text: "Lembrando, as váriaveis não são obrigatórias!" })
                        .setColor(color)
                        .setImage("https://media.discordapp.net/attachments/1234696813165023303/1237230256423829504/ticketzada1.png?ex=663ae3f7&is=66399277&hm=b577bf66470bcfebc55b1a50ad9a35905e5bbf86fd0f7a1362fe91f5da34004b&=&format=webp&quality=lossless")
                        .setDescription(`➡️ | Envie a nova descrição da embed do ticket, caso queira use as váriaveis:\n- \`#{user}\` - Marcar o Usuário \n - \`#{userid}\` - ID do Usuário \n\n- \`#{data}\` - Data do Ticket \n\n- \`#{motivo}\` - Motivo do Ticket(Apenas para Botão)\n\n- \`#{assumido}\` - Quem Assumiu o Ticket\n\n➡️ Segue o **Exemplo** Abaixo`)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_cancelled`)
                                .setLabel("Cancelar")
                                .setEmoji("<:hyperapps48:1218998701737902151>")
                                .setStyle(4)
                        )
                ]
            });

            const filterMensagem = (msg) => msg.author.id === interaction.user.id;
            const collectorMensagem = interaction.channel.createMessageCollector({ filter: filterMensagem });


            collectorMensagem.on("collect", async (mensagem) => {
                await mensagem.delete();
                collectorMensagem.stop();
                const emojis = mensagem.content;
                const titleold = await config.get(`dentro.desc`);

                try {
                    await config.set(`dentro.desc`, emojis);
                    await embedticketedit();
                } catch {
                    interaction.channel.send({
                        content: `⚠ | Ocorreu um erro ao tentar colocar essa descrição, Recomendo Diminuir!`
                    }).then((msg) => {
                        setTimeout(() => {
                            msg.delete()
                        }, 2700);
                    })
                    await config.set(`dentro.desc`, titleold);
                    await embedticketedit();
                }
            });


            const filterBotao = (i) => i.message.id === interaction.message.id
            const collectorBotao = interaction.channel.createMessageComponentCollector({ filter: filterBotao });


            collectorBotao.on("collect", (i) => {
                collectorMensagem.stop();
                collectorBotao.stop("cancelled");
                i.deferUpdate();
                embedticketedit();
            });
        }
        async function paineledit() {

            const tick = await config.get(`painel`);
            const embed = new EmbedBuilder()
                .setAuthor({ name: "Personalização do Painel Ticket", iconURL: interaction.client.user.displayAvatarURL() })
                .setColor(tick.cor)
                .setTitle(`${tick.title}`);
            let desc = tick.desc;
            desc = desc.replace("${interaction.guild.name}", interaction.guild.name);
            embed.setDescription(`${desc}`);
            if (tick.banner.startsWith("https://")) {
                embed.setImage(tick.banner);
            }
            if (tick.footer !== "remover") {
                embed.setFooter({ text: `${tick.footer}` });
            }
            interaction.message.edit({
                embeds: [
                    embed
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId(`${userid}_asdioasndouias`)
                                .setDisabled(true)
                                .addOptions({ label: "a", value: "a" })
                                .setPlaceholder(tick.placeholder)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setLabel("Configurar Titulo")
                                .setStyle(1)
                                .setEmoji("<:hyperapps27:1215838168419532852>")
                                .setCustomId(`${userid}_titulopainel`),
                            new ButtonBuilder()
                                .setLabel("Configurar Descrição")
                                .setStyle(1)
                                .setEmoji("<:hyperapps29:1216103847072890890>")
                                .setCustomId(`${userid}_descpainel`),
                            new ButtonBuilder()
                                .setLabel("Configurar Rodapé")
                                .setStyle(1)
                                .setEmoji("<:hyperapps25:1215832166781550684>")
                                .setCustomId(`${userid}_footerpainel`),
                            new ButtonBuilder()
                                .setLabel("Mudar Banner")
                                .setStyle(1)
                                .setCustomId(`${userid}_bannerpainel`)
                                .setEmoji("<:hyperapps46:1218989288071495811>")
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_corpainel`)
                                .setLabel("Mudar Cor")
                                .setStyle(1)
                                .setEmoji("<:hyperapps22:1215826999872852091>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_placeholderpainal`)
                                .setLabel("Mudar PlaceHolder")
                                .setStyle(1)
                                .setEmoji("<:hyperapps27:1215838168419532852>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_resetpainel`)
                                .setLabel("Resetar Embed")
                                .setStyle(4)
                                .setEmoji("<:hyperapps47:1218994379239460936>"),
                            new ButtonBuilder()
                                .setCustomId(`${userid}_voltar1`)
                                .setLabel("Voltar")
                                .setStyle(2)
                                .setEmoji("<:hyperapps26:1215836101080776704>"),
                        )
                ]
            });
        }
        function colorbutton(cor) {
            switch (cor) {
                case 1: return "Primario - Azul"
                case 2: return "Segundario - Cinza"
                case 3: return "Sucesso - Verde"
                case 4: return "Perigo - Vermelho"
            }
        }
    }
}
