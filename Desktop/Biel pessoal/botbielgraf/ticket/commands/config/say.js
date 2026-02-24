const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('🧀 [Moderação] Faça o bot falar!')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(option =>
            option
                .setName('mensagem')
                .setDescription('Qual mensagem irei enviar?')
                .setRequired(true)
        ),
    
    async execute(interaction) {
		
		await interaction.reply({content:`Aguarde um momento...`, ephemeral:true});
		await interaction.channel.send({
			content:`${interaction.options.getString("mensagem")}`
		});
		interaction.editReply({content:`Enviado com sucesso!`});
    }
};
