const fs = require("fs");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const config = new JsonDatabase({databasePath:"./db/config.json"});
const axios = require("axios");
const https = require("https");
const logger = require("../../util/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trocarqrcode')
        .setDescription('🔧 Trocar a imagem do QrCode')
        .addAttachmentOption(option =>
            option
                .setName('imagem')
                .setDescription('Coloque a imagem que irá ser trocada')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        try {
            if(interaction.user.id !== process.env.OWNER_ID) {
                return interaction.reply({
                    content:`❌ | Você não tem permissão para executar este comando!`, 
                    ephemeral:true
                });
            }
            
            const attachment = interaction.options.getAttachment("imagem");
            
            if (!attachment) {
                return interaction.reply({ 
                    content: "❌ | Não encontrei nenhum arquivo.", 
                    ephemeral: true 
                });
            }

            if (!attachment.contentType.startsWith('image/')) {
                return interaction.reply({ 
                    content: "❌ | Coloque apenas imagem.", 
                    ephemeral: true 
                });
            }

            const fileName = attachment.name;
            if (fileName.endsWith(".webp")) {
                return interaction.reply({ 
                    content: "❌ | Não é possível usar arquivos .webp!", 
                    ephemeral: true 
                });
            }
            
            await interaction.reply({
                content:`⏳ | Aguarde um momento...`, 
                ephemeral: true 
            });

            const archiveName = await config.get("archiveName");
            const existingFilePath = `./${archiveName}`;
            
            // Deletar arquivo antigo se existir
            if (fs.existsSync(existingFilePath)) {
                fs.unlinkSync(existingFilePath);
            }

            const filePath = `./${fileName}`;
            const imageUrl = attachment.url;

            // Download da imagem
            const file = fs.createWriteStream(filePath);
            
            https.get(imageUrl, (response) => {
                response.pipe(file);
                
                file.on('finish', () => {
                    file.close();
                    config.set("archiveName", fileName);
                    interaction.editReply({ 
                        content: `✅ | Imagem do QrCode trocada com sucesso!`, 
                        ephemeral: true 
                    });
                });
                
                file.on('error', (err) => {
                    fs.unlink(filePath, () => {});
                    interaction.editReply({ 
                        content: `❌ | Ocorreu um erro ao salvar o arquivo.`, 
                        ephemeral: true 
                    });
                });
            }).on('error', (err) => {
                fs.unlink(filePath, () => {});
                interaction.editReply({ 
                    content: `❌ | Erro ao baixar a imagem.`, 
                    ephemeral: true 
                });
            });

        } catch (error) {
            logger.error("Erro em trocarqrcode:", {error: error.message});
            await interaction.reply({
                content: `❌ | Erro: ${error.message}`,
                ephemeral: true
            }).catch(() => {});
        }
    }
};
