const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const {JsonDatabase} = require("wio.db");
const config = new JsonDatabase({databasePath: require("path").join(__dirname, "../../db/config.json")});
const logger = require("../../util/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('👑 [Apenas Dono] RESETE O BOT'),
    
    async execute(interaction) {
        if(interaction.user.id !== process.env.OWNER_ID) return interaction.reply({content:`❌ | Você não tem permissão para executar este comando!`, ephemeral:true});
        const modal = new ModalBuilder()
        .setCustomId("resetmodal")
        .setTitle("💢 - Resetar Todo o BOT");

        const text = new TextInputBuilder()
        .setCustomId("text")
        .setLabel("você tem certeza?")
        .setStyle(1)
        .setMaxLength(3)
        .setMinLength(3)
        .setPlaceholder('SIM');

        const text1 = new TextInputBuilder()
        .setCustomId("text1")
        .setLabel('Digite: CONFIRMO')
        .setStyle(1)
        .setMaxLength(8)
        .setMinLength(8)
        .setPlaceholder("CONFIRMO")
        .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(text));
        modal.addComponents(new ActionRowBuilder().addComponents(text1));

        return interaction.showModal(modal);
    }
};
