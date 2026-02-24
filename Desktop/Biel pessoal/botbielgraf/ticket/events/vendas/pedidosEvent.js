const { EmbedBuilder } = require("discord.js");
const logger = require("../../util/logger");
const { createOrder, sendOrderLog } = require("../../util/orderSystem");

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        // Processar modal de pedido customizado
        if (interaction.isModalSubmit() && interaction.customId.startsWith("pedido_custom_")) {
            try {
                const servicoCustom = interaction.fields.getTextInputValue("servico_custom");
                const descricao = interaction.fields.getTextInputValue("descricao") || "";

                // Pedir valor via componente ou via segundo modal
                await interaction.showModal(new (require("discord.js").ModalBuilder)()
                    .setCustomId(`pedido_valor_${interaction.user.id}`)
                    .setTitle("💰 Valor do Serviço")
                    .addComponents(
                        new (require("discord.js").ActionRowBuilder)().addComponents(
                            new (require("discord.js").TextInputBuilder)()
                                .setCustomId("valor")
                                .setLabel("Qual é o valor? (ex: 150.50)")
                                .setStyle(1)
                                .setRequired(true)
                                .setPlaceholder("150.50")
                        )
                    )
                );

                // Armazenar dados temporários
                const userKey = `pedido_temp_${interaction.user.id}`;
                const tempData = { servico: servicoCustom, descricao };
                
                // Usar um in-memory cache ou DB temporário
                client.pendingOrders = client.pendingOrders || {};
                client.pendingOrders[userKey] = tempData;
                setTimeout(() => delete client.pendingOrders[userKey], 300000); // 5 min

            } catch (error) {
                logger.error("Erro ao processar modal pedido_custom:", { error: error.message });
                await interaction.reply({
                    content: "❌ | Erro ao processar pedido.",
                    ephemeral: true
                }).catch(() => {});
            }
        }

        // Processar valor do pedido customizado
        if (interaction.isModalSubmit() && interaction.customId.startsWith("pedido_valor_")) {
            try {
                const valorText = interaction.fields.getTextInputValue("valor");
                const valor = parseFloat(valorText.replace(",", "."));

                if (isNaN(valor) || valor <= 0) {
                    return interaction.reply({
                        content: "❌ | Valor inválido. Use formato: 150.50",
                        ephemeral: true
                    });
                }

                // Recuperar dados temporários
                const userKey = `pedido_temp_${interaction.user.id}`;
                const tempData = client.pendingOrders?.[userKey];

                if (!tempData) {
                    return interaction.reply({
                        content: "❌ | Sessão expirou. Tente novamente.",
                        ephemeral: true
                    });
                }

                // Criar pedido
                const order = await createOrder(
                    interaction.user.id,
                    tempData.servico,
                    valor,
                    tempData.descricao
                );

                if (!order) {
                    return interaction.reply({
                        content: "❌ | Erro ao criar pedido. Tente novamente.",
                        ephemeral: true
                    });
                }

                // Limpar dados temporários
                delete client.pendingOrders[userKey];

                const embed = new EmbedBuilder()
                    .setColor("#00FF00")
                    .setTitle("✅ Pedido Customizado Criado com Sucesso!")
                    .addFields(
                        { name: "📦 ID do Pedido", value: order.orderId, inline: true },
                        { name: "🔐 Código Seguro", value: `\`${order.secureCode}\``, inline: true },
                        { name: "🛍 Serviço", value: tempData.servico, inline: false },
                        { name: "💰 Valor", value: `R$ ${valor.toFixed(2)}`, inline: true },
                        { name: "📌 Status", value: order.status, inline: false },
                        { name: "⚠️ Próximos Passos", value: "1. Guarde seu código seguro\n2. Efetue o pagamento\n3. Aguarde confirmação", inline: false }
                    )
                    .setFooter({ text: "Use /verpedido para consultar o status" })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: false });

                // Enviar log
                await sendOrderLog(
                    interaction.client,
                    "📝 Novo Pedido Customizado Criado",
                    `Cliente <@${interaction.user.id}> criou um novo pedido: **${order.orderId}**`,
                    "#0099FF",
                    [
                        { name: "🛍 Serviço", value: tempData.servico, inline: true },
                        { name: "💰 Valor", value: `R$ ${valor.toFixed(2)}`, inline: true }
                    ]
                );

                logger.success(`Pedido customizado criado: ${order.orderId}`);

            } catch (error) {
                logger.error("Erro ao processar modal pedido_valor:", { error: error.message });
                await interaction.reply({
                    content: "❌ | Erro ao processar pagamento.",
                    ephemeral: true
                }).catch(() => {});
            }
        }
    }
};
