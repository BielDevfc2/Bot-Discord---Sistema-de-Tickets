const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const {JsonDatabase} = require("wio.db");
const config = new JsonDatabase({databasePath:"./db/config.json"});



module.exports = {
    name:"botconfig",
    description:"[👑 / Only Owner] Configure o Sistema de Ticket do BOT",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        if(interaction.user.id !== process.env.OWNER_ID) return interaction.reply({content:`❌ | Você não tem permissão para executar este comando!`, ephemeral:true});
        interaction.reply({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Sistema do Ticket`)
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setDescription(`👋 Olá ***${interaction.user.username}***, Seja Bem-Vindo(a) ao Painel de Configuração do Sistema de **TICKET**, Veja abaixo qual opção você deseja configurar neste momento!`)
                .setColor("Random")
                .setFooter({text:`${interaction.guild.name} - Todos os Direitos Reservados`, iconURL: interaction.guild.iconURL()})
                .setTimestamp()
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                    .setPlaceholder("Escolha qual opção você deseja configurar:")
                    .setMaxValues(1)
                    .addOptions(
                        {
                            label:"Configurar Categoria",
                            description:"Configure todas as Categorias do Ticket",
                            value:"category",
                            emoji:"<:hyperapps39:1218972749050150984>"
                        },
                        {
                            label:"Configurar Ticket",
                            description:"Configure o sistema de Ticket",
                            value:"system",
                            emoji:"<:hyperapps40:1218972946316394677>"
                        },
                        {
                            label:"Configurar Canal",
                            description:"Configure o Canal de LOGS Staff",
                            value:"logs",
                            emoji:"<:hyperapps41:1218973013748355132>"
                        },
                        {
                            label:"Configurar Cargo",
                            description:"Configure o Cargo que terá permissões de Staff",
                            value:"staff",
                            emoji:"<:hyperapps42:1218973368540463114>"
                        },
                        {
                            label:"Personalizar",
                            description:"Personalize Embeds E Botões",
                            value:"personalizar",
                            emoji:"<:hyperapps25:1215832166781550684>"
                        },
                        {
                            label:"Configuração do Bot",
                            description:"Configure funcionalidades do bot",
                            value:"botconfig",
                            emoji:"<:hyperapps22:1215826999872852091>"
                        }
                    )
                    .setCustomId(`${interaction.user.id}_botconfig`)
                )
            ]
        });
    }
}
