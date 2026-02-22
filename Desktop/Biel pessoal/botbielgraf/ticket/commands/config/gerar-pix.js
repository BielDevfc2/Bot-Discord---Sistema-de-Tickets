const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const qrcode = require("qrcode");
const fs = require("fs");
const config = new JsonDatabase({ databasePath: "./db/config.json" });

module.exports = {
    name: "gerar-pix",
    description: "[💳] Gerar PIX com QR Code e valor",
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
            description: "Descrição do pagamento (ex: Compra de Servço)",
            max_length: 72
        }
    ],
    run: async (client, interaction) => {
        try {
            await interaction.deferReply({ ephemeral: true });

            const valor = interaction.options.getNumber("valor");
            const descricao = interaction.options.getString("descricao") || "Pagamento via Discord Bot";

            // Obter chave PIX do banco de dados
            const chavePix = await config.get("pix.chave");
            const nomePix = await config.get("pix.nome") || "Bielgraf Studio";

            if (!chavePix) {
                return await interaction.editReply({
                    content: "❌ | Chave PIX não configurada. Use `/botconfig` para configurar."
                });
            }

            // Formatar valor com 2 casas decimais
            const valorFormatado = valor.toFixed(2);

            // Gerar payload PIX (formato simplificado)
            const pixPayload = `00020126580014br.gov.bcb.brcode0136${chavePix}52040000530398654${valorFormatado}5802BR5913${nomePix.substring(0, 25)}6009sao paulo62410503***63041D3D`;

            // Gerar QR Code
            const qrCodePath = "./qrcode_temp.png";
            await qrcode.toFile(qrCodePath, pixPayload, {
                width: 300,
                margin: 2,
                color: {
                    dark: "#000000",
                    light: "#ffffff"
                }
            });

            // Criar embed com informações
            const embed = new EmbedBuilder()
                .setTitle("💳 PIX Gerado")
                .setDescription(`Pagamento de **R$ ${valorFormatado}** - ${descricao}`)
                .addFields(
                    { name: "💰 Valor", value: `R$ ${valorFormatado}`, inline: true },
                    { name: "👤 Recebedor", value: nomePix, inline: true },
                    { name: "🔑 Chave PIX", value: `\`${chavePix}\``, inline: false },
                    { name: "📝 Descrição", value: descricao || "Pagamento via Discord Bot", inline: false }
                )
                .setColor("Green")
                .setTimestamp()
                .setFooter({ text: "Escaneie o QR Code para pagar" });

            // Criar attachment
            const attachment = new AttachmentBuilder(qrCodePath, { name: "qrcode.png" });

            // Se tiver Neon configurado, salvar no banco
            if (process.env.DATABASE_URL) {
                try {
                    const { Pool } = require("pg");
                    const pool = new Pool({
                        connectionString: process.env.DATABASE_URL,
                        ssl: { rejectUnauthorized: false }
                    });

                    const client2 = await pool.connect();
                    
                    // Criar tabela se não existir
                    await client2.query(`
                        CREATE TABLE IF NOT EXISTS pix_gerados (
                            id SERIAL PRIMARY KEY,
                            valor DECIMAL(10, 2),
                            descricao VARCHAR(72),
                            chave_pix VARCHAR(255),
                            usuario_discord VARCHAR(20),
                            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            status VARCHAR(20) DEFAULT 'pendente'
                        )
                    `);

                    // Inserir registro
                    await client2.query(
                        `INSERT INTO pix_gerados (valor, descricao, chave_pix, usuario_discord) 
                         VALUES ($1, $2, $3, $4)`,
                        [valor, descricao, chavePix, interaction.user.id]
                    );

                    client2.release();
                    pool.end();
                } catch (dbError) {
                    console.error("Erro ao conectar ao Neon:", dbError);
                }
            }

            // Enviar resposta
            await interaction.editReply({
                embeds: [embed],
                files: [attachment]
            });

            // Deletar arquivo temporário
            setTimeout(() => {
                if (fs.existsSync(qrCodePath)) {
                    fs.unlinkSync(qrCodePath);
                }
            }, 5000);

        } catch (error) {
            console.error("Erro em gerar-pix:", error);
            await interaction.editReply({
                content: `❌ | Erro ao gerar PIX: ${error.message}`
            }).catch(() => {});
        }
    }
};
