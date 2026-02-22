const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder } = require("discord.js");
const config = require("../../token.json");
const {JsonDatabase} = require("wio.db");
const cf = new JsonDatabase({databasePath:"./db/config.json"});
const ct = new JsonDatabase({databasePath:"./db/category.json"});


module.exports = {
    name:"ticket",
    description:"[🛠 / Área Staff] Execute o Comando de Enviar o painel de ticket",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        if (!interaction.member.roles.cache.has(await ct.get("cargo_staff")) && interaction.user.id !== config.owner) return interaction.reply({content:`⛔ | Permissão Negada.`, ephemeral:true});
        await interaction.reply({content:`🔁 | Aguarde um momento, estou enviando a mensagem.`, ephemeral:true});
        const all = await ct.all();
        const a = await cf.get("painel");
        const embed = new EmbedBuilder().setTitle(`${a.title}`).setFooter({text:`${a.footer}`}).setColor(a.cor);
        let desc = a.desc;
        desc = desc.replace("${interaction.guild.name}", interaction.guild.name);
        embed.setDescription(`${desc}`);
        if(a.banner.startsWith("https://")) embed.setImage(a.banner);
        let row;
        const open = await cf.get("open");
        if(open.system === "Select") {
            if(all.length <= 0) return interaction.editReply({content:`❌ | Você não criou nenhuma categoria`, ephemeral:true});
            row = new StringSelectMenuBuilder().setCustomId("ticketslakkk").setMaxValues(1).setPlaceholder(a.placeholder);
            all.map(async(rs) => {
                row.addOptions(
                    {
                        label:`${rs.data.titulo}`, 
                        description:`${rs.data.desc}`,
                        emoji: rs.data.emoji,
                        value: rs.ID
                    }
                )
            });
        } else {
            row = new ButtonBuilder()
            .setCustomId("abrir_ticket")
            .setLabel(open.button.label)
            .setStyle(open.button.style)
            .setEmoji(open.button.emoji);
        }
        await interaction.channel.send({
            embeds:[embed],
            components:[
                new ActionRowBuilder()
                .addComponents(row)
            ]
        }).then(() => {
            interaction.editReply({content:`✅ | Enviado com sucesso`});
        })
    }
}