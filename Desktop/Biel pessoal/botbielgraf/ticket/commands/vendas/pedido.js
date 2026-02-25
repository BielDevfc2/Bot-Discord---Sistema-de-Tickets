const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder } = require("discord.js");
const logger = require("../../util/logger");
const { createOrder, sendOrderLog } = require("../../util/orderSystem");
const path = require("path");
const { JsonDatabase } = require("wio.db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pedido')
        .setDescription('💳 Criar novo pedido de serviço')
        .addStringOption(option =>
            option
                .setName('servico')
                .setDescription('Nome do serviço desejado')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addNumberOption(option =>
            option
                .setName('valor')
                .setDescription('Valor do serviço (ex: 120.50)')
                .setRequired(false)
                .setMinValue(1)
        ),

    async execute(interaction) {
        try {
            const configDB = new JsonDatabase({ databasePath: path.join(__dirname, "../../db/config.json") });
            const servico = interaction.options.getString('servico');
            const valor = interaction.options.getNumber('valor');

            // Se escolher "Outro", pedir mais informações via modal
            if (servico === 'Outro') {
                const modal = new ModalBuilder()
                    .setCustomId(`pedido_custom_${interaction.user.id}`)
                    .setTitle('📝 Criar Pedido Personalizado');

                const servicoInput = new TextInputBuilder()
                    .setCustomId('servico_custom')
                    .setLabel('Qual é o serviço desejado?')
                    .setStyle(1)
                    .setRequired(true)
                    .setMaxLength(100);

                const descricaoInput = new TextInputBuilder()
                    .setCustomId('descricao')
                    .setLabel('Descreva brevemente o que precisa')
                    .setStyle(2)
                    .setRequired(false)
                    .setMaxLength(500);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(servicoInput),
                    new ActionRowBuilder().addComponents(descricaoInput)
                );

                await interaction.showModal(modal).catch(err => {
                    logger.error("Erro ao mostrar modal", { error: err.message });
                });
                return;
            }

            // Se não forneceu valor para serviços pré-definidos, pedir no modal
            if (!valor) {
                const modal = new ModalBuilder()
                    .setCustomId(`pedido_valor_${interaction.user.id}`)
                    .setTitle('💰 Qual é o valor?');

                const valorInput = new TextInputBuilder()
                    .setCustomId('valor')
                    .setLabel('Valor do serviço (ex: 150.50)')
                    .setStyle(1)
                    .setRequired(true)
                    .setPlaceholder('150.50');

                modal.addComponents(new ActionRowBuilder().addComponents(valorInput));

                await interaction.showModal(modal).catch(err => {
                    logger.error("Erro ao mostrar modal de valor", { error: err.message });
                });
                return;
            }

            // Criar pedido com serviço e valor
            const order = await createOrder(
                interaction.user.id,
                servico,
                valor,
                ''
            );

            if (!order) {
                return interaction.reply({
                    content: '❌ | Erro ao criar pedido. Tente novamente.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Pedido Criado com Sucesso!')
                .addFields(
                    { name: '📦 ID do Pedido', value: order.orderId, inline: true },
                    { name: '🔐 Código Seguro', value: `\`${order.secureCode}\``, inline: true },
                    { name: '🛍 Serviço', value: servico, inline: false },
                    { name: '💰 Valor', value: `R$ ${order.valor.toFixed(2)}`, inline: true },
                    { name: '📅 Data', value: order.dataCriacao, inline: true },
                    { name: '📌 Status', value: order.status, inline: false },
                    { name: '⚠️ Próximos Passos', value: '1. Guarde seu código seguro\n2. Efetue o pagamento conforme instruções\n3. Aguarde confirmação do staff', inline: false }
                )
                .setFooter({ text: 'Use /verpedido para consultar o status' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: false });

            // Enviar log
            await sendOrderLog(
                interaction.client,
                '📝 Novo Pedido Criado',
                `Cliente <@${interaction.user.id}> criou um novo pedido: **${order.orderId}**`,
                '#0099FF',
                [
                    { name: '🛍 Serviço', value: servico, inline: true },
                    { name: '💰 Valor', value: `R$ ${order.valor.toFixed(2)}`, inline: true }
                ]
            );

            logger.success(`Pedido criado: ${order.orderId} (Cliente: ${interaction.user.tag})`);

        } catch (error) {
            logger.error("Erro em /pedido:", { error: error.message });
            await interaction.reply({
                content: `❌ | Erro ao processar comando: ${error.message}`,
                ephemeral: true
            }).catch(() => {});
        }
    },

    async autocomplete(interaction) {
        try {
            const configDB = new JsonDatabase({ databasePath: path.join(__dirname, "../../db/config.json") });
            
            // Obter serviços e garantir que é um array
            let servicos = configDB.get("servicos") || [];
            if (!Array.isArray(servicos)) {
                servicos = [];
            }
            
            // Mapear para strings e adicionar "Outro"
            const choices = servicos
                .map(s => typeof s === 'string' ? s : (s?.nome || s?.value || s?.label || ''))
                .filter(s => s.length > 0);
            choices.push('Outro');

            const focused = interaction.options.getFocused() || '';
            const filtered = choices.filter(choice => 
                choice.toLowerCase().startsWith(focused.toLowerCase())
            ).slice(0, 25); // Discord permite máximo 25 opções

            await interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice }))
            ).catch(err => {
                logger.warn("Erro ao responder autocomplete", { error: err.message });
            });
        } catch (error) {
            logger.error("Erro em autocomplete /pedido", { error: error.message });
            await interaction.respond([{ name: 'Outro', value: 'Outro' }]).catch(() => {});
        }
    }
};
