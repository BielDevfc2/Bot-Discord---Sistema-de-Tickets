const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const logger = require("../../util/logger");
const path = require("path");
const { JsonDatabase } = require("wio.db");
const { createConfigBackup } = require("../../util/backupSystem");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adicionarservico')
        .setDescription('➕ [Staff] Adicionar novo serviço à lista')
        .addStringOption(option =>
            option
                .setName('nome')
                .setDescription('Nome do serviço')
                .setRequired(true)
                .setMaxLength(100)
        )
        .addStringOption(option =>
            option
                .setName('emoji')
                .setDescription('Emoji do serviço (ex: 🎨)')
                .setRequired(false)
                .setMaxLength(10)
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
                    content: '❌ | Apenas staff pode adicionar serviços.',
                    ephemeral: true
                });
            }

            const nome = interaction.options.getString('nome');
            const emoji = interaction.options.getString('emoji') || '📦';

            // Obter lista atual de serviços
            let servicos = await configDB.get("servicos") || [];

            // Verificar se já existe
            if (servicos.some(s => s.value.toLowerCase() === nome.toLowerCase())) {
                return interaction.reply({
                    content: `❌ | O serviço **${nome}** já existe na lista.`,
                    ephemeral: true
                });
            }

            // Adicionar novo serviço
            servicos.push({
                name: nome,
                value: nome,
                emoji: emoji
            });

            // Salvar no banco e fazer backup automático
            await configDB.set("servicos", servicos);
            createConfigBackup(`adição de novo serviço: ${nome}`);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Serviço Adicionado com Sucesso!')
                .addFields(
                    { name: '🛍 Nome', value: nome, inline: true },
                    { name: '😊 Emoji', value: emoji, inline: true },
                    { name: '📊 Total de Serviços', value: `${servicos.length}`, inline: true }
                )
                .setFooter({ text: 'O serviço agora aparece em /pedido' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            logger.success(`Serviço adicionado: ${nome} (Staff: ${interaction.user.tag})`);

        } catch (error) {
            logger.error("Erro em /adicionarservico:", { error: error.message });
            await interaction.reply({
                content: `❌ | Erro ao adicionar serviço: ${error.message}`,
                ephemeral: true
            }).catch(() => {});
        }
    }
};
