const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType, PermissionOverwrites, PermissionsBitField, PermissionFlagsBits, UserSelectMenuBuilder } = require("discord.js");
const {JsonDatabase} = require("wio.db");
const config = new JsonDatabase({databasePath:"./db/config.json"});
const perfil = new JsonDatabase({databasePath:"./db/perfil.json"});
const ct = new JsonDatabase({databasePath:"./db/category.json"});

const { QuickDB } = require("quick.db");
const db = new QuickDB({table:"ticket"});
const {createTranscript} = require("discord-html-transcripts");
const axios = require("axios"); 
const FormData = require("form-data");
const fs = require("fs");
const { readJson, writeJson } = require("../../util/jsonDb");
const { formatBrazilianDateTime, replaceText } = require("../../util/ticketUtils");


module.exports = {
    name:"interactionCreate",
    run: async(interaction, client) => {
    const customId = interaction.customId;
    if(!customId) return;
    const botconfigk = await config.get("botconfig");
    const colorEmbed = await config.get("botconfig.cor");
    if(customId === "abrir_ticket") {
        const modal = new ModalBuilder()
        .setCustomId("abrir_ticket_modal")
        .setTitle("🎫 - T");


        const text = new TextInputBuilder()
        .setCustomId("text")
        .setStyle(1)
        .setRequired(false)
        .setLabel("qual é o motivo do ticket?")
        .setPlaceholder("Resgatar um produto...")
        .setMaxLength(150);

        modal.addComponents(new ActionRowBuilder().addComponents(text));

        return interaction.showModal(modal);
    }
    if(customId === "abrir_ticket_modal") {
        const motivo = interaction.fields.getTextInputValue("text") || "Nenhum Motivo informado.";

        // Anti-abuse checks (max open tickets and cooldown)
        const antiPath = "./db/antiabuso.json";
        const antiData = readJson(antiPath) || {};
        if (!antiData[interaction.guild.id]) antiData[interaction.guild.id] = { users: {}, settings: { maxOpen: 2, cooldownMs: 5 * 60 * 1000 } };
        const guildAnti = antiData[interaction.guild.id];

        // count open tickets by searching channels with user id in name
        const openCount = interaction.guild.channels.cache.filter(c => c.name && c.name.includes(`・${interaction.user.id}`)).size;
        const userAnti = guildAnti.users[interaction.user.id] || { lastOpened: 0, lastTicket: null };

        const now = Date.now();
        if (openCount >= (guildAnti.settings.maxOpen || 2)) {
            return interaction.reply({ content: `❌ | Você já possui ${openCount} tickets abertos. Limite: ${guildAnti.settings.maxOpen}`, ephemeral: true });
        }
        if (now - (userAnti.lastOpened || 0) < (guildAnti.settings.cooldownMs || 5 * 60 * 1000)) {
            const wait = Math.ceil(((userAnti.lastOpened || 0) + (guildAnti.settings.cooldownMs || 5 * 60 * 1000) - now) / 1000);
            return interaction.reply({ content: `⏳ | Aguarde ${wait} segundos antes de abrir outro ticket.`, ephemeral: true });
        }

        await interaction.reply({content:`🔁 | Aguarde um momento estou Criando seu ticket...`, ephemeral:true});

        if(botconfigk.topic) {
            const asd = interaction.channel.threads.cache.find(x => x.name === `🎫・${interaction.user.username}・${interaction.user.id}`);
            if(asd) {
                        await interaction.editReply({
                            content:`❌ | Você já tem um ticket aberto!`, 
                            components:[
                                new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                    .setURL(asd.url)
                                    .setEmoji("<:hyperapps45:1218985928652099594>")
                                    .setLabel("Ir ao Ticket")
                                    .setStyle(5)
                                )
                            ],
                            ephemeral:true
                        });
                        return;
            }
            await interaction.channel.threads.create({
                name:`🎫・${interaction.user.username}・${interaction.user.id}`,
                autoArchiveDuration: 60,
                type: ChannelType.PrivateThread,
                reason: `Ticket do ${interaction.user.username}`,
            }).then(async(channel) => {
                const aes = await config.get("dentro");
                const embed = new EmbedBuilder().setTitle(`${aes.title}`).setColor(aes.cor);
                // Prioridade por cargo
                try {
                    const priPath = "./db/prioridade.json";
                    const priData = readJson(priPath) || {};
                    const guildPri = priData[interaction.guild.id] || { roles: {} };
                    // find member roles that match
                    const memberRoles = interaction.member.roles.cache.map(r => r.id);
                    const priorityOrder = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
                    let chosen = null;
                    for (const roleId of memberRoles) {
                        if (guildPri.roles && guildPri.roles[roleId]) {
                            const info = guildPri.roles[roleId];
                            if (!chosen || (priorityOrder[info.prioridade] || 0) > (priorityOrder[chosen.prioridade] || 0)) {
                                chosen = info;
                                chosen._roleId = roleId;
                            }
                        }
                    }
                    if (chosen) {
                        // include priority in title
                        const prioLabel = chosen.prioridade || "Normal";
                        embed.setTitle(`[${prioLabel}] ${aes.title}`);
                        if (chosen.cor) embed.setColor(chosen.cor);
                        // mention staff role in first message later
                    } else {
                        // default
                        embed.setTitle(`[Normal] ${aes.title}`);
                        embed.setColor(aes.cor || '#5865F2');
                    }
                } catch (e) {
                    console.error('Erro ao aplicar prioridade:', e);
                }
                let title = aes.title;
                title = title.replace("${interaction.guild.name}", interaction.guild.name); 
                embed.setTitle(`${title}`)
                let desc = aes.desc;
                const opcoesData = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
                const opcoesHora = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' };
                const dataFormatada = interaction.createdAt.toLocaleDateString('pt-BR', opcoesData);
                const horarioFormatado = interaction.createdAt.toLocaleTimeString('pt-BR', opcoesHora);
                desc = desc.replace(/#{user}/g, `${interaction.user}`);
                desc = desc.replace(/#{userid}/g, `${interaction.user.id}`);
                desc = desc.replace(/#{data}/g, `${dataFormatada} | ${horarioFormatado}`);
                desc = desc.replace(/#{assumido}/g, "Não foi Assumido");
                desc = desc.replace(/#{motivo}/g, motivo);
                embed.setDescription(`${desc}`);
                if(aes.footer !== "remover")embed.setFooter({text:`${aes.footer}`});
                if(aes.banner.startsWith("https://")) embed.setImage(aes.banner);
    
                const kkkk = await config.get("button");
    
                const row = new ActionRowBuilder();
                if(!kkkk.sair.ativado && !kkkk.membro.ativado && !kkkk.staff.ativado && !kkkk.fechar.ativado) {
                    row.addComponents(
                        new ButtonBuilder()
                        .setCustomId("fecharticket")
                        .setLabel(`${kkkk.fechar.label}`)
                        .setStyle(kkkk.fechar.style)
                        .setEmoji(kkkk.fechar.emoji)
                    );
                } else {
                    if(kkkk.sair.ativado) {
                        row.addComponents(
                            new ButtonBuilder()
                            .setCustomId("sairticket")
                            .setLabel(`${kkkk.sair.label}`)
                            .setStyle(kkkk.sair.style)
                            .setEmoji(kkkk.sair.emoji)
                            )
                    }
                    if(kkkk.membro.ativado) {
                        row.addComponents(
                            new ButtonBuilder()
                            .setCustomId("painelmember")
                            .setLabel(`${kkkk.membro.label}`)
                            .setStyle(kkkk.membro.style)
                            .setEmoji(kkkk.membro.emoji)
                            )
                    }
                    if(kkkk.staff.ativado) {
                        row.addComponents(
                            new ButtonBuilder()
                            .setCustomId("painelstaff")
                            .setLabel(`${kkkk.staff.label}`)
                            .setStyle(kkkk.staff.style)
                            .setEmoji(kkkk.staff.emoji)
                            )
                    }
                    if(kkkk.fechar.ativado) {
                        row.addComponents(
                            new ButtonBuilder()
                            .setCustomId("fecharticket")
                            .setLabel(`${kkkk.fechar.label}`)
                            .setStyle(kkkk.fechar.style)
                            .setEmoji(kkkk.fechar.emoji)
                        );
                    }
                }
                let msg = `${interaction.user}`;
                const olr = interaction.guild.roles.cache.get(await config.get("cargo_staff"));
                if(olr && botconfigk.systemsendmsg) {
                    msg += ` / ${olr}`;
                }
                const members = interaction.guild.members.cache.filter(member => member.roles.cache.has(olr.id));
                members.map(async(rs) => {
                    await channel.members.add(rs.id);
                });
                await channel.members.add(interaction.user.id);
    
                const aasdsad = await channel.send({
                    content:`${msg}`,
                    embeds:[embed],
                    components:[row]
                }).then((msg) => {
                    interaction.editReply({
                        content:`✅ | Seu Ticket foi criado com sucesso!`,
                        components:[
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setLabel("Ir ao Ticket")
                                .setStyle(5)
                                .setEmoji("<:hyperapps45:1218985928652099594>")
                                .setURL(channel.url)
                            )
                        ]
                    });
                    msg.pin();
                    db.set(`${channel.id}`, {
                        owner: interaction.user.id,
                        data:`${dataFormatada} | ${horarioFormatado}`,
                        assumido:"não foi assumido",
                        msg: msg.id,
                        motivo
                    });
                    // update anti-abuse last opened
                    userAnti.lastOpened = Date.now();
                    userAnti.lastTicket = channel.id;
                    guildAnti.users[interaction.user.id] = userAnti;
                    antiData[interaction.guild.id] = guildAnti;
                    writeJson(antiPath, antiData);
                    // reputacao: +5 por abrir ticket
                    try {
                        const repPath = './db/reputacao.json';
                        const rep = readJson(repPath) || {};
                        if (!rep[interaction.guild.id]) rep[interaction.guild.id] = {};
                        if (!rep[interaction.guild.id][interaction.user.id]) rep[interaction.guild.id][interaction.user.id] = { pontos: 0, nivel: 0 };
                        rep[interaction.guild.id][interaction.user.id].pontos += 5;
                        rep[interaction.guild.id][interaction.user.id].nivel = Math.floor(rep[interaction.guild.id][interaction.user.id].pontos / 100);
                        writeJson(repPath, rep);
                    } catch (e) { console.error('rep add error', e); }
                    // auto-delete empty ticket after 10 minutes if nobody else replied
                    setTimeout(async () => {
                        try {
                            const fetched = await channel.messages.fetch({ limit: 10 });
                            // if only the bot message and maybe owner initial, consider empty
                            if (fetched.size <= 1) {
                                await channel.delete().catch(() => {});
                                // update antiabuso to remove lastTicket
                                const anti = readJson(antiPath) || {};
                                if (anti[interaction.guild.id] && anti[interaction.guild.id].users && anti[interaction.guild.id].users[interaction.user.id]) {
                                    if (anti[interaction.guild.id].users[interaction.user.id].lastTicket === channel.id) {
                                        anti[interaction.guild.id].users[interaction.user.id].lastTicket = null;
                                    }
                                    writeJson(antiPath, anti);
                                }
                            }
                        } catch (err) {
                            // ignore
                        }
                    }, 10 * 60 * 1000);
                });
                perfil.add(`${interaction.user.id}.ticketsaberto`, 1);
                const logs = interaction.guild.channels.cache.get(await config.get("channel_logs"));
                if(logs) {
                    let desc = await config.get("mensagem.logs_admin");
                    const opcoesData = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
                    const opcoesHora = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' };
                    const dataFormatada = interaction.createdAt.toLocaleDateString('pt-BR', opcoesData);
                    const horarioFormatado = interaction.createdAt.toLocaleTimeString('pt-BR', opcoesHora);
                    desc = desc.replace(/#{user}/g, `${interaction.user}`);
                    desc = desc.replace(/#{userid}/g, `${interaction.user.id}`);
                    desc = desc.replace(/#{data}/g, `${dataFormatada} | ${horarioFormatado}`);
                    desc = desc.replace(/#{staff}/g, "");
                    desc = desc.replace(/#{ticket}/g, channel.url);
                    desc = desc.replace(/#{assumido}/g, "`Ticket não foi assumido`");
                    logs.send({
                        embeds:[
                            new EmbedBuilder()
                            .setTitle(`${interaction.guild.name} | Novo Ticket`)
                            .setDescription(`${desc}`)
                            .setColor(colorEmbed)
                        ],
                        components:[
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setURL(channel.url)
                                .setLabel("TICKET")
                                .setStyle(5)
                                .setEmoji("<:hyperapps45:1218985928652099594>")
                            )
                        ]
                    })
    
                }
            }).catch(() => {
                interaction.editReply({
                    content:`❌ **| O Dono deste ticket não configurou o carrinho corretamente.**`,
                    ephemeral: true
                });
            });
        } else {
            const channel = await interaction.guild.channels.cache.find(ticket => ticket.topic === `ticket - ${interaction.user.id}`);
            if(channel) {
                        await interaction.editReply({
                            content:`❌ | Você já tem um ticket aberto!`, 
                            components:[
                                new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                    .setURL(channel.url)
                                    .setEmoji("<:hyperapps45:1218985928652099594>")
                                    .setLabel("Ir ao Ticket")
                                    .setStyle(5)
                                )
                            ],
                            ephemeral:true
                        });
                        return;
            }
            
            const permissionOverwrites = [
                {
                    id: interaction.user.id,
                    allow:["ViewChannel", "SendMessages"],
                },
                {
                    id:interaction.guild.id,
                    deny:["ViewChannel", "SendMessages"]
             
                },
                {
                    id: process.env.OWNER_ID,
                    allow:["ViewChannel", "SendMessages", PermissionFlagsBits.ManageMessages],
                }
            ];
            const olr = interaction.guild.roles.cache.get(await config.get("cargo_staff"));
            if(olr) {
                permissionOverwrites.push({
                    id: olr.id,
                    allow:["ViewChannel", "SendMessages", PermissionFlagsBits.ManageMessages],
                })
            }
    
            const catsd = interaction.guild.channels.cache.get(await config.get("botconfig.category"))?.id ?? interaction.channel.parent;
            await interaction.guild.channels.create({
                name:`🎫・${interaction.user.username}`,
                topic:`ticket - ${interaction.user.id}`,
                parent: catsd,
                type: ChannelType.GuildText,
                permissionOverwrites: permissionOverwrites 
            }).then(async(channel) => {
                const aes = await config.get("dentro");
                const embed = new EmbedBuilder().setTitle(`${aes.title}`).setColor(aes.cor);
                let title = aes.title;
                title = title.replace("${interaction.guild.name}", interaction.guild.name); 
                embed.setTitle(`${title}`)
                let desc = aes.desc;
                const opcoesData = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
                const opcoesHora = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' };
                const dataFormatada = interaction.createdAt.toLocaleDateString('pt-BR', opcoesData);
                const horarioFormatado = interaction.createdAt.toLocaleTimeString('pt-BR', opcoesHora);
                desc = desc.replace(/#{user}/g, `${interaction.user}`);
                desc = desc.replace(/#{userid}/g, `${interaction.user.id}`);
                desc = desc.replace(/#{data}/g, `${dataFormatada} | ${horarioFormatado}`);
                desc = desc.replace(/#{assumido}/g, "Não foi Assumido");
                desc = desc.replace(/#{motivo}/g, motivo);
                embed.setDescription(`${desc}`);
                if(aes.footer !== "remover")embed.setFooter({text:`${aes.footer}`});
                if(aes.banner.startsWith("https://")) embed.setImage(aes.banner);
    
                const kkkk = await config.get("button");
    
                const row = new ActionRowBuilder();
                if(!kkkk.sair.ativado && !kkkk.membro.ativado && !kkkk.staff.ativado && !kkkk.fechar.ativado) {
                    row.addComponents(
                        new ButtonBuilder()
                        .setCustomId("fecharticket")
                        .setLabel(`${kkkk.fechar.label}`)
                        .setStyle(kkkk.fechar.style)
                        .setEmoji(kkkk.fechar.emoji)
                    );
                } else {
                    if(kkkk.sair.ativado) {
                        row.addComponents(
                            new ButtonBuilder()
                            .setCustomId("sairticket")
                            .setLabel(`${kkkk.sair.label}`)
                            .setStyle(kkkk.sair.style)
                            .setEmoji(kkkk.sair.emoji)
                            )
                    }
                    if(kkkk.membro.ativado) {
                        row.addComponents(
                            new ButtonBuilder()
                            .setCustomId("painelmember")
                            .setLabel(`${kkkk.membro.label}`)
                            .setStyle(kkkk.membro.style)
                            .setEmoji(kkkk.membro.emoji)
                            )
                    }
                    if(kkkk.staff.ativado) {
                        row.addComponents(
                            new ButtonBuilder()
                            .setCustomId("painelstaff")
                            .setLabel(`${kkkk.staff.label}`)
                            .setStyle(kkkk.staff.style)
                            .setEmoji(kkkk.staff.emoji)
                            )
                    }
                    if(kkkk.fechar.ativado) {
                        row.addComponents(
                            new ButtonBuilder()
                            .setCustomId("fecharticket")
                            .setLabel(`${kkkk.fechar.label}`)
                            .setStyle(kkkk.fechar.style)
                            .setEmoji(kkkk.fechar.emoji)
                        );
                    }
                }
                let msg = `${interaction.user}`;
                const olr = interaction.guild.roles.cache.get(await config.get("cargo_staff"));
                if(olr && botconfigk.systemsendmsg) msg += ` / ${olr}`;
                
    
                const aasdsad = await channel.send({
                    content:`${msg}`,
                    embeds:[embed],
                    components:[row]
                }).then((msg) => {
                    interaction.editReply({
                        content:`✅ | Seu Ticket foi criado com sucesso!`,
                        components:[
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setLabel("Ir ao Ticket")
                                .setStyle(5)
                                .setEmoji("<:hyperapps45:1218985928652099594>")
                                .setURL(channel.url)
                            )
                        ]
                    });
                    msg.pin();
                    db.set(`${channel.id}`, {
                        owner: interaction.user.id,
                        data:`${dataFormatada} | ${horarioFormatado}`,
                        assumido:"não foi assumido",
                        msg: msg.id,
                        motivo
                    });
                });
                perfil.add(`${interaction.user.id}.ticketsaberto`, 1);
                const logs = interaction.guild.channels.cache.get(await config.get("channel_logs"));
                if(logs) {
                    let desc = await config.get("mensagem.logs_admin");
                    const opcoesData = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
                    const opcoesHora = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' };
                    const dataFormatada = interaction.createdAt.toLocaleDateString('pt-BR', opcoesData);
                    const horarioFormatado = interaction.createdAt.toLocaleTimeString('pt-BR', opcoesHora);
                    desc = desc.replace(/#{user}/g, `${interaction.user}`);
                    desc = desc.replace(/#{userid}/g, `${interaction.user.id}`);
                    desc = desc.replace(/#{data}/g, `${dataFormatada} | ${horarioFormatado}`);
                    desc = desc.replace(/#{staff}/g, "");
                    desc = desc.replace(/#{ticket}/g, channel.url);
                    desc = desc.replace(/#{assumido}/g, "`Ticket não foi assumido`");
                    logs.send({
                        embeds:[
                            new EmbedBuilder()
                            .setTitle(`${interaction.guild.name} | Novo Ticket`)
                            .setDescription(`${desc}`)
                            .setColor(colorEmbed)
                        ],
                        components:[
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setURL(channel.url)
                                .setLabel("TICKET")
                                .setStyle(5)
                                .setEmoji("<:hyperapps45:1218985928652099594>")
                            )
                        ]
                    })
    
                }
            }).catch(() => {
                interaction.editReply({
                    content:`❌ **| O Dono deste ticket não configurou o carrinho corretamente.**`,
                    ephemeral: true
                });
            });
        }
    }
    if(customId === "ticketslakkk") { 
        const id = interaction.values[0];
        await interaction.reply({content:`🔁 | Aguarde um momento estou Criando seu ticket...`, ephemeral:true});
        const all = await ct.all();
        const a = await config.get("painel");
        const embed = new EmbedBuilder().setTitle(`${a.title}`).setFooter({text:`${a.footer}`}).setColor(a.cor);
        let desc = a.desc;
        desc = desc.replace("${interaction.guild.name}", interaction.guild.name);
        embed.setDescription(`${desc}`);
        if(a.banner.startsWith("https://")) embed.setImage(a.banner);
        const select = new StringSelectMenuBuilder().setCustomId("ticketslakkk").setMaxValues(1).setPlaceholder(a.placeholder);
        all.map(async(rs) => {
            select.addOptions(
                {
                    label:`${rs.data.titulo}`,
                    description:`${rs.data.desc}`,
                    emoji: rs.data.emoji,
                    value: rs.ID
                }
            )
        });
        interaction.message.edit({
            embeds:[embed],
            components:[ 
                new ActionRowBuilder()
                .addComponents(select)
            ]
        });
        if(botconfigk.topic) {
            const asd = interaction.channel.threads.cache.find(x => x.name === `🎫・${interaction.user.username}・${interaction.user.id}`);
            if(asd) {
                        await interaction.editReply({
                            content:`❌ | Você já tem um ticket aberto!`, 
                            components:[
                                new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                    .setURL(asd.url)
                                    .setEmoji("<:hyperapps45:1218985928652099594>")
                                    .setLabel("Ir ao Ticket")
                                    .setStyle(5)
                                )
                            ],
                            ephemeral:true
                        });
                        return;
            }
            await interaction.channel.threads.create({
                name:`🎫・${interaction.user.username}・${interaction.user.id}`,
                autoArchiveDuration: 60,
                type: ChannelType.PrivateThread,
                reason: `Ticket do ${interaction.user.username}`,
            }).then(async(channel) => {
                const aes = await config.get("dentro");
                const embed = new EmbedBuilder().setTitle(`${aes.title}`).setColor(aes.cor);
                let title = aes.title; 
                title = title.replace("${interaction.guild.name}", interaction.guild.name);
                embed.setTitle(`${title}`)
                let desc = aes.desc;
                const opcoesData = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
                const opcoesHora = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' };
                const dataFormatada = interaction.createdAt.toLocaleDateString('pt-BR', opcoesData);
                const horarioFormatado = interaction.createdAt.toLocaleTimeString('pt-BR', opcoesHora);
                desc = desc.replace(/#{user}/g, `${interaction.user}`);
                desc = desc.replace(/#{userid}/g, `${interaction.user.id}`);
                desc = desc.replace(/#{data}/g, `${dataFormatada} | ${horarioFormatado}`);
                desc = desc.replace(/#{assumido}/g, "Não foi Assumido");
                embed.setDescription(`${desc}`);
                if(aes.footer !== "remover")embed.setFooter({text:`${aes.footer}`});
                if(aes.banner.startsWith("https://")) embed.setImage(aes.banner);
    
                const kkkk = await config.get("button");
    
                const row = new ActionRowBuilder();
                if(!kkkk.sair.ativado && !kkkk.membro.ativado && !kkkk.staff.ativado && !kkkk.fechar.ativado) {
                    row.addComponents(
                        new ButtonBuilder()
                        .setCustomId("fecharticket")
                        .setLabel(`${kkkk.fechar.label}`)
                        .setStyle(kkkk.fechar.style)
                        .setEmoji(kkkk.fechar.emoji)
                    );
                } else {
                    if(kkkk.sair.ativado) {
                        row.addComponents(
                            new ButtonBuilder()
                            .setCustomId("sairticket")
                            .setLabel(`${kkkk.sair.label}`)
                            .setStyle(kkkk.sair.style)
                            .setEmoji(kkkk.sair.emoji)
                            )
                    }
                    if(kkkk.membro.ativado) {
                        row.addComponents(
                            new ButtonBuilder()
                            .setCustomId("painelmember")
                            .setLabel(`${kkkk.membro.label}`)
                            .setStyle(kkkk.membro.style)
                            .setEmoji(kkkk.membro.emoji)
                            )
                    }
                    if(kkkk.staff.ativado) {
                        row.addComponents(
                            new ButtonBuilder()
                            .setCustomId("painelstaff")
                            .setLabel(`${kkkk.staff.label}`)
                            .setStyle(kkkk.staff.style)
                            .setEmoji(kkkk.staff.emoji)
                            )
                    }
                    if(kkkk.fechar.ativado) {
                        row.addComponents(
                            new ButtonBuilder()
                            .setCustomId("fecharticket")
                            .setLabel(`${kkkk.fechar.label}`)
                            .setStyle(kkkk.fechar.style)
                            .setEmoji(kkkk.fechar.emoji)
                        );
                    }
                }
                let msg = `${interaction.user}`; 
                const olr = interaction.guild.roles.cache.get(await config.get("cargo_staff"));
                if(olr && botconfigk.systemsendmsg) {
                    msg += ` / ${olr}`;
                }
                const members = interaction.guild.members.cache.filter(member => member.roles.cache.has(olr.id));
                members.map(async(rs) => {
                    await channel.members.add(rs.id);
                });
                
                await channel.members.add(interaction.user.id).catch(() => {});
                
    
                const aasdsad = await channel.send({
                    content:`${msg}`,
                    embeds:[embed],
                    components:[row]
                }).then((msg) => {
                    interaction.editReply({
                        content:`✅ | Seu Ticket foi criado com sucesso!`,
                        components:[
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setLabel("Ir ao Ticket")
                                .setStyle(5)
                                .setEmoji("<:hyperapps45:1218985928652099594>")
                                .setURL(channel.url)
                            )
                        ]
                    });
                    msg.pin();
                    db.set(`${channel.id}`, {
                        owner: interaction.user.id,
                        data:`${dataFormatada} | ${horarioFormatado}`,
                        assumido:"não foi assumido",
                        msg: msg.id
                    });
                });
                perfil.add(`${interaction.user.id}.ticketsaberto`, 1);
                const logs = interaction.guild.channels.cache.get(await config.get("channel_logs"));
                if(logs) {
                    let desc = await config.get("mensagem.logs_admin");
                    const opcoesData = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
                    const opcoesHora = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' };
                    const dataFormatada = interaction.createdAt.toLocaleDateString('pt-BR', opcoesData);
                    const horarioFormatado = interaction.createdAt.toLocaleTimeString('pt-BR', opcoesHora);
                    desc = desc.replace(/#{user}/g, `${interaction.user}`);
                    desc = desc.replace(/#{userid}/g, `${interaction.user.id}`);
                    desc = desc.replace(/#{data}/g, `${dataFormatada} | ${horarioFormatado}`);
                    desc = desc.replace(/#{staff}/g, "");
                    desc = desc.replace(/#{ticket}/g, channel.url);
                    desc = desc.replace(/#{assumido}/g, "`Ticket não foi assumido`");
                    logs.send({
                        embeds:[
                            new EmbedBuilder()
                            .setTitle(`${interaction.guild.name} | Novo Ticket`)
                            .setDescription(`${desc}`)
                            .setColor(colorEmbed)
                        ],
                        components:[
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setURL(channel.url)
                                .setLabel("TICKET")
                                .setStyle(5)
                                .setEmoji("<:hyperapps45:1218985928652099594>")
                            )
                        ]
                    })
    
                } 
            }).catch(() => {
                interaction.editReply({
                    content:`❌ **| O Dono deste ticket não configurou corretamente.**`
                });
            });
        } else {
        const channel = await interaction.guild.channels.cache.find(ticket => ticket.topic === `ticket - ${interaction.user.id}`);
        if(channel) {
                    await interaction.editReply({
                        content:`❌ | Você já tem um ticket aberto!`, 
                        components:[
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setURL(channel.url)
                                .setEmoji("<:hyperapps45:1218985928652099594>")
                                .setLabel("Ir ao Ticket")
                                .setStyle(5)
                            )
                        ],
                        ephemeral:true
                    });
                    return;
        }
        
        const permissionOverwrites = [
            {
                id: interaction.user.id,
                allow:["ViewChannel", "SendMessages"],
            },
            {
                id:interaction.guild.id,
                deny:["ViewChannel", "SendMessages"]
         
            },
            {
                id: process.env.OWNER_ID,
                allow:["ViewChannel", "SendMessages", PermissionFlagsBits.ManageMessages],
            },
            {
                id: interaction.client.user.id,
                allow:["ViewChannel", "SendMessages", PermissionFlagsBits.ManageMessages],
            }
        ];
        const olr = interaction.guild.roles.cache.get(await config.get("cargo_staff"));
        if(olr) {
            permissionOverwrites.push({
                id: olr.id,
                allow:["ViewChannel", "SendMessages", PermissionFlagsBits.ManageMessages],
            })
        }
        const catsd = interaction.guild.channels.cache.get(await config.get("botconfig.category"))?.id ?? interaction.channel.parent;
        await interaction.guild.channels.create({
            name:`🎫・${interaction.user.username}`,
            topic:`ticket - ${interaction.user.id}`,
            parent: catsd,
            type: ChannelType.GuildText, 
            permissionOverwrites: permissionOverwrites
        }).then(async(channel) => {
            const aes = await config.get("dentro");
            const embed = new EmbedBuilder().setTitle(`${aes.title}`).setColor(aes.cor);
            let title = aes.title; 
            title = title.replace("${interaction.guild.name}", interaction.guild.name);
            embed.setTitle(`${title}`)
            let desc = aes.desc;
            const opcoesData = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
            const opcoesHora = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' };
            const dataFormatada = interaction.createdAt.toLocaleDateString('pt-BR', opcoesData);
            const horarioFormatado = interaction.createdAt.toLocaleTimeString('pt-BR', opcoesHora);
            desc = desc.replace(/#{user}/g, `${interaction.user}`);
            desc = desc.replace(/#{userid}/g, `${interaction.user.id}`);
            desc = desc.replace(/#{data}/g, `${dataFormatada} | ${horarioFormatado}`);
            desc = desc.replace(/#{assumido}/g, "Não foi Assumido");
            embed.setDescription(`${desc}`);
            if(aes.footer !== "remover")embed.setFooter({text:`${aes.footer}`});
            if(aes.banner.startsWith("https://")) embed.setImage(aes.banner);

            const kkkk = await config.get("button");

            const row = new ActionRowBuilder();
            if(!kkkk.sair.ativado && !kkkk.membro.ativado && !kkkk.staff.ativado && !kkkk.fechar.ativado) {
                row.addComponents(
                    new ButtonBuilder()
                    .setCustomId("fecharticket")
                    .setLabel(`${kkkk.fechar.label}`)
                    .setStyle(kkkk.fechar.style)
                    .setEmoji(kkkk.fechar.emoji)
                );
            } else {
                if(kkkk.sair.ativado) {
                    row.addComponents(
                        new ButtonBuilder()
                        .setCustomId("sairticket")
                        .setLabel(`${kkkk.sair.label}`)
                        .setStyle(kkkk.sair.style)
                        .setEmoji(kkkk.sair.emoji)
                        )
                }
                if(kkkk.membro.ativado) {
                    row.addComponents(
                        new ButtonBuilder()
                        .setCustomId("painelmember")
                        .setLabel(`${kkkk.membro.label}`)
                        .setStyle(kkkk.membro.style)
                        .setEmoji(kkkk.membro.emoji)
                        )
                }
                if(kkkk.staff.ativado) {
                    row.addComponents(
                        new ButtonBuilder()
                        .setCustomId("painelstaff")
                        .setLabel(`${kkkk.staff.label}`)
                        .setStyle(kkkk.staff.style)
                        .setEmoji(kkkk.staff.emoji)
                        )
                }
                if(kkkk.fechar.ativado) {
                    row.addComponents(
                        new ButtonBuilder()
                        .setCustomId("fecharticket")
                        .setLabel(`${kkkk.fechar.label}`)
                        .setStyle(kkkk.fechar.style)
                        .setEmoji(kkkk.fechar.emoji)
                    );
                }
            }
            let msg = `${interaction.user}`;
            const olr = interaction.guild.roles.cache.get(await config.get("cargo_staff"));
            if(olr && botconfigk.systemsendmsg) msg += ` / ${olr}`;
            

            const aasdsad = await channel.send({
                content:`${msg}`,
                embeds:[embed],
                components:[row]
            }).then((msg) => {
                interaction.editReply({
                    content:`✅ | Seu Ticket foi criado com sucesso!`,
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setLabel("Ir ao Ticket")
                            .setStyle(5)
                            .setEmoji("<:hyperapps45:1218985928652099594>")
                            .setURL(channel.url)
                        )
                    ]
                });
                msg.pin();
                db.set(`${channel.id}`, {
                    owner: interaction.user.id,
                    data:`${dataFormatada} | ${horarioFormatado}`,
                    assumido:"não foi assumido",
                    msg: msg.id
                });
            });
            perfil.add(`${interaction.user.id}.ticketsaberto`, 1);
            const logs = interaction.guild.channels.cache.get(await config.get("channel_logs"));
            if(logs) {
                let desc = await config.get("mensagem.logs_admin");
                const opcoesData = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
                const opcoesHora = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' };
                const dataFormatada = interaction.createdAt.toLocaleDateString('pt-BR', opcoesData);
                const horarioFormatado = interaction.createdAt.toLocaleTimeString('pt-BR', opcoesHora);
                desc = desc.replace(/#{user}/g, `${interaction.user}`);
                desc = desc.replace(/#{userid}/g, `${interaction.user.id}`);
                desc = desc.replace(/#{data}/g, `${dataFormatada} | ${horarioFormatado}`);
                desc = desc.replace(/#{staff}/g, "");
                desc = desc.replace(/#{ticket}/g, channel.url);
                desc = desc.replace(/#{assumido}/g, "`Ticket não foi assumido`");
                logs.send({
                    embeds:[
                        new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Novo Ticket`)
                        .setDescription(`${desc}`)
                        .setColor(colorEmbed)
                    ],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setURL(channel.url)
                            .setLabel("TICKET")
                            .setStyle(5)
                            .setEmoji("<:hyperapps45:1218985928652099594>")
                        )
                    ]
                })

            } 
        }).catch(() => {
            interaction.editReply({
                content:`❌ **| O Dono deste ticket não configurou corretamente.**`
            });
        });
        }
    }
    if(customId === "fecharticket") {
        if (!interaction.member.roles.cache.has(await config.get("cargo_staff")) && interaction.user.id !== process.env.OWNER_ID) return interaction.deferUpdate();
        const modal = new ModalBuilder()
        .setCustomId("fecharticket_modal")
        .setTitle("Fechamento do Ticket");

        const text = new TextInputBuilder()
        .setCustomId("text")
        .setStyle(1)
        .setLabel("qual motivo do fechamento?")
        .setRequired(false)
        .setPlaceholder("(NÃO É OBRIGATÓRIO)")
        .setMaxLength(200);

        modal.addComponents(new ActionRowBuilder().addComponents(text));

        return interaction.showModal(modal);
    }
    if(customId === "fecharticket_modal") {
        if (!interaction.member.roles.cache.has(await config.get("cargo_staff")) && interaction.user.id !== process.env.OWNER_ID) return interaction.deferUpdate();
        const text = interaction.fields.getTextInputValue("text") || "`Não Informado`";
        const mas = await interaction.reply({content:`🔔 | Esse Ticket será Finalizado em 5 segundos...`});
        const channel = interaction.channel;
        const components = [];
        
        const attachment = await createTranscript(channel);
        await fs.writeFileSync(`${channel.id}.html`, attachment.attachment.toString());
        const formData = new FormData();
        formData.append("html", `${attachment.attachment.toString()}`);
        formData.append("id", `${interaction.channel.id}`); 
        const headers = {
            ...formData.getHeaders(),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        };

        const response = await axios.post("https://hyperapi.squareweb.app/api/upload", formData, {
            headers
        }).catch(() => null);

        if (response) {
            components.push(
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setURL(`${response.data.data.viewer}`)
                    .setLabel("Transcript")
                    .setEmoji("<a:hyperapps60:1236240247998906368>")
                    .setStyle(5)
                )
            );
        }
        
        setTimeout(async() => { 
            return interaction.channel.delete();
        }, 5000);
        try {
            
            const logs = interaction.client.channels.cache.get(await config.get("channel_logs"));
            const t = await db.get(`${interaction.channel.id}`);
            const owner = interaction.client.users.cache.get(t.owner) || "`Usuário saiu do servidor`";
            const assumed = interaction.client.users.cache.get(t.assumido) || "Ninguém assumiu";
            
            if(logs) {
                let desc = await config.get("mensagem.logs_admin"); 
                desc = desc.replace(/#{user}/g, `${owner}`);
                desc = desc.replace(/#{userid}/g, `${t.owner}`);
                desc = desc.replace(/#{data}/g, `${t.data}`);
                desc = desc.replace(/#{staff}/g, `${interaction.user}`);
                desc = desc.replace(/#{ticket}/g, interaction.channel.id);
                desc = desc.replace(/#{assumido}/g, `${assumed}`);
                let c = [];
                if(await config.get("transcript.sistema")) {
                    c = components;
                }
                

                logs.send({
                    embeds:[
                        new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Ticket Deletado`)
                        .setDescription(`${desc}`)
                        .setTimestamp()
                        .setFields({
                            name:"📕・Motivo do Fechamento:",
                            value:`**${text}**`
                        })
                        .setColor(colorEmbed)
                    ],
                    components: c
                })
            }
            if(owner) {
                let c = [];
                if(await config.get("transcript.Usuário")) {
                    c = components;
                }
                let desc = await config.get("mensagem.logs_member");
                desc = desc.replace(/#{user}/g, `${owner}`);
                desc = desc.replace(/#{userid}/g, `${t.owner}`);
                desc = desc.replace(/#{data}/g, `${t.data}`);
                desc = desc.replace(/#{staff}/g, `${interaction.user}`);
                desc = desc.replace(/#{ticket}/g, interaction.channel.id);
                desc = desc.replace(/#{assumido}/g, `${assumed}`);
                owner?.send({
                    embeds:[
                        new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Ticket Finalizado`)
                        .setDescription(`${desc}`)
                        .setTimestamp()
                        .setColor(colorEmbed)
                        .setFields({
                            name:"📕・Motivo do Fechamento:",
                            value:`**${text}**`
                        })
                    ],
                    components: c
                }).catch(() => {});
                if(await config.get("botconfig.systemavaliation")) owner?.send({
                    embeds: [
                        new EmbedBuilder()
                        .setDescription("Por favor, avalie o nosso atendimento em geral. Sua opinião é importante!")
                        .setFooter({text:`Agradecemos por escolher nossos serviços. Obrigado!`, iconURL: interaction.guild.iconURL()})
                        .setColor("Green")
                    ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents( 
                            new StringSelectMenuBuilder()
                            .setCustomId(`${interaction.channel.id}_avaliarticket`)
                            .setPlaceholder("Avaliar o Atendimento")
                            .addOptions(
                                {
                                    label:"Péssimo",
                                    value:"1",
                                    emoji:"😞"
                                }, 
                                {
                                    label:"Ruim",
                                    emoji:"😔",
                                    value:"2"
                                },
                                {
                                    label:"Regular",
                                    emoji:"😐",
                                    value:"3"
                                },
                                {
                                    label:"Bom",
                                    emoji:"😊",
                                    value:"4"
                                },
                                {
                                    label:"Excelente",
                                    value:"5",
                                    emoji: "😊"
                                }
                            )
                        )
                    ]
                }).catch(() => {});
            }
            
            try {
                await fs.unlinkSync(`${interaction.channel.id}.html`);
                
              } catch (err) {
                
              }
        } catch(err) {
			console.log(err);
        }
    }
    if(customId.endsWith("_avaliarticket")) {
        const id = customId.split("_")[0];
        const k = interaction.values[0];
        const modal = new ModalBuilder()
        .setCustomId(`${id}_${k}_avaliarticketmodal`)
        .setTitle(`⭐ | Transformar Serviço (${k}/5)`);

        const text  = new TextInputBuilder()
        .setCustomId("text")
        .setStyle(1)
        .setLabel("Deixe um breve comentário:")
        .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(text));
        return interaction.showModal(modal);
    }
    if(customId.endsWith("_avaliarticketmodal")) {
        const id = customId.split("_")[0];
        const k = customId.split("_")[1];
        interaction.update({
            content:`😀 Obrigado por Avaliar, espero que tenha tido um otimo atendimento!`,
            embeds:[],
            components:[]
        });
        const avaliation = interaction.client.channels.cache.get(await config.get("channel_ava"));
        const t = await db.get(`${id}`);
        const assumed = interaction.client.users.cache.get(t.assumido);
        let estrelas = "";
        let emoji = "";
        if(k == "1") {
            emoji = "😞";
            estrelas = "⭐";
        } else if(k === "2") {
            emoji = "😔";
            estrelas = "⭐⭐";
        } else if(k === "3") {
            emoji = "😐";
            estrelas = "⭐⭐⭐";
        } else if(k === "4") {
            emoji = "😊";
            estrelas = "⭐⭐⭐⭐";
        } else {
            emoji = "😊";
            estrelas = "⭐⭐⭐⭐⭐";
        }
        if(avaliation) {
            avaliation.send({
                content:`${interaction.user}`,
                embeds:[
                    new EmbedBuilder()
                    .setTitle("❤️ | Nova Avaliação")
                    .addFields(
                        {
                            name:"👥 | Avaliação Enviada Por:",
                            value:`\`${interaction.user.username} - ${interaction.user.id}\``,
                        },
                        {
                            name:"💼 | Responsável pelo atendimento:",
                            value:`${assumed ? `\`${assumed.username} - ${assumed.id}\`` : "`Ninguém assumiu o Ticket`"}`
                        },
                        {
                            name:`${emoji} | Nota:`,
                            value:`${estrelas} (${k}/5)`
                        },
                        {
                            name:"🌟 | Avaliação",
                            value:`${interaction.fields.getTextInputValue("text")}`
                        },
                        {
                            name:"🕒 | Data / Horário:",
                            value:`<t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date() / 1000)}:R>)`
                        }
                    )
                ]
            });
        }

        // Salvar avaliação e atualizar estatísticas e reputação
        try {
            const avalPath = './db/avaliacoes.json';
            const avalData = readJson(avalPath) || {};
            const guildId = interaction.guild.id;
            if (!avalData[guildId]) avalData[guildId] = {};
            const staffId = (assumed && assumed.id) ? assumed.id : null;
            if (staffId) {
                if (!avalData[guildId][staffId]) avalData[guildId][staffId] = { total: 0, soma: 0, media: 0 };
                avalData[guildId][staffId].total += 1;
                avalData[guildId][staffId].soma += parseInt(k, 10);
                avalData[guildId][staffId].media = +(avalData[guildId][staffId].soma / avalData[guildId][staffId].total).toFixed(2);
                writeJson(avalPath, avalData);
            }
            // reputacao: +3 para o usuário que avaliou
            const repPath = './db/reputacao.json';
            const rep = readJson(repPath) || {};
            if (!rep[guildId]) rep[guildId] = {};
            if (!rep[guildId][interaction.user.id]) rep[guildId][interaction.user.id] = { pontos: 0, nivel: 0 };
            rep[guildId][interaction.user.id].pontos += 3;
            rep[guildId][interaction.user.id].nivel = Math.floor(rep[guildId][interaction.user.id].pontos / 100);
            writeJson(repPath, rep);
        } catch (e) {
            console.error('Erro ao salvar avaliacao/reputacao:', e);
        }

    }
    if(customId === "painelstaff") {
        if (!interaction.member.roles.cache.has(await config.get("cargo_staff")) && interaction.user.id !== process.env.OWNER_ID) return interaction.deferUpdate();
        interaction.reply({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Painel Staff`)
                .setDescription(`👋 Olá ${interaction.user} Seja Bem-Vindo(a) ao painel de staff. Escolha o que você deseja gerenciar!`)
                .setColor(colorEmbed)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId("painelstaffselect")
                    .setMaxValues(1)
                    .setPlaceholder("Escolha qual opção você quer gerenciar")
                    .addOptions(
                        {
                            label:"Assumir Ticket",
                            description:"Assuma esse ticket!",
                            value:"assumir_ticket",
                            emoji:"<:hyperapps52:1219086937734910004>"
                        },
                        {
                            label:"Notificar Membro",
                            emoji:"<:hyperapps54:1219088734801100884>",
                            description:"Envie uma mensagem que notifica o Usuário",
                            value:"notify"
                        },
                        {
                            label:"Renomear Ticket",
                            description:"Renomeie o TICKET",
                            value:"renameticket",
                            emoji:"<:hyperapps46:1218989288071495811>"
                        },
                        {
                            label:"Criar Call",
                            description:"Crie um Canal de VOZ pro Ticket",
                            value:"create_call",
                            emoji:"<:hyperapps50:1219007103696637993>"
                        },
                        {
                            label:"Deletar Call",
                            description:"Delete a Call criada",
                            value:"delete_call",
                            emoji:"<:hyperapps50:1219007103696637993>"
                        },
                        {
                            label:"Adicionar Membro",
                            description:"Adicione um Usuário ao ticket",
                            value:"addmember",
                            emoji:"<:hyperapps43:1218977376172507227>"
                        },
                        {
                            label:"Remover Membro",
                            description:"Remova uma Usuário do ticket",
                            value:"removemember",
                            emoji:"<:hyperapps44:1218977445944758354>"
                        },
                    )
                )
            ],
            ephemeral:true
        });
    }
    if(customId === "painelstaffselect") {
        const id = interaction.values[0];
        const t = await db.get(`${interaction.channel.id}`);
        if(id === "assumir_ticket") {
            const assumed = interaction.client.users.cache.get(t.assumido);
            if(assumed) return interaction.reply({content:`⛔ | Ops... parece que um Staff Assumiu Primeiro...`, ephemeral:true});
            const i = interaction.client.users.cache.get(t.owner);
            if(i) {
                let desc = await config.get("mensagem.assumed");
                const opcoesData = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
                const opcoesHora = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' };
                const dataFormatada = interaction.createdAt.toLocaleDateString('pt-BR', opcoesData);
                const horarioFormatado = interaction.createdAt.toLocaleTimeString('pt-BR', opcoesHora);
                desc = desc.replace(/#{user}/g, `${interaction.user}`);
                desc = desc.replace(/#{userid}/g, `${interaction.user.id}`);
                desc = desc.replace(/#{data}/g, `${dataFormatada} | ${horarioFormatado}`);
                desc = desc.replace(/#{staff}/g, `${interaction.user}`);
                desc = desc.replace(/#{ticket}/g, interaction.channel.url);
                desc = desc.replace(/#{assumido}/g, `${interaction.user}`);

                i.send({
                    embeds:[
                        new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Ticket Assumido`)
                        .setDescription(`${desc}`)
                        .setColor(colorEmbed)
                    ],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setURL(interaction.channel.url)
                            .setLabel("TICKET")
                            .setStyle(5)
                            .setEmoji("<:hyperapps45:1218985928652099594>")
                        )
                    ]
                }).catch(() => {console.log("DM BLOQUEADA")})
            }
            const logs = interaction.client.channels.cache.get(await config.get("channel_logs"));
            if(logs) {
                let desc = await config.get("mensagem.ticket_assumed");
                const opcoesData = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
                const opcoesHora = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' };
                const dataFormatada = interaction.createdAt.toLocaleDateString('pt-BR', opcoesData);
                const horarioFormatado = interaction.createdAt.toLocaleTimeString('pt-BR', opcoesHora);
                desc = desc.replace(/#{user}/g, `${interaction.user}`);
                desc = desc.replace(/#{userid}/g, `${interaction.user.id}`);
                desc = desc.replace(/#{data}/g, `${dataFormatada} | ${horarioFormatado}`);
                desc = desc.replace(/#{staff}/g, `${interaction.user}`);
                desc = desc.replace(/#{ticket}/g, interaction.channel.url);
                desc = desc.replace(/#{assumido}/g, `${interaction.user}`);
                logs.send({
                    embeds:[
                        new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Ticket Assumido`)
                        .setDescription(`${desc}`)
                        .setColor(colorEmbed)
                    ],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setURL(interaction.channel.url)
                            .setLabel("TICKET")
                            .setStyle(5)
                            .setEmoji("<:hyperapps45:1218985928652099594>")
                        )
                    ]
                })
            }
            perfil.add(`${interaction.user.id}.assumidos`, 1);
            interaction.update({
                content:`✅ | Ticket Assumido com sucesso!`,
                components:[],
                embeds:[]
            });
            const message = await interaction.channel.messages.fetch(t.msg);
            if (message) {
                    const aes = await config.get("dentro");
            const embed = new EmbedBuilder().setTitle(`${aes.title}`).setColor(aes.cor);
            let title = aes.title;
            title = title.replace("${interaction.guild.name}", interaction.guild.name);
            embed.setTitle(`${title}`)
            let desc = aes.desc;
            const opcoesData = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
            const opcoesHora = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' };
            const dataFormatada = interaction.createdAt.toLocaleDateString('pt-BR', opcoesData);
            const horarioFormatado = interaction.createdAt.toLocaleTimeString('pt-BR', opcoesHora);
            desc = desc.replace(/#{user}/g, `<@${i.id}>`);
            desc = desc.replace(/#{userid}/g, `${i.id}`);
            desc = desc.replace(/#{data}/g, `${t.data}`);
            desc = desc.replace(/#{assumido}/g, `${interaction.user}`);
            if(t.motivo) desc = desc.replace(/#{motivo}/g, `${t.motivo}`);
            

            embed.setDescription(`${desc}`);
            if(aes.footer !== "remover")embed.setFooter({text:`${aes.footer}`});
            if(aes.banner.startsWith("https://")) embed.setImage(aes.banner);

            const kkkk = await config.get("button");

            const row = new ActionRowBuilder();
            if(!kkkk.sair.ativado && !kkkk.membro.ativado && !kkkk.staff.ativado && !kkkk.fechar.ativado) {
                row.addComponents(
                    new ButtonBuilder()
                    .setCustomId("fecharticket")
                    .setLabel(`${kkkk.fechar.label}`)
                    .setStyle(kkkk.fechar.style)
                    .setEmoji(kkkk.fechar.emoji)
                );
            } else {
                if(kkkk.sair.ativado) {
                    row.addComponents(
                        new ButtonBuilder()
                        .setCustomId("sairticket")
                        .setLabel(`${kkkk.sair.label}`)
                        .setStyle(kkkk.sair.style)
                        .setEmoji(kkkk.sair.emoji)
                        )
                }
                if(kkkk.membro.ativado) {
                    row.addComponents(
                        new ButtonBuilder()
                        .setCustomId("painelmember")
                        .setLabel(`${kkkk.membro.label}`)
                        .setStyle(kkkk.membro.style)
                        .setEmoji(kkkk.membro.emoji)
                        )
                }
                if(kkkk.staff.ativado) {
                    row.addComponents(
                        new ButtonBuilder()
                        .setCustomId("painelstaff")
                        .setLabel(`${kkkk.staff.label}`)
                        .setStyle(kkkk.staff.style)
                        .setEmoji(kkkk.staff.emoji)
                        )
                }
                if(kkkk.fechar.ativado) {
                    row.addComponents(
                        new ButtonBuilder()
                        .setCustomId("fecharticket")
                        .setLabel(`${kkkk.fechar.label}`)
                        .setStyle(kkkk.fechar.style)
                        .setEmoji(kkkk.fechar.emoji)
                    );
                }
            }
                    setTimeout(() => {
                        message.edit({embeds:[embed],components:[row]}).catch(() => {
                            console.log("Mensagem não encontrada");
                        });
                    }, 1000); 
            }
            await db.set(`${interaction.channel.id}.assumido`, interaction.user.id);
        }
        if(id === "notify") {
            const user = interaction.client.users.cache.get(t.owner);
            if(!user) return interaction.reply({content:`⛔ | Parece que o Usuário não se encontra-se aqui`, ephemeral:true});
            await interaction.update({content:`🔁 | Aguarde um momento estou notificando o Usuário...`, components:[], embeds:[]});
            try {
                let desc = await config.get("mensagem.member");
                const opcoesData = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
                const opcoesHora = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' };
                const dataFormatada = interaction.createdAt.toLocaleDateString('pt-BR', opcoesData);
                const horarioFormatado = interaction.createdAt.toLocaleTimeString('pt-BR', opcoesHora);
                desc = desc.replace(/#{user}/g, `${interaction.user}`);
                desc = desc.replace(/#{userid}/g, `${interaction.user.id}`);
                desc = desc.replace(/#{data}/g, `${dataFormatada} | ${horarioFormatado}`);
                desc = desc.replace(/#{staff}/g, `${interaction.user}`);
                desc = desc.replace(/#{ticket}/g, interaction.channel.url);
                await user.send({
                    embeds:[
                        new EmbedBuilder()
                        .setDescription(`${desc}`)
                    ],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setStyle(5)
                            .setURL(interaction.channel.url)
                            .setEmoji("<:hyperapps45:1218985928652099594>")
                            .setLabel("TICKET")
                        )
                    ]
                }).then(() => {
                    interaction.editReply({content:`✅ | Membro Notificado com sucesso!`, ephemeral:true});
                }).catch(() => {
                    interaction.editReply({content:`❌ | Membro está com o Privado Bloqueado!`, ephemeral:true});
                })
            } catch(err) {
                interaction.editReply({content:`❌ | Ocorreu um erro ao tentar enviar mensagem para o Membro\nMensagem do Erro: \`\`\`${err.message}\`\`\``})
            }
        }
        if(id === "renameticket") {
            const modal = new ModalBuilder()
            .setCustomId("renamemodal")
            .setTitle("🔁 - Renomear o TICKET");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("qual será o novo nome?")
            .setStyle(1)
            .setMaxLength(55)
            .setRequired(true)
            .setValue(`${interaction.channel.name}`);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if(id === "delete_call") {
            const user = interaction.client.users.cache.get(t.owner)?.username || `${interaction.user.username}`;
            await interaction.update({content:`🔁 | Aguarde um momento, estou verificando se existe uma Call Criada...`, embeds:[], components:[]});
            const channel = await interaction.guild.channels.cache.find(a => a.name === `📞・${user}`);
            if(!channel) return interaction.editReply({content:`❌ | Não existe uma call!`});
            interaction.editReply({content:`🔁 | Call Encontrada... Deletando a Call!`});
            await channel.delete().then(() => {
                interaction.editReply({content:`✅ | Call Deletada com sucesso!`});
            })
           
        }
        if(id === "create_call") {
            const user = interaction.client.users.cache.get(t.owner)?.username || `${interaction.user.username}`;
            await interaction.update({content:`🔁 | Aguarde um momento, estou verificando se existe uma Call Criada...`, embeds:[], components:[]});
            const channel = await interaction.guild.channels.cache.find(a => a.name === `📞・${user}`);
            if(channel) return interaction.editReply({content:`❌ | Já existe uma call!\n❔ | Localização da Call: ${channel.url}`});
            interaction.editReply({content:`🔁 | Nenhuma Call Criada... Criando Sua Call!`});
            const permissionOverwrites = [
                {
                    id: interaction.user.id,
                    allow:["ViewChannel", "SendMessages"],
                },
                {
                    id:interaction.guild.id,
                    deny:["ViewChannel", "SendMessages"]
             
                },
                {
                    id: token.owner,
                    allow:["ViewChannel", "SendMessages", PermissionFlagsBits.ManageMessages],
                },
                {
                    id: interaction.client.user.id,
                    allow:["ViewChannel", "SendMessages", PermissionFlagsBits.ManageMessages],
                }
            ];
            const olr = interaction.guild.roles.cache.get(await config.get("cargo_staff"));
            if(olr) {
                permissionOverwrites.push({
                    id: olr,
                    allow:["ViewChannel", "SendMessages", PermissionFlagsBits.ManageMessages],
                })
            }
            await interaction.guild.channels.create({
                name:`📞・${user}`,
                type: ChannelType.GuildVoice,
                permissionOverwrites: permissionOverwrites,
                parent: interaction.channel.parent
            }).then((call) => {
                interaction.editReply({content:`✅ | Call Criada um sucesso!\n❔ | Localização da Call: ${call.url}`});
            });
        }
        if(id === "addmember") {
            interaction.update({
                embeds:[
                    new EmbedBuilder()
                    .setTitle(`${interaction.guild.name} | Adicionar Membro`)
                    .setDescription(`Escolha qual membro você deseja adicionar ao ticket`)
                    .setColor(colorEmbed)
                ],
                components:[
                    new ActionRowBuilder()
                    .addComponents(
                        new UserSelectMenuBuilder()
                        .setCustomId(`addmember_staff`)
                        .setPlaceholder("Escolha um membro para adicionar!")
                        .setMaxValues(1)
                    )
                ]
            })
        }
        if(id === "removemember") {
            interaction.update({
                embeds:[
                    new EmbedBuilder()
                    .setTitle(`${interaction.guild.name} | Remover Membro`)
                    .setDescription(`Escolha qual membro você deseja Remover do ticket`)
                    .setColor(colorEmbed)
                ],
                components:[
                    new ActionRowBuilder()
                    .addComponents(
                        new UserSelectMenuBuilder()
                        .setCustomId(`removemember_staff`)
                        .setPlaceholder("Escolha um membro para Remover!")
                        .setMaxValues(1)
                    )
                ]
            })
        }
    }
    if(customId === "addmember_staff") {
        const user = interaction.values[0];
        if(interaction.channel.type == ChannelType.GuildText) {
            await interaction.channel.permissionOverwrites.edit(user,{
                ViewChannel: true,
                SendMessages: true
            });
            interaction.update({
                embeds:[],
                components:[],
                content:`✅ | Usuário(A): <@${user}> foi Adicionado(A) com sucesso!`
            });
        } else {
            await interaction.update({
                embeds:[],
                components:[],
                content:`✅ | Usuário(A): <@${user}> foi Adicionado(A) com sucesso!`
            });
            await interaction.channel.members.add(user);
        }
    }
    if(customId === "removemember_staff") {
        const user = interaction.values[0];
        if(interaction.channel.type == ChannelType.GuildText) {
            await interaction.channel.permissionOverwrites.edit(user,{
                ViewChannel: false,
                SendMessages: false
            });
            interaction.update({
                embeds:[],
                components:[],
                content:`✅ | Usuário(A): <@${user}> foi Removido(A) com sucesso!`
            });
        } else {
            await interaction.update({
                embeds:[],
                components:[],
                content:`✅ | Usuário(A): <@${user}> foi Removido(A) com sucesso!`
            });
            await interaction.channel.members.remove(user);
        }
    }
    if(customId === "renamemodal") {
        const text = interaction.fields.getTextInputValue("text");
        await interaction.update({content:`🔁 | Renomeando o TICKET`, embeds:[],components:[]});
        await interaction.channel.setName(`${text}`);
        interaction.editReply({content:`✅ | Canal de Ticket alterado para: \`${text}\` com sucesso!`});
    }
    if(customId.endsWith("painelmember")) {
        interaction.reply({
            embeds:[
                new EmbedBuilder()
                .setDescription(`👋 Olá ${interaction.user}, Seja Bem-Vindo ao Painel de Membro`)
                .setColor(colorEmbed)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId(`painelmemberselect`)
                    .setPlaceholder("Escolha a opção")
                    .setMaxValues(1)
                    .addOptions(
                        {
                            label:"Notificar Staff",
                            description:"Notifique o Staff que Assumiu o ticket",
                            value:`notify_staff`,
                            emoji:"<:hyperapps54:1219088734801100884>"
                        },
                        {
                            label:"Adicionar Membro",
                            description:"Solicite que adicione uma pessoa no ticket",
                            value:`add_member`,
                            emoji:"<:hyperapps43:1218977376172507227>"
                        },
                        {
                            label:"Remover Membro",
                            description:"Solicite que Removão uma pessoa no ticket",
                            value:`remove_member`,
                            emoji:"<:hyperapps44:1218977445944758354>"
                        },
                    )
                )
            ],
            ephemeral:true
        });
    }
    if(customId ==="painelmemberselect") {
        const options = interaction.values[0];
        const t = await db.get(`${interaction.channel.id}`);
        if(options === "notify_staff") {
            const staff = interaction.client.users.cache.get(t.assumido);
            if(!staff) return interaction.update({content:`❌ | Não foi encontrado o Usuário que assumiu!`,embeds:[],components:[], ephemeral:true});
            await interaction.update({
                embeds:[],
                content:`🔁 | Aguarde um momento...`,
                components:[]
            });
            try {
                let desc = await config.get("mensagem.staff");
                const opcoesData = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
                const opcoesHora = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' };
                const dataFormatada = interaction.createdAt.toLocaleDateString('pt-BR', opcoesData);
                const horarioFormatado = interaction.createdAt.toLocaleTimeString('pt-BR', opcoesHora);
                desc = desc.replace(/#{user}/g, `${interaction.user}`);
                desc = desc.replace(/#{userid}/g, `${interaction.user.id}`);
                desc = desc.replace(/#{data}/g, `${dataFormatada} | ${horarioFormatado}`);
                desc = desc.replace(/#{staff}/g, `${interaction.user}`);
                desc = desc.replace(/#{ticket}/g, interaction.channel.url);
                await staff.send({
                    embeds:[
                        new EmbedBuilder()
                        .setDescription(`${desc}`)
                    ],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setStyle(5)
                            .setURL(interaction.channel.url)
                            .setEmoji("<:hyperapps45:1218985928652099594>")
                            .setLabel("TICKET")
                        )
                    ]
                }).then(() => {
                    interaction.editReply({content:`✅ | Staff Notificado com sucesso!`, ephemeral:true});
                }).catch(() => {
                    interaction.editReply({content:`❌ | Staff está com o Privado Bloqueado!`, ephemeral:true});
                })
            } catch(err) {
                interaction.editReply({content:`❌ | Ocorreu um erro ao tentar enviar mensagem para o Staff\nMensagem do Erro: \`\`\`${err.message}\`\`\``})
            }
        }
        if(options === "remove_member") {
            interaction.update({
                embeds:[
                    new EmbedBuilder()
                    .setTitle(`${interaction.guild.name} | Remover membro`)
                    .setDescription(`Escolha qual Usuário(A) deseja Remover`)
                    .setColor(colorEmbed)
                ],
                components:[
                    new ActionRowBuilder()
                    .addComponents(
                        new UserSelectMenuBuilder()
                        .setCustomId(`userselect_remover`)
                        .setMaxValues(1)
                        .setPlaceholder("Escolha o usuário(A):")
                    ),
                ]
            })
        }
        if(options === "add_member") {
            interaction.update({
                embeds:[
                    new EmbedBuilder()
                    .setTitle(`${interaction.guild.name} | Adicionar membro`)
                    .setDescription(`Escolha qual usuário deseja adicionar.`)
                    .setColor(colorEmbed)
                ],
                components:[
                    new ActionRowBuilder()
                    .addComponents(
                        new UserSelectMenuBuilder()
                        .setCustomId(`userselect`)
                        .setMaxValues(1)
                        .setPlaceholder("Escolha o usuário(A):")
                    ),
                ]
            })
        }
    }
    if(customId === "userselect_remover") {
        const id = interaction.values[0];
        interaction.update({content:`✅ | Pedido enviado com sucesso!`, ephemeral:true, components:[], embeds:[]});
        interaction.channel.send({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Remover Membro`)
                .setDescription(`O usuário(A) ${interaction.user} quer remover o usuário(A).: <@${id}>`)
                .setColor(colorEmbed)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel("Aceitar")
                    .setStyle(3)
                    .setEmoji("<a:hyperapps40:1218671440463921234>")
                    .setCustomId(`${id}_removememberbutton`),
                    new ButtonBuilder()
                    .setLabel("Recusar")
                    .setStyle(4)
                    .setEmoji("<a:hyperapps39:1218671477990232086>")
                    .setCustomId(`recusarbutton`),
                )
            ]
        })
    }
    if(customId ==="recusarbutton") {
        if (!interaction.member.roles.cache.has(await config.get("cargo_staff")) && interaction.user.id !== token.owner) return interaction.deferUpdate();
        interaction.update({
            embeds:[],
            components:[],
            content:`❌ | Solicitação Recusada!`
        });
    }
    if(customId.endsWith("_removememberbutton")) {
        const user = customId.split("_")[0];
        if (!interaction.member.roles.cache.has(await config.get("cargo_staff")) && interaction.user.id !== token.owner) return interaction.deferUpdate();
        if(interaction.channel.type == ChannelType.GuildText) {
            await interaction.channel.permissionOverwrites.edit(user,{
                ViewChannel: false,
                SendMessages: false
            });
            interaction.update({
                embeds:[],
                components:[],
                content:`✅ | Usuário(A): <@${user}> foi Removido(A) com sucesso!`
            });
        } else {
            await interaction.update({
                embeds:[],
                components:[],
                content:`✅ | Usuário(A): <@${user}> foi Removido(A) com sucesso!`
            });
            await interaction.channel.members.remove(user);
        }
    }
    if(customId === "userselect") {
        const id = interaction.values[0];
        interaction.update({content:`✅ | Pedido enviado com sucesso!`, ephemeral:true, components:[], embeds:[]});
        interaction.channel.send({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Adicionar Membro`)
                .setDescription(`Usuário(A) ${interaction.user} quer adicionar o usuário(A): <@${id}>`)
                .setColor(colorEmbed)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel("Aceitar")
                    .setStyle(3)
                    .setEmoji("<a:hyperapps40:1218671440463921234>")
                    .setCustomId(`${id}_addmemberbutton`),
                    new ButtonBuilder()
                    .setLabel("Recusar")
                    .setStyle(4)
                    .setEmoji("<a:hyperapps39:1218671477990232086>")
                    .setCustomId(`recusarbutton`),
                )
            ]
        })
    }
    if(customId.endsWith("_addmemberbutton")) {
        const user = customId.split("_")[0];
        if (!interaction.member.roles.cache.has(await config.get("cargo_staff")) && interaction.user.id !== token.owner) return interaction.deferUpdate();
        if(interaction.channel.type == ChannelType.GuildText) {
            await interaction.channel.permissionOverwrites.edit(user,{
                ViewChannel: true,
                SendMessages: true 
            });
            interaction.update({
                embeds:[],
                components:[],
                content:`✅ | Usuário(A): <@${user}> foi Adicionado(A) com sucesso!`
            });
        } else {
            await interaction.update({
                embeds:[],
                components:[],
                content:`✅ | Usuário(A): <@${user}> foi Adicionado(A) com sucesso!`
            });
            await interaction.channel.members.add(user);
        }
    }
    if(customId.endsWith("sairticket")) {
        const t = await db.get(`${interaction.channel.id}`);
        if(interaction.user.id !== t.owner) return interaction.reply({content:`❌ | Apenas o Dono do ticket pode usar este botão!`, ephemeral:true});
        const modal = new ModalBuilder()
        .setCustomId("sairticketmodal")
        .setTitle("Sair do Ticket");

        const text = new TextInputBuilder()
        .setCustomId("text")
        .setStyle(1)
        .setLabel("você tem certeza que deseja sair?")
        .setPlaceholder("SIM")
        .setMaxLength(3)
        .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(text));

        return interaction.showModal(modal);
    }
    if(customId.endsWith("sairticketmodal")) {
        const text = interaction.fields.getTextInputValue("text");
        if(text != "SIM") return interaction.reply({content:`✅ | Cancelado com sucesso!`, ephemeral:true});


        const permissionOverwrites = [
            {
                id: interaction.user.id,
                deny:["ViewChannel", "SendMessages"],
            },
            {
                id:interaction.guild.id,
                deny:["ViewChannel", "SendMessages"]
         
            },
            {
                id: token.owner,
                allow:["ViewChannel", "SendMessages", PermissionFlagsBits.ManageMessages],
            }
        ];
        const olr = interaction.guild.roles.cache.get(await config.get("cargo_staff"));
        if(olr) {
            permissionOverwrites.push({
                id: olr,
                allow:["ViewChannel", "SendMessages", PermissionFlagsBits.ManageMessages],
            })
        }
        interaction.channel.edit({permissionOverwrites: permissionOverwrites, name:`⛔・closed-${interaction.user.username}`});

        interaction.reply({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Usuário Saiu do Ticket`)
                .setDescription(`O Usuário ${interaction.user} (\`${interaction.user.id}\`) saiu do Ticket`)
                .setColor("Red")
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("fecharticket")
                    .setLabel(await config.get("button.fechar.label"))
                    .setStyle(await config.get("button.fechar.style"))
                    .setEmoji(await config.get("button.fechar.emoji"))
                )
            ]
        })
    }
    }}
