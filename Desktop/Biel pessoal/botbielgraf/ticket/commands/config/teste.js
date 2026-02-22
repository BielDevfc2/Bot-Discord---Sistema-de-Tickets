const { ApplicationCommandType } = require("discord.js");

module.exports = {
    name: "teste",
    description: "Comando de teste",
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        await interaction.reply({ content: "✅ Teste funcionando!" });
    }
};
