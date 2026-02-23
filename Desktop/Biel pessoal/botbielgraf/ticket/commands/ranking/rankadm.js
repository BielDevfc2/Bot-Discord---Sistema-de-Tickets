const { ApplicationCommandType, EmbedBuilder } = require("discord.js");
const {JsonDatabase} = require("wio.db");
const config = new JsonDatabase({databasePath:"./db/config.json"});
const perfil = new JsonDatabase({databasePath:"./db/perfil.json"});



module.exports = {
    name:"rankadm",
    description:"[🛠 / Área Staff] Veja o Ranking de quem mais assumiu ticket!",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        if (!interaction.member.roles.cache.has(await config.get("cargo_staff")) && interaction.user.id !== process.env.OWNER_ID) return interaction.reply({content:`⛔ | Permissão Negada.`, ephemeral:true});
        const all = (await perfil.all())
            .filter(a => a.data && a.data.assumidos)
            .sort((a,b) => b.data.assumidos - a.data.assumidos)
            .slice(0, 15);
        if(all.length <= 0) return interaction.reply({content:`❌ | Nenhum ticket foi assumido.`, ephemeral:true});
        let msg = "";
        all.forEach((ae, index) => {
            let medalha = "";
            if((index+1) === 1) {
                medalha = "🥇";
            } else if((index+1) === 2) {
                medalha = "🥈";
            } else if((index+1) === 3) {
                medalha = "🥉";
            } else {
                medalha = "🏅";
            }
            msg += `${medalha} | ${index+1}° - Usuário(a): <@${ae.ID}> - \`Quantidades de Assumidos: ${ae.data.assumidos}\`\n`; 
        });
        interaction.reply({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Ranking Staff`)
                .setThumbnail(interaction.guild.iconURL())
                .setDescription(`🏆・*\`TOP 15 DE QUEM MAIS ASSUMIU TICKET\`*\n\n${msg}`)
                .setColor("Random")
                .setFooter({text:`${interaction.guild.name} - Todos os Direitos reservados`, iconURL: interaction.client.user.displayAvatarURL()})
                .setTimestamp()
            ]
        });
}}
