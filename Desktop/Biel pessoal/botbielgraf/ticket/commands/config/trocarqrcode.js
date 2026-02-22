const fs = require("fs");
const { JsonDatabase } = require("wio.db");
const config = new JsonDatabase({databasePath:"./db/config.json"});
const axios = require("axios");
const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const token = require("../../token.json");

module.exports = {
    name: "trocarqrcode",
    description: "[🔧] Trocar a imagem do QrCode.",
    type: ApplicationCommandType.ChatInput,
    options: [
        { 
            name:"imagem",
            type: ApplicationCommandOptionType.Attachment,
            required: true,
            description:"Coloque a imagem que irá ser trocada."
        }
    ],
    run: async (client, interaction) => {
        if(interaction.user.id !== token.owner) return interaction.reply({content:`❌ | Você não tem permissão para executar este comando!`, ephemeral:true});
        
        const attachment = interaction.options.getAttachment("imagem");
        
        if (!attachment) 
            return interaction.reply({ content: "Não encontrei nenhum arquivo.", ephemeral: true });

        if (!attachment.contentType.startsWith('image/')) 
            return interaction.reply({ content: "Coloque apenas imagem.", ephemeral: true });

        const fileName = attachment.name;
        if (fileName.endsWith(".webp")) 
            return interaction.reply({ content: "Não é possivel usar arquivos .webp!", ephemeral: true });
        
        const archiveName = await config.get("archiveName");
        const existingFilePath = `./${archiveName}`;
        if (fs.existsSync(existingFilePath)) {
            fs.unlink(existingFilePath, (err) => {
                
            });
        }

        const filePath = `./${fileName}`;
        await config.set("archiveName", fileName);
        const imageUrl = attachment.url;
        await interaction.reply({content:`Aguarde um momento...`, ephemeral:true });
        axios({
            method: 'get',
            url: imageUrl,
            responseType: 'stream'
        })
        .then(response => {
            const dest = fs.createWriteStream(filePath);
            response.data.pipe(dest);
            dest.on('finish', () => {
                config.set("archiveName", fileName);
                interaction.editReply({ content: `Imagem Trocada com sucesso!`, ephemeral: true, files: [filePath] });
            });
            dest.on('error', (err) => {
                interaction.editReply({ content: "Ocorreu um erro ao salvar o arquivo, tente novamente.", ephemeral: true });
            });
        })
        .catch(err => {
            
            interaction.editReply({ content: "Ocorreu um erro ao baixar a imagem, tente novamente.", ephemeral: true });
        });
    }
};
