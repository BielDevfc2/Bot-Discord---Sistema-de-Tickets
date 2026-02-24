const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const logger = require("../../util/logger");
const path = require("path");
const { JsonDatabase } = require("wio.db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removerservico')
        .setDescription('❌ [Staff] Remover serviço da lista')
        .addStringOption(option =>
            option
                .setName('nome')
                .setDescription('Nome do serviço a remover')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async execute(interaction) {
        try {
            // Verificar permissão de staff
            const configDB = new JsonDatabase({ databasePath: path.join(__dirname, "../../db/config.json") });
            const cargoStaff = await configDB.get("cargo_staff");
            const isStaff = interaction.member?.roles?.cache?.has(cargoStaff) || 
                            interaction.user.id === process.env.OWNER_ID;

            if (!isStaff) {
                return interaction.reply({
                    content: '❌ | Apenas staff pode remover serviços.',
                    ephemeral: true
                });
            }

            const nome = interaction.options.getString('nome');

            // Obter lista atual de serviços
            let servicos = await configDB.get("servicos") || [];
            const index = servicos.findIndex(s => s.value.toLowerCase() === nome.toLowerCase());

            if (index === -1) {
                return interaction.reply({
                    content: `❌ | O serviço **${nome}** não encontrado na lista.`,
                    ephemeral: true
                });
            }

            // Remover serviço
            servicos.splice(index, 1);

            // Salvar no banco
            await configDB.set("servicos", servicos);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('✅ Serviço Removido com Sucesso!')
                .addFields(
                    { name: '🛍 Nome', value: nome, inline: true },
                    { name: '📊 Total de Serviços Restantes', value: `${servicos.length}`, inline: true }
                )
                .setFooter({ text: 'O serviço foi removido de /pedido' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            logger.success(`Serviço removido: ${nome} (Staff: ${interaction.user.tag})`);

        } catch (error) {
            logger.error("Erro em /removerservico:", { error: error.message });
            await interaction.reply({
                content: `❌ | Erro ao remover serviço: ${error.message}`,
                ephemeral: true
            }).catch(() => {});
        }
    },

    async autocomplete(interaction) {
        try {
            const configDB = new JsonDatabase({ databasePath: path.join(__dirname, "../../db/config.json") });
            const servicos = await configDB.get("servicos") || [];
            
            const focused = interaction.options.getFocused();
            const names = servicos.map(s => s.value);

            const filtered = names.filter(name => 
                name.toLowerCase().startsWith(focused.toLowerCase())
            );

            await interaction.respond(
                filtered.map(name => ({ name, value: name }))
            );
        } catch (error) {
            logger.error("Erro em autocomplete /removerservico:", { error: error.message });
        }
    }
};
