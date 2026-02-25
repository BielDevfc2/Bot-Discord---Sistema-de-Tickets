const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const perfil = new JsonDatabase({ databasePath: require("path").join(__dirname, "../../db/perfil.json") });

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rank")
        .setDescription("[🧀 / Utilidades] Veja o Ranking de quem mais abriu ticket!"),
    async execute(interaction) {
        try {
            const all = (await perfil.all())
                .filter(a => a.data && a.data.ticketsaberto)
                .sort((a, b) => b.data.ticketsaberto - a.data.ticketsaberto)
                .slice(0, 15);
            
            if (all.length <= 0) return interaction.reply({ content: `❌ | Nenhum ticket foi aberto.`, ephemeral: true });
            
            let msg = "";
            all.forEach((ae, index) => {
                let medalha = "";
                if ((index + 1) === 1) {
                    medalha = "🥇";
                } else if ((index + 1) === 2) {
                    medalha = "🥈";
                } else if ((index + 1) === 3) {
                    medalha = "🥉";
                } else {
                    medalha = "🏅";
                }
                msg += `${medalha} | ${index + 1}° - Usuário(a): <@${ae.ID}> - \`Quantidade de Ticket's Abertos: ${ae.data.ticketsaberto}\`\n`;
            });
            
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Ranking`)
                        .setThumbnail(interaction.guild.iconURL())
                        .setDescription(`🏆・*\`TOP 15 DE QUEM MAIS ABRIU TICKET.\`*\n\n${msg}`)
                        .setColor("Random")
                        .setFooter({ text: `${interaction.guild.name} - Todos os Direitos reservados`, iconURL: interaction.client.user.displayAvatarURL() })
                        .setTimestamp()
                ]
            });
        } catch (error) {
            console.error("❌ Erro ao executar /rank:", error);
            interaction.reply({
                content: `❌ Erro ao buscar ranking: ${error.message}`,
                ephemeral: true
            });
        }
    }
}
