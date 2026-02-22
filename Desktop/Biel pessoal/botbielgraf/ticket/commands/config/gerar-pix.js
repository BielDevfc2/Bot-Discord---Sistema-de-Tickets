const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { gerarPix } = require("../../services/efi");
const qrcode = require("qrcode");
const fs = require("fs");

module.exports = {
    name: "gerar-pix",
    description: "[💳] Gerar PIX via Efí Bank",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "valor",
            type: ApplicationCommandOptionType.Number,
            required: true,
            description: "Valor em reais (ex: 50)",
            min_value: 0.01,
            max_value: 999999.99
        },
        {
            name: "descricao",
            type: ApplicationCommandOptionType.String,
            required: false,
            description: "Descrição do pagamento",
            max_length: 72
        }
    ],

    run: async (client, interaction) => {
        try {
            await interaction.deferReply({ ephemeral: true });

            const valor = interaction.options.getNumber("valor");
            const descricao = interaction.options.getString("descricao") || "Pagamento via Discord Bot";

            const pix = await gerarPix(valor, descricao);

            if (!pix) {
                return await interaction.editReply({
                    content: "❌ | Erro ao gerar cobrança na Efí."
                });
            }

            const copiaECola = pix.pixCopiaECola;
            const valorFormatado = pix.valor.original;

            const qrCodePath = "./qrcode_temp.png";

            await qrcode.toFile(qrCodePath, copiaECola, {
                width: 300,
                margin: 2
            });

            const embed = new EmbedBuilder()
                .setTitle("💳 PIX Gerado com Sucesso")
                .setDescription(`Pagamento de **R$ ${valorFormatado}**`)
                .addFields(
                    { name: "💰 Valor", value: `R$ ${valorFormatado}`, inline: true },
                    { name: "📝 Descrição", value: descricao, inline: true },
                    { name: "📋 Copia e Cola", value: `\`\`\`${copiaECola}\`\`\`` }
                )
                .setColor("Green")
                .setTimestamp()
                .setFooter({ text: "Efí Bank • Pagamento expira em 1 hora" });

            const attachment = new AttachmentBuilder(qrCodePath, { name: "qrcode.png" });

            await interaction.editReply({
                embeds: [embed],
                files: [attachment]
            });

            setTimeout(() => {
                if (fs.existsSync(qrCodePath)) {
                    fs.unlinkSync(qrCodePath);
                }
            }, 5000);

        } catch (error) {
            console.error("Erro gerar-pix:", error);

            await interaction.editReply({
                content: `❌ | Erro ao gerar PIX: ${error.message}`
            }).catch(() => {});
        }
    }
};