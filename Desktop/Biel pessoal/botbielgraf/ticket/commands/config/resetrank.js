const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const {JsonDatabase} = require("wio.db");
const config = new JsonDatabase({databasePath: require("path").join(__dirname, "../../db/config.json")});
const logger = require("../../util/logger");

module.exports = { 
    data: new SlashCommandBuilder()
        .setName('resetrank')
        .setDescription('👑 [Apenas Dono] Resetar Rank de Tickets Abertos'),
    
    async execute(interaction) {
        if(interaction.user.id !== process.env.OWNER_ID) return interaction.reply({content:`❌ | Você não tem permissão para executar este comando!`, ephemeral:true});
        const modal = new ModalBuilder()
        .setCustomId("resetrankmodal")
        .setTitle("💢 - Resetar Ranking de Ticket");

        const text = new TextInputBuilder()
        .setCustomId("text")
        .setLabel("você tem certeza?")
        .setStyle(1)
        .setMaxLength(3)
        .setMinLength(3)
        .setPlaceholder('SIM');


        modal.addComponents(new ActionRowBuilder().addComponents(text));

        return interaction.showModal(modal);
    }
};
