const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { gerarPix } = require("../../services/efi");
const qrcode = require("qrcode");
const fs = require("fs");

module.exports = {
    name: "gerar-pix",
    description: "[💳] Gerar PIX via Efí Bank - Pagamento Automático",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "valor",
            type: ApplicationCommandOptionType.Number,
            required: true,
            description: "Valor em reais (ex: 50.00)",
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
            // Verificar permissões de owner
            if (interaction.user.id !== process.env.OWNER_ID) {
                return await interaction.reply({
                    content: "❌ | Apenas o dono do bot pode usar este comando.",
                    ephemeral: true
                });
            }

            await interaction.deferReply({ ephemeral: true });

            const valor = interaction.options.getNumber("valor");
            const descricao = interaction.options.getString("descricao") || "Pagamento via Bielgraf";

            console.log(`💳 Gerando PIX de R$ ${valor.toFixed(2)}: ${descricao}`);

            // Conectar com API Efí para gerar cobrança REAL
            const cobranca = await gerarPix(valor, descricao);

            if (!cobranca || !cobranca.pixCopiaECola) {
                console.error("Erro ao gerar cobrança:", cobranca);
                return await interaction.editReply({
                    content: "❌ | Erro ao conectar com Efí. Verifique:\n" +
                             "- Se as credenciais estão corretas no Railway\n" +
                             "- Se EFI_CLIENT_ID, EFI_CLIENT_SECRET e EFI_PIX_KEY estão setadas"
                });
            }

            const copiaECola = cobranca.pixCopiaECola;
            const valorFormatado = cobranca.valor.original;
            const identificador = cobranca.id;

            console.log(`✅ Cobrança criada com sucesso: ${identificador}`);

            // Gerar QR Code real do copy-paste
            const qrCodePath = `./qrcode_${Date.now()}.png`;
            
            try {
                await qrcode.toFile(qrCodePath, copiaECola, {
                    width: 350,
                    margin: 2,
                    color: {
                        dark: "#000000",
                        light: "#ffffff"
                    }
                });
            } catch (err) {
                console.error("Erro ao gerar QR Code:", err);
                return await interaction.editReply({
                    content: "❌ | Erro ao gerar QR Code"
                });
            }

            // Criar embed bonitão com todas as informações
            const embed = new EmbedBuilder()
                .setTitle("💳 PIX Gerado via Efí")
                .setDescription("✅ Cobrança criada com sucesso!\n\nEscaneie o QR Code ou copie e cole o código abaixo:")
                .addFields(
                    { 
                        name: "💰 Valor", 
                        value: `**R$ ${valorFormatado}**`, 
                        inline: true 
                    },
                    { 
                        name: "⏱️ Válido por", 
                        value: "1 hora", 
                        inline: true 
                    },
                    { 
                        name: "📝 Descrição", 
                        value: descricao, 
                        inline: false 
                    },
                    { 
                        name: "📋 Codigo Pix (Copia e Cola)", 
                        value: `\`\`\`${copiaECola}\`\`\``, 
                        inline: false 
                    },
                    { 
                        name: "🆔 ID Cobrança", 
                        value: `\`${identificador}\``, 
                        inline: true 
                    }
                )
                .setColor("0099FF")
                .setImage("attachment://pix-qrcode.png")
                .setTimestamp()
                .setFooter({ 
                    text: "Cofre Digital - Pagamentos via Efí",
                    iconURL: "https://cdn-icons-png.flaticon.com/512/888/888879.png"
                });

            const attachment = new AttachmentBuilder(qrCodePath, { name: "pix-qrcode.png" });

            await interaction.editReply({
                embeds: [embed],
                files: [attachment]
            });

            // Cleanup arquivo temporário
            setTimeout(() => {
                if (fs.existsSync(qrCodePath)) {
                    fs.unlinkSync(qrCodePath);
                }
            }, 5000);

        } catch (error) {
            console.error("❌ Erro crítico em /gerar-pix:", error);
            
            await interaction.editReply({
                content: `❌ | Erro ao gerar PIX:\n\`\`\`\n${error.message}\n\`\`\``
            }).catch(() => {});
        }
    }
};
