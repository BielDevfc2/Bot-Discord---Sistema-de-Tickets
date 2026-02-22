const { ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
module.exports = {
    name:"say",
    description:"[🧀 | Moderação] Faça eu falar!",
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: PermissionFlagsBits.ManageGuild,
    options:[
        {
            name:"mensagem",
            description:"Qual mensagem irei enviar?",
            type: ApplicationCommandOptionType.String,
            required:true,
        }
    ],
    run:async(client, interaction) => {
        
		await interaction.reply({content:`Aguarde um momento...`, ephemeral:true});
		await interaction.channel.send({
			content:`${interaction.options.getString("mensagem")}`
		});
		interaction.editReply({content:`Enviado com sucesso!`});
		
    }
}
