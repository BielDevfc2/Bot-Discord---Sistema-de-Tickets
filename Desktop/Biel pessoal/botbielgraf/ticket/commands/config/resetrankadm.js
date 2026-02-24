const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const {JsonDatabase} = require("wio.db");
const logger = require("../../util/logger");

module.exports = { 
    data: new SlashCommandBuilder()
        .setName('resetrankadm')
        .setDescription('👑 [Apenas Dono] Resetar Rank de Tickets Assumidos'),
    
    async execute(interaction) {
        if(interaction.user.id !== process.env.OWNER_ID) return interaction.reply({content:`❌ | Você não tem permissão para executar este comando!`, ephemeral:true});
        const modal = new ModalBuilder()
        .setCustomId("resetrankadmmodal")
        .setTitle("💢 - Resetar Ranking de Assumidos");

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
