const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const logger = require("../../util/logger");
const path = require("path");
const { JsonDatabase } = require("wio.db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pedidos')
        .setDescription('📦 Ver todos os pedidos do sistema'),

    async execute(interaction) {
        try {
            const configDB = new JsonDatabase({ databasePath: path.join(__dirname, "../../db/config.json") });
            const ordersDB = new JsonDatabase({ databasePath: path.join(__dirname, "../../db/orders.json") });

            // Verificar permissão de staff
            const cargoStaff = await configDB.get("cargo_staff");
            const isStaff = interaction.member?.roles?.cache?.has(cargoStaff) || 
                            interaction.user.id === process.env.OWNER_ID;

            if (!isStaff) {
                return interaction.reply({
                    content: '❌ | Apenas staff pode ver todos os pedidos.',
                    ephemeral: true
                });
            }

            await interaction.deferReply({ ephemeral: false });

            // Obter todos os pedidos
            const allData = await ordersDB.get("_all") || {};
            const pedidos = Object.values(allData).filter(item => item.orderId && item.clienteId);

            if (pedidos.length === 0) {
                return interaction.editReply({
                    content: '📭 | Nenhum pedido cadastrado.'
                });
            }

            // Ordenar por data (mais recentes primeiro)
            pedidos.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));

            // Paginação (10 por página)
            const itemsPerPage = 10;
            const totalPages = Math.ceil(pedidos.length / itemsPerPage);
            let currentPage = 0;

            const getEmbed = (page) => {
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const pagePedidos = pedidos.slice(start, end);

                const statusEmojis = {
                    'Aguardando Pagamento': '🟡',
                    'Pago': '🟢',
                    'Processando': '⚙️',
                    'Finalizado': '✅',
                    'Cancelado': '❌'
                };

                let description = '';
                pagePedidos.forEach((p, i) => {
                    const emoji = statusEmojis[p.status] || '❓';
                    const priority = p.prioridade === 'Alta' ? '🔴' : '🟠';
                    description += `\n${emoji} **${p.orderId}** | <@${p.clienteId}>\n`;
                    description += `   💰 R$ ${p.valor.toFixed(2)} | ${priority} ${p.prioridade}\n`;
                    description += `   🔐 \`${p.secureCode}\` | ${p.dataCriacao}\n`;
                });

                return new EmbedBuilder()
                    .setColor('#0099FF')
                    .setTitle('📦 Todos os Pedidos')
                    .setDescription(description || 'Nenhum pedido nesta página')
                    .setFooter({ text: `Página ${page + 1}/${totalPages} | Total: ${pedidos.length} pedidos` })
                    .setTimestamp();
            };

            // Criar botões de navegação
            const getButtons = (page) => {
                const row = new ActionRowBuilder();
                
                if (page > 0) {
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId('pedidos_prev')
                            .setLabel('⬅️ Anterior')
                            .setStyle(2)
                    );
                }

                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('pedidos_info')
                        .setLabel(`${page + 1}/${totalPages}`)
                        .setStyle(3)
                        .setDisabled(true)
                );

                if (page < totalPages - 1) {
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId('pedidos_next')
                            .setLabel('Próximo ➡️')
                            .setStyle(2)
                    );
                }

                return row;
            };

            const message = await interaction.editReply({
                embeds: [getEmbed(currentPage)],
                components: [getButtons(currentPage)]
            });

            // Coletor de botões
            const collector = message.createButtonCollector({
                time: 300000 // 5 minutos
            });

            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    return buttonInteraction.reply({
                        content: '❌ | Você não pode usar estes botões.',
                        ephemeral: true
                    });
                }

                if (buttonInteraction.customId === 'pedidos_prev' && currentPage > 0) {
                    currentPage--;
                } else if (buttonInteraction.customId === 'pedidos_next' && currentPage < totalPages - 1) {
                    currentPage++;
                }

                await buttonInteraction.update({
                    embeds: [getEmbed(currentPage)],
                    components: [getButtons(currentPage)]
                });
            });

            collector.on('end', async () => {
                await message.edit({ components: [] }).catch(() => {});
            });

            logger.success(`Pedidos consultados por ${interaction.user.tag}`);

        } catch (error) {
            logger.error("Erro em /pedidos:", { error: error.message });
            await interaction.editReply({
                content: `❌ | Erro ao processar comando: ${error.message}`
            }).catch(() => {});
        }
    }
};
