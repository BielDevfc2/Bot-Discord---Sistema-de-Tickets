const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const logger = require("../../util/logger");
const { getAllOrders } = require("../../util/orderSystem");
const path = require("path");
const { JsonDatabase } = require("wio.db");
const configDB = new JsonDatabase({ databasePath: path.join(__dirname, "../../db/config.json") });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rankingvendas')
        .setDescription('🏆 [Staff] Ver ranking de vendas da equipe'),

    async execute(interaction) {
        try {
            // Verificar permissão de staff
            const cargoStaff = await configDB.get("cargo_staff");
            const isStaff = interaction.member?.roles?.cache?.has(cargoStaff) || 
                            interaction.user.id === process.env.OWNER_ID;

            if (!isStaff) {
                return interaction.reply({
                    content: '❌ | Apenas staff pode acessar o ranking.',
                    ephemeral: true
                });
            }

            await interaction.deferReply({ ephemeral: false });

            const orders = await getAllOrders();
            const paidOrders = orders.filter(o => o.status !== "Aguardando Pagamento" && o.status !== "Cancelado");

            // Agrupar por staff
            const staffStats = {};
            paidOrders.forEach(order => {
                if (order.staffResponsavel) {
                    if (!staffStats[order.staffResponsavel]) {
                        staffStats[order.staffResponsavel] = {
                            pedidos: 0,
                            valorTotal: 0
                        };
                    }
                    staffStats[order.staffResponsavel].pedidos += 1;
                    staffStats[order.staffResponsavel].valorTotal += order.valor;
                }
            });

            // Converter para array e ordenar
            const ranking = Object.entries(staffStats)
                .map(([staffId, stats]) => ({
                    staffId,
                    ...stats
                }))
                .sort((a, b) => b.valorTotal - a.valorTotal);

            if (ranking.length === 0) {
                return interaction.editReply({
                    content: '📭 | Nenhuma venda confirmada ainda.'
                });
            }

            // Criar embed
            let description = '🏆 **Ranking de Vendas da Equipe**\n\n';

            ranking.forEach((staff, index) => {
                const medalha = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
                description += `${medalha} **#${index + 1}** - <@${staff.staffId}>\n`;
                description += `   📦 Pedidos: **${staff.pedidos}**\n`;
                description += `   💰 Faturamento: **R$ ${staff.valorTotal.toFixed(2)}**\n`;
                description += `   📊 Ticket Médio: **R$ ${(staff.valorTotal / staff.pedidos).toFixed(2)}**\n\n`;
            });

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🏆 Ranking de Vendas')
                .setDescription(description)
                .addFields(
                    {
                        name: '📈 Totais',
                        value: `Pedidos Confirmados: **${paidOrders.length}**\nFaturamento Total: **R$ ${paidOrders.reduce((sum, o) => sum + o.valor, 0).toFixed(2)}**`,
                        inline: false
                    }
                )
                .setFooter({ text: 'Apenas pedidos pagos e não-cancelados são contabilizados' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            logger.success(`Ranking de vendas consultado por ${interaction.user.tag}`);

        } catch (error) {
            logger.error("Erro em /rankingvendas:", { error: error.message });
            await interaction.editReply({
                content: `❌ | Erro ao processar comando: ${error.message}`
            }).catch(() => {});
        }
    }
};
