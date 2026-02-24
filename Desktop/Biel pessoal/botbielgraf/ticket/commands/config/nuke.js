const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const logger = require("../../util/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('💣 [Apenas Dono] Delete todas as mensagens do canal'),
    
    async execute(interaction) {
        // Verifica se é o owner
        if (interaction.user.id !== process.env.OWNER_ID) {
            return interaction.reply({
                content: `❌ | Você não tem permissão para executar este comando!`,
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            const channel = interaction.channel;
            
            // Confirmação visual
            const embed = new EmbedBuilder()
                .setTitle("💣 NUKE")
                .setDescription(`Deletando todas as mensagens do canal **${channel.name}**...`)
                .setColor("Red")
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Deletar o canal e recriar
            const position = channel.position;
            const parent = channel.parentId;
            const permissions = channel.permissionOverwrites.cache;

            // Criar novo canal com mesmas configurações
            const newChannel = await interaction.guild.channels.create({
                name: channel.name,
                type: channel.type,
                parent: parent,
                position: position,
                permissionOverwrites: permissions,
                topic: channel.topic,
                nsfw: channel.nsfw,
                rateLimitPerUser: channel.rateLimitPerUser
            });

            // Deletar canal antigo
            await channel.delete();

            // Enviar mensagem no novo canal
            const successEmbed = new EmbedBuilder()
                .setTitle("💣 NUKE EXECUTADO")
                .setDescription(`✅ Canal **${newChannel.name}** foi resetado com sucesso!`)
                .setColor("Green")
                .setTimestamp()
                .setFooter({ text: `Nukeado por ${interaction.user.username}` });

            await newChannel.send({ embeds: [successEmbed] });

        } catch (error) {
            console.error("Erro ao executar nuke:", error);
            await interaction.editReply({
                content: `❌ | Erro ao executar nuke: ${error.message}`,
                embeds: []
            });
        }
    }
};
