const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "gerar-pix",
    description: "[💳] Gerar PIX via Efí Bank",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "valor",
            type: ApplicationCommandOptionType.Number,
            required: true,
            description: "Valor em reais",
            min_value: 0.01,
            max_value: 999999.99
        }
    ],
    run: async (client, interaction) => {
        try {
            if (interaction.user.id !== process.env.OWNER_ID) {
                return await interaction.reply({
                    content: "❌ Apenas o dono pode usar!",
                    ephemeral: true
                });
            }

            const valor = interaction.options.getNumber("valor");

            try {
                const { gerarPix } = require("../../services/efi");
                const cobranca = await gerarPix(valor, "Pagamento via Bot");

                if (!cobranca?.pixCopiaECola) {
                    return await interaction.reply({
                        content: "❌ Erro ao conectar com Efí",
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setTitle("💳 PIX Gerado")
                    .setDescription(`R$ ${valor.toFixed(2)}`)
                    .addFields({
                        name: "Copia e Cola",
                        value: `\`${cobranca.pixCopiaECola}\``
                    })
                    .setColor("Green");

                await interaction.reply({ embeds: [embed] });
            } catch (err) {
                console.error("Erro ao gerar PIX:", err);
                await interaction.reply({
                    content: `❌ Erro: ${err.message}`,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error("Erro em gerar-pix:", error);
        }
    }
};
