const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const {JsonDatabase} = require("wio.db");
const config = new JsonDatabase({databasePath:"./db/config.json"});



module.exports = { 
    name:"resetrank",
    description:"[👑 / Only Owner] Resetar Rank de Ticket's Abertos",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        if(interaction.user.id !== token.owner) return interaction.reply({content:`❌ | Você não tem permissão para executar este comando!`, ephemeral:true});
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
}}
