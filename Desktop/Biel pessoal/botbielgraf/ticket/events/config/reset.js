const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType } = require("discord.js");
const {JsonDatabase} = require("wio.db");
const config = new JsonDatabase({databasePath: require("path").join(__dirname, "../../db/config.json")});
const perfil = new JsonDatabase({databasePath: require("path").join(__dirname, "../../db/perfil.json")});
const ct = new JsonDatabase({databasePath: require("path").join(__dirname, "../../db/category.json")});

const { QuickDB } = require("quick.db");
const db = new QuickDB({table:"ticket"});


module.exports = {
    name:"interactionCreate",
    run: async(interaction, client) => {
        if(interaction.isModalSubmit() && interaction.customId === "resetmodal") {
            const text = interaction.fields.getTextInputValue("text");
            const text1 = interaction.fields.getTextInputValue("text1");
            if(text !== "SIM") return interaction.reply({content:`✅ | Cancelado com sucesso!`, ephemeral:true});
            if(text1 !== "CONFIRMO") return interaction.reply({content:`✅ | Cancelado com sucesso!`, ephemeral:true});
            await interaction.reply({content:`🔁 | Aguarde um momento, estou resetando as configurações...`, ephemeral:true});
            await config.set(`painel`,{
                "title": "🎲・Central de atendimento",
                "footer": "Horário de atendimento: 10:00 até 23:00",
                "desc": "**・Olá, seja bem-vindo(a) a central de atendimento da ${interaction.guild.name}, abaixo vamos listar os tipos de departamentos e suporte presentes na nossa empresa escolha um para abrir seu chamando.\n\n📂・Atendimento via ticket\n\n・Selecione abaixo qual departamento está relacionado a sua dúvida ou problema e será gerado um canal de texto privado para que seu atendimento seja realizado de forma segura e ágil.**",
                "banner": "https://media.discordapp.net/attachments/1234696813165023303/1237228543021158501/nulledticket_1707888290521.png?ex=663ae25f&is=663990df&hm=bf8ebfef87325092861314fcb99d1c4194a8598048c3ea84d303f7e53d7e076f&=&format=webp&quality=lossless&width=550&height=143",
                "cor": "Random",
                "placeholder": "Escolha uma opção:"
            });
            await config.set("dentro",{
                "title": "${interaction.guild.name} | TICKET",
                "desc": "👋・Olá #{user} Seja Bem-Vindo(A) Como podemos te ajudar ?\n\n👤・Usuário: #{user} (#{userid})\n\n📅・Horário: #{data}\n\n📄・Motivo: #{motivo} (apenas se tiver usando o ticket no modo form)\n\n👮・Staff Que Assumiu: #{assumido}\n\nBom #{user}, Peço que aguarde pacientemente a nossa equipe vir lhe atender. Eles já foram acionados.",
                "banner": "https://media.discordapp.net/attachments/1234696813165023303/1237228543021158501/nulledticket_1707888290521.png?ex=663ae25f&is=663990df&hm=bf8ebfef87325092861314fcb99d1c4194a8598048c3ea84d303f7e53d7e076f&=&format=webp&quality=lossless&width=550&height=143",
                "footer": "remover",
                "cor": "Random"
            });
            await config.set("button",{
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
            await config.set("mensagem", {
                "staff": "👋・**Olá**, **#{staff}**, o usuário **#{user}** **requer sua atenção** no **ticket** que você está trabalhando.\n📁・**Canal do Ticket**: Por favor, **clique** no botão abaixo para ir para o **ticket**",
                "member": "👋・**Olá, #{user}, **O **responsável** pelo seu ticket, **#{staff}** está solicitando sua **presença** no ticket.\n📁・**Canal do Ticket:**  Por favor, **clique** no botão abaixo para ir para o **ticket**",
                "logs_member": "👋 Olá #{user} Seu ticket foi Finalizado!\n\n- Data de fechamento: #{data}\n- Staff Responsavel: #{assumido}\n- Fechado Por: #{staff}",
                "logs_admin": "👥・Dono do Ticket: #{user}\n🛠️・Staff que Fechou: #{staff}\n🔎・Assumido por: #{assumido}\n📅・Data: #{data}",
                "assumed": "👋・Olá **#{user}**, seu ticket foi assumido pelo **Staff: #{staff}**.\n📁・Canal do Ticket: **#{ticket}**",
                "ticket_assumed": "👮・**Staff** que assumiu: #{assumido}\n📁・Ticket assumido: #⁠{ticket}"
            });
            await config.set("cargo_staff", "Não Configurado");
            await config.set("channel_ava", "Não Configurado");
            await config.set("channel_logs", "Não Configurado");
            await config.set("open",  {
                "system": "Select",
                "button": {
                    "label": "Abrir Ticket",
                    "emoji": "🎫",
                    "style": 1
                }
            });
            await config.set("transcript",  {
                "sistema": true,
                "usuario": true
            });
            await config.set("botconfig", {
                systemavaliation: true,
                pix: "Não Configurado.",
                category: null,
                cor: "#00FFFF",
                systemsendmsg: true,
                topic: false
              });
            await interaction.editReply({content:`✅ | Configurações Resetadas...`, ephemeral:true});
            await interaction.editReply({content:`🔁 | Deletando Todos os Ticket's...`, ephemeral:true});
            var channels_ticket = await interaction.guild.channels.cache.filter(c => c.name.includes('🎫・'));

        channels_ticket.forEach(async element => {
            element = await element
            element.delete()
        });


        var channels_ticket_closed = await interaction.guild.channels.cache.filter(c => c.name.includes('⛔・'));

        channels_ticket_closed.forEach(async element => {
            element = await element
            element.delete()
        });

        var channels_ticket_call = await interaction.guild.channels.cache.filter(c => c.name.includes('📞・'));

        channels_ticket_call.forEach(async element => {
            element = await element
            element.delete()
        });

        await db.deleteAll()

        await interaction.editReply({content:`✅ | Todos os Tickets Foram Deletados com sucesso`});
        await interaction.editReply({content:`🔁 | Limpando as Categorias...`});
        await ct.deleteAll();
        await interaction.editReply({content:`✅ | Categorias Limpadas com sucesso!`});
        await interaction.editReply({content:`🔁 | Limpando os Ranking.....`});
        await perfil.deleteAll();
        await interaction.editReply({content:`✅ | Ranking Limpado com sucesso!`});
        await interaction.editReply({content:`👋 ${interaction.user} o bot foi resetado com sucesso, agora você pode usar o bot novamente...`});
        }
        if(interaction.customId === "resetrankmodal") {
            const text = interaction.fields.getTextInputValue("text");
            if(text !== "SIM") return interaction.reply({content:`✅ | Cancelado com sucesso.`, ephemeral:true});
            await interaction.reply({content:"🔁 | Aguarde um momento estou resetando o Ranking de Ticket's Abertos.", ephemeral:true});
            await perfil.all().filter(a => a.data.ticketsaberto).map((a) => {
                perfil.delete(`${a.ID}.ticketsaberto`);
            });
            interaction.editReply({content:`✅ | Ranking de Ticket's Abertos resetados com sucesso!`});
        }
        if(interaction.customId === "resetrankadmmodal") {
            const text = interaction.fields.getTextInputValue("text");
            if(text !== "SIM") return interaction.reply({content:`✅ | Cancelado com sucesso.`, ephemeral:true});
            await interaction.reply({content:"🔁 | Aguarde um momento estou resetando o Ranking de Ticket's Assumidos.", ephemeral:true});
            await perfil.all().filter(a => a.data.assumidos).map((a) => {
                perfil.delete(`${a.ID}.assumidos`);
            });
            interaction.editReply({content:`✅ | Ranking de Ticket's Assumidos resetados com sucesso!`});
        }
    }}
