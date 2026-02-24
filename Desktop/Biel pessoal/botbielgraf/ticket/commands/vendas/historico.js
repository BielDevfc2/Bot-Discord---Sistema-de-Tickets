const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const logger = require("../../util/logger");
const { getClientOrders } = require("../../util/orderSystem");

const statusEmojis = {
    "Aguardando Pagamento": "🟡",
    "Pago": "🟢",
    "Em Produção": "🔵",
    "Revisão": "🟣",
    "Finalizado": "⚫",
    "Cancelado": "🔴"
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('historico')
        .setDescription('📂 Ver histórico de seus pedidos')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('[Staff] Ver histórico de outro usuário')
                .setRequired(false)
        ),

    async execute(interaction) {
        try {
            // Se user option foi fornecido, validar permissão
            const targetUser = interaction.options.getUser('usuario');
            let userId = interaction.user.id;

            if (targetUser) {
                // Só staff pode ver histórico de outro
                const cargoStaff = await require("path").join(__dirname, "../../db/config.json");
                const configDB = new (require("wio.db").JsonDatabase)({
                    databasePath: require("path").join(__dirname, "../../db/config.json")
                });
                const cargoId = await configDB.get("cargo_staff");
                
                const isStaff = interaction.member?.roles?.cache?.has(cargoId) || 
                                interaction.user.id === process.env.OWNER_ID;

                if (!isStaff) {
                    return interaction.reply({
                        content: '❌ | Apenas staff pode ver o histórico de outro usuário.',
                        ephemeral: true
                    });
                }

                userId = targetUser.id;
            }

            await interaction.deferReply({ ephemeral: true });

            const orders = await getClientOrders(userId);

            if (orders.length === 0) {
                return interaction.editReply({
                    content: '📭 | Nenhum pedido encontrado.'
                });
            }

            // Paginar se tiver muitos pedidos (máx 25 campos)
            const itemsPerPage = 5;
            const pages = Math.ceil(orders.length / itemsPerPage);
            let currentPage = 0;

            const generatePage = (page) => {
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`📂 Histórico de Pedidos`)
                    .setDescription(`Total: ${orders.length} pedido(s) | Página ${page + 1}/${pages}`)
                    .setFooter({ text: 'Use os botões para navegar' })
                    .setTimestamp();

                const start = page * itemsPerPage;
                const end = Math.min(start + itemsPerPage, orders.length);

                for (let i = start; i < end; i++) {
                    const order = orders[i];
                    const emoji = statusEmojis[order.status] || '❓';

                    embed.addFields({
                        name: `${emoji} ${order.orderId} - ${order.servico}`,
                        value: `\`${order.secureCode}\`\n💰 R$ ${order.valor.toFixed(2)} | 📅 ${order.dataCriacao}\n📌 ${order.status}`,
                        inline: false
                    });
                }

                return embed;
            };

            const em = generatePage(currentPage);

            // Botões de navegação (apenas se tiver múltiplas páginas)
            const buttons = [];
            if (pages > 1) {
                buttons.push(
                    new ButtonBuilder()
                        .setCustomId(`historico_prev_${userId}`)
                        .setLabel('← Anterior')
                        .setStyle(1)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId(`historico_next_${userId}`)
                        .setLabel('Próximo →')
                        .setStyle(1)
                        .setDisabled(currentPage === pages - 1)
                );
            }

            const row = buttons.length > 0 ? new ActionRowBuilder().addComponents(buttons) : null;

            if (row) {
                await interaction.editReply({ embeds: [em], components: [row] });
            } else {
                await interaction.editReply({ embeds: [em] });
            }

            logger.success(`Histórico consultado: ${orders.length} pedido(s) (Usuário: ${userId})`);

        } catch (error) {
            logger.error("Erro em /historico:", { error: error.message });
            await interaction.editReply({
                content: `❌ | Erro ao processar comando: ${error.message}`
            }).catch(() => {});
        }
    }
};
