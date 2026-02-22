const fs = require("fs");
const { JsonDatabase } = require("wio.db");
const config = new JsonDatabase({databasePath:"./db/config.json"});
const axios = require("axios");
const { ApplicationCommandType, ApplicationCommandOptionType, AttachmentBuilder, EmbedBuilder } = require("discord.js");

const {generateQrCode} = require("../../util/createQrCode");


module.exports = {
    name: "gerar-pix",
    description: "[🔧] Envie sua Chave Pix.",
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        const valor = interaction.options.getNumber("valor");
        const chave_pix = await config.get("botconfig.pix");


        if (!interaction.member.roles.cache.has(await config.get("cargo_staff")) && interaction.user.id !== token.owner) return interaction.reply({content:`⛔ | Permissão Negada.`, ephemeral:true});
        if(chave_pix === "Não Configurado.") return interaction.reply({content:`Configure a sua chave pix para usar este comando.`, ephemeral: true});


        await interaction.reply({content:`🔁 | Aguarde um momento... Estou buscando a Chave Pix.`, ephemeral: false});

        const chave_random = chave_pix; 
        const QrCode = await generateQrCode(chave_random);


        if(!QrCode) return interaction.editReply({ 
            content:"",
            embeds: [
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Pagamento`)
                .setDescription(`\`\`\`${chave_random}\`\`\``)
                .setColor("#00FFFF")
                .setFooter({text:`Pagamento Manual, Logo após de pagar envie comprovante.`, iconURL: interaction.member.displayAvatarURL()})
                .setThumbnail(interaction.guild.iconURL())
            ]
        }); 
        

        const attachment = new AttachmentBuilder(QrCode, {name: "qrcode.png"})
        interaction.editReply({
            content:"",
            embeds: [
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Pagamento`)
                .setDescription(`\`\`\`${chave_random}\`\`\`⚠️** | Caso deseja Escanear, Use o Scanner de QrCode Normal!**`)
                .setColor("#00FFFF")
                .setFooter({text:`Pagamento Manual, Logo após de pagar envie comprovante.`, iconURL: interaction.member.displayAvatarURL()})
                .setThumbnail(interaction.guild.iconURL())
                .setImage("attachment://qrcode.png") 
            ],
            files: [attachment]
        }); 
    }
};
