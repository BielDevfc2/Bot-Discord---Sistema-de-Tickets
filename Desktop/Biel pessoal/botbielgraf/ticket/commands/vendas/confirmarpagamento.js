const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const logger = require("../../util/logger");
const { getOrderBySecureCode, confirmPayment, updateOrderStatus, addOrderNote, sendOrderLog } = require("../../util/orderSystem");
const config = require("path").join(__dirname, "../../db/config.json");
const { JsonDatabase } = require("wio.db");
const path = require("path");
const configDB = new JsonDatabase({ databasePath: path.join(__dirname, "../../db/config.json") });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('confirmarpagamento')
        .setDescription('💰 [Staff] Confirmar pagamento de um pedido')
        .addStringOption(option =>
            option
                .setName('codigo')
                .setDescription('Código seguro do pedido')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('nota')
                .setDescription('Nota adicional (opcional)')
                .setRequired(false)
        ),

    async execute(interaction) {
        try {
            // Verificar permissão de staff
            const cargoStaff = await configDB.get("cargo_staff");
            const isStaff = interaction.member?.roles?.cache?.has(cargoStaff) || 
                            interaction.user.id === process.env.OWNER_ID;

            if (!isStaff) {
                return interaction.reply({
                    content: '❌ | Apenas staff pode confirmar pagamentos.',
                    ephemeral: true
                });
            }

            const codigo = interaction.options.getString('codigo').toUpperCase();
            const nota = interaction.options.getString('nota') || '';

            await interaction.deferReply({ ephemeral: true });

            const order = await getOrderBySecureCode(codigo);

            if (!order) {
                return interaction.editReply({
                    content: `❌ | Pedido não encontrado: **${codigo}**`
                });
            }

            if (order.status !== "Aguardando Pagamento") {
                return interaction.editReply({
                    content: `❌ | Este pedido já tem o status: **${order.status}**\n\nNão pode ser processado novamente.`
                });
            }

            // Confirmar pagamento
            const updatedOrder = await confirmPayment(codigo, interaction.user.id);

            if (!updatedOrder) {
                return interaction.editReply({
                    content: '❌ | Erro ao processar pagamento. Tente novamente.'
                });
            }

            // Adicionar nota se fornecida
            if (nota) {
                await addOrderNote(codigo, interaction.user.id, nota);
            }

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Pagamento Confirmado!')
                .addFields(
                    { name: '📦 Pedido', value: updatedOrder.orderId, inline: true },
                    { name: '👤 Cliente', value: `<@${updatedOrder.clienteId}>`, inline: true },
                    { name: '🛍 Serviço', value: updatedOrder.servico, inline: false },
                    { name: '💰 Valor', value: `R$ ${updatedOrder.valor.toFixed(2)}`, inline: true },
                    { name: '📌 Novo Status', value: '🟢 Pago', inline: true },
                    { name: '🎫 Código de Garantia', value: `\`${updatedOrder.guaranteeCode}\``, inline: false },
                    { name: '👨‍💼 Registrado por', value: `<@${interaction.user.id}>`, inline: true }
                )
                .setFooter({ text: 'Código de garantia foi gerado automaticamente' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Notificar cliente (se no mesmo servidor)
            try {
                const client = interaction.client;
                const user = await client.users.fetch(updatedOrder.clienteId);
                
                const dmEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Seu Pagamento Foi Confirmado!')
                    .addFields(
                        { name: '📦 Pedido', value: updatedOrder.orderId, inline: true },
                        { name: '🛍 Serviço', value: updatedOrder.servico, inline: true },
                        { name: '🎫 Código de Garantia', value: `\`${updatedOrder.guaranteeCode}\``, inline: false },
                        { name: '📌 Status', value: '🟢 Seu pedido foi pago e está sendo processado!', inline: false }
                    )
                    .setTimestamp();

                await user.send({ embeds: [dmEmbed] }).catch(() => {});
            } catch (e) {
                logger.warn("Não foi possível notificar cliente via DM");
            }

            logger.success(`Pagamento confirmado: ${updatedOrder.orderId} → ${updatedOrder.guaranteeCode}`);

            // Enviar log para canal
            await sendOrderLog(
                interaction.client,
                '✅ Pagamento Confirmado',
                `Pedido **${updatedOrder.orderId}** foi marcado como pago`,
                '#00FF00',
                [
                    { name: '👤 Cliente', value: `<@${updatedOrder.clienteId}>`, inline: true },
                    { name: '👨‍💼 Staff', value: `<@${interaction.user.id}>`, inline: true },
                    { name: '💰 Valor', value: `R$ ${updatedOrder.valor.toFixed(2)}`, inline: true },
                    { name: '🎫 Código de Garantia', value: `\`${updatedOrder.guaranteeCode}\``, inline: false }
                ]
            );

        } catch (error) {
            logger.error("Erro em /confirmarpagamento:", { error: error.message });
            await interaction.editReply({
                content: `❌ | Erro ao processar comando: ${error.message}`
            }).catch(() => {});
        }
    }
};
