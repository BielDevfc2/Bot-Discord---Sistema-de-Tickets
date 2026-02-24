const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const logger = require("../../util/logger");
const { getSalesStats } = require("../../util/orderSystem");
const path = require("path");
const { JsonDatabase } = require("wio.db");
const configDB = new JsonDatabase({ databasePath: path.join(__dirname, "../../db/config.json") });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pedidosdash')
        .setDescription('📊 [Staff] Dashboard com estatísticas de vendas'),

    async execute(interaction) {
        try {
            // Verificar permissão de staff
            const cargoStaff = await configDB.get("cargo_staff");
            const isStaff = interaction.member?.roles?.cache?.has(cargoStaff) || 
                            interaction.user.id === process.env.OWNER_ID;

            if (!isStaff) {
                return interaction.reply({
                    content: '❌ | Apenas staff pode acessar o dashboard.',
                    ephemeral: true
                });
            }

            await interaction.deferReply({ ephemeral: false });

            const stats = await getSalesStats();

            if (!stats) {
                return interaction.editReply({
                    content: '❌ | Erro ao carregar estatísticas.'
                });
            }

            // Calcular percentuais
            const percPagos = stats.total > 0 ? Math.round((stats.pagos / stats.total) * 100) : 0;
            const percFinalizados = stats.total > 0 ? Math.round((stats.finalizados / stats.total) * 100) : 0;
            const percCancelados = stats.total > 0 ? Math.round((stats.cancelados / stats.total) * 100) : 0;

            // Criar barras visuais
            const createBar = (value, max, length = 20) => {
                const filled = Math.round((value / max) * length);
                return '█'.repeat(filled) + '░'.repeat(length - filled);
            };

            const totalBar = createBar(stats.valorPago, stats.valorTotal);
            const pagosBar = createBar(stats.pagos, stats.total);
            const finalizadosBar = createBar(stats.finalizados, stats.total);

            const embed = new EmbedBuilder()
                .setColor('#00FFFF')
                .setTitle('📊 Dashboard de Vendas')
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .addFields(
                    {
                        name: '💰 Faturamento',
                        value: `\`\`\`
Total de Pedidos: R$ ${stats.valorTotal.toFixed(2)}
Valor Pago: R$ ${stats.valorPago.toFixed(2)}
${totalBar} ${Math.round((stats.valorPago / (stats.valorTotal || 1)) * 100)}%
                        \`\`\``,
                        inline: false
                    },
                    {
                        name: '📦 Status dos Pedidos',
                        value: `\`\`\`
🟡 Aguardando: ${stats.pendentes}
🟢 Pagos: ${stats.pagos} ${pagosBar}
🔵 Em Produção: ${stats.emProducao}
⚫ Finalizados: ${stats.finalizados} ${finalizadosBar}
🔴 Cancelados: ${stats.cancelados}
                        \`\`\``,
                        inline: false
                    },
                    {
                        name: '📈 Resumo',
                        value: `\`\`\`
Total de Pedidos: ${stats.total}
Taxa de Conclusão: ${percFinalizados}%
Taxa de Cancelamento: ${percCancelados}%
Ticket Médio: R$ ${(stats.valorTotal / (stats.total || 1)).toFixed(2)}
                        \`\`\``,
                        inline: false
                    }
                )
                .setFooter({ text: 'Dashboard atualizado em tempo real' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            logger.success(`Dashboard visualizado por ${interaction.user.tag}`);

        } catch (error) {
            logger.error("Erro em /pedidosdash:", { error: error.message });
            await interaction.editReply({
                content: `❌ | Erro ao processar comando: ${error.message}`
            }).catch(() => {});
        }
    }
};
