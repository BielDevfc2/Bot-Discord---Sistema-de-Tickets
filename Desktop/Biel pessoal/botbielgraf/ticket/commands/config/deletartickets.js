const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {JsonDatabase} = require("wio.db");
const config = new JsonDatabase({databasePath: require("path").join(__dirname, "../../db/config.json")});
const logger = require("../../util/logger");

const { QuickDB } = require("quick.db");
const db = new QuickDB({table:"ticket"});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletartickets')
        .setDescription('👑 [Apenas Dono] Deleta TODOS os Tickets'),
    
    async execute(interaction) {
        if(interaction.user.id !== process.env.OWNER_ID) return interaction.reply({content:`❌ | Você não tem permissão para executar este comando!`, ephemeral:true});
        await interaction.reply({content:`🔁 | Aguarde um momento estou deletando todos os ticket's....`, ephemeral:true});
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

        return interaction.editReply({content:`✅ | Todos os Tickets Foram Deletados com sucesso`});
    }
};
