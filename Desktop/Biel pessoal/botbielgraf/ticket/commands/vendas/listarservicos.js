const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const logger = require("../../util/logger");
const path = require("path");
const { JsonDatabase } = require("wio.db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listarservicos')
        .setDescription('📋 Ver lista de serviços disponíveis'),

    async execute(interaction) {
        try {
            const configDB = new JsonDatabase({ databasePath: path.join(__dirname, "../../db/config.json") });
            const servicos = await configDB.get("servicos") || [];

            if (servicos.length === 0) {
                return interaction.reply({
                    content: '📭 | Nenhum serviço cadastrado. Use `/adicionarservico` para adicionar.',
                    ephemeral: true
                });
            }

            // Criar descrição com lista de serviços
            let description = '';
            servicos.forEach((s, index) => {
                description += `${index + 1}. ${s.emoji} **${s.value}**\n`;
            });

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('📋 Serviços Disponíveis')
                .setDescription(description)
                .addFields(
                    { 
                        name: '📊 Total', 
                        value: `**${servicos.length}** serviço${servicos.length !== 1 ? 's' : ''}`, 
                        inline: false 
                    },
                    {
                        name: '🛠️ Gerenciamento',
                        value: 'Use `/adicionarservico` para adicionar\nUse `/removerservico` para remover',
                        inline: false
                    }
                )
                .setFooter({ text: 'Serviços aparecem automaticamente em /pedido' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });

            logger.success(`Lista de serviços consultada por ${interaction.user.tag}`);

        } catch (error) {
            logger.error("Erro em /listarservicos:", { error: error.message });
            await interaction.reply({
                content: `❌ | Erro ao listar serviços: ${error.message}`,
                ephemeral: true
            }).catch(() => {});
        }
    }
};
