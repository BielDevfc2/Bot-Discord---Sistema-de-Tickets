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

            await interaction.deferReply({ ephemeral: true });

            // Verificar se as credenciais estão configuradas
            const clientId = process.env.EFI_CLIENT_ID;
            const clientSecret = process.env.EFI_CLIENT_SECRET;
            const pixKey = process.env.EFI_PIX_KEY;

            if (!clientId || !clientSecret || !pixKey) {
                return await interaction.editReply({
                    content: "❌ **Credenciais Efí não configuradas!**\n\n" +
                             "Adicione no Railway:\n" +
                             "• `EFI_CLIENT_ID`\n" +
                             "• `EFI_CLIENT_SECRET`\n" +
                             "• `EFI_PIX_KEY`\n" +
                             "• `EFI_SANDBOX` = true"
                });
            }

            const valor = interaction.options.getNumber("valor");

            try {
                const { gerarPix } = require("../../services/efi");
                
                console.log("🔐 Tentando conectar com Efí...");
                const cobranca = await gerarPix(valor, "Pagamento via Bot");

                if (!cobranca?.pixCopiaECola) {
                    const errorMsg = cobranca?.error || "Erro desconhecido";
                    console.error("❌ Erro Efí:", errorMsg);
                    
                    return await interaction.editReply({
                        content: `❌ **Erro ao conectar com Efí:**\n\`\`\`\n${errorMsg}\n\`\`\``
                    });
                }

                const embed = new EmbedBuilder()
                    .setTitle("💳 PIX Gerado com Sucesso")
                    .setDescription(`R$ ${valor.toFixed(2)}`)
                    .addFields({
                        name: "📋 Código PIX (Copia e Cola)",
                        value: `\`${cobranca.pixCopiaECola}\``,
                        inline: false
                    })
                    .addFields({
                        name: "🆔 ID Cobrança",
                        value: `\`${cobranca.id}\``
                    })
                    .setColor("Green")
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            } catch (err) {
                console.error("❌ Erro ao gerar PIX:", err);
                await interaction.editReply({
                    content: `❌ **Erro:**\n\`\`\`\n${err.message}\n\`\`\``
                });
            }
        } catch (error) {
            console.error("Erro em gerar-pix:", error);
        }
    }
};
