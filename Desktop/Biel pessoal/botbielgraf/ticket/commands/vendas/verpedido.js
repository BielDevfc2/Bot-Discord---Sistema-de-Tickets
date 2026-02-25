const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const logger = require("../../util/logger");
const { getOrderBySecureCode } = require("../../util/orderSystem");

const statusEmojis = {
    "Aguardando Pagamento": "🟡",
    "Pago": "🟢",
    "Em Produção": "🔵",
    "Revisão": "🟣",
    "Finalizado": "⚫",
    "Cancelado": "🔴"
};

const statusColors = {
    "Aguardando Pagamento": "#FFFF00",
    "Pago": "#00FF00",
    "Em Produção": "#0000FF",
    "Revisão": "#FF00FF",
    "Finalizado": "#000000",
    "Cancelado": "#FF0000"
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verpedido')
        .setDescription('🔎 Visualizar detalhes de um pedido')
        .addStringOption(option =>
            option
                .setName('codigo')
                .setDescription('Código seguro do pedido (ex: BG-2026-02-24-A8K3L)')
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            const codigo = interaction.options.getString('codigo').toUpperCase();

            const order = await getOrderBySecureCode(codigo);

            if (!order) {
                return interaction.reply({
                    content: `❌ | Pedido não encontrado. Verifique o código: **${codigo}**`,
                    ephemeral: true
                });
            }

            // Validar se é o cliente ou staff
            const isClient = order.clienteId === interaction.user.id;
            const isStaff = interaction.member?.roles?.cache?.has(
                await require("../../util/logger") // placeholder, trocar por config real se necessário
            ) || interaction.user.id === process.env.OWNER_ID;

            if (!isClient && !isStaff) {
                return interaction.reply({
                    content: '❌ | Você não tem permissão para visualizar este pedido.',
                    ephemeral: true
                });
            }

            const emoji = statusEmojis[order.status] || '❓';
            const color = statusColors[order.status] || '#FFFFFF';

            let fieldsContent = [
                { name: '📦 ID do Pedido', value: order.orderId, inline: true },
                { name: '🔐 Código Seguro', value: `\`${order.secureCode}\``, inline: true },
                { name: '👤 Cliente', value: `<@${order.clienteId}>`, inline: true },
                { name: '🛍 Serviço', value: order.servico, inline: false },
                { name: '💰 Valor', value: `R$ ${order.valor.toFixed(2)}`, inline: true },
                { name: '📅 Data de Criação', value: order.dataCriacao, inline: true },
                { name: `${emoji} Status`, value: order.status, inline: true }
            ];

            if (order.dataPagamento) {
                fieldsContent.push({ name: '✅ Data Pagamento', value: order.dataPagamento, inline: true });
            }

            if (order.guaranteeCode) {
                fieldsContent.push({ name: '🎫 Código de Garantia', value: `\`${order.guaranteeCode}\``, inline: false });
            }

            if (order.staffResponsavel) {
                fieldsContent.push({ name: '👨‍💼 Staff Responsável', value: `<@${order.staffResponsavel}>`, inline: true });
            }

            if (order.descricao) {
                fieldsContent.push({ name: '📝 Descrição', value: order.descricao, inline: false });
            }

            if (order.notas && order.notas.length > 0) {
                const notasText = order.notas
                    .slice(-3) // últimas 3 notas
                    .map(n => `**<@${n.author}>**: ${n.texto}`)
                    .join('\n');
                fieldsContent.push({ name: '📌 Notas Recentes', value: notasText, inline: false });
            }

            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle(`${emoji} Detalhes do Pedido ${order.orderId}`)
                .addFields(...fieldsContent)
                .setFooter({ text: 'Sistema de Pedidos | Use /historico para ver todos seus pedidos' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });

            logger.success(`Pedido consultado: ${order.orderId} (Usuário: ${interaction.user.tag})`);

        } catch (error) {
            logger.error("Erro em /verpedido:", { error: error.message });
            
            // Verificar se interação já foi respondida antes de tentar responder
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: `❌ | Erro ao processar comando: ${error.message}`,
                    ephemeral: true
                }).catch(() => {});
            } else if (interaction.deferred) {
                await interaction.editReply({
                    content: `❌ | Erro ao processar comando: ${error.message}`
                }).catch(() => {});
            }
        }
    }
};
