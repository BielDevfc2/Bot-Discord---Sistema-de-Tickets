/**
 * Sistema Inteligente de Pedidos
 * Gerencia pedidos com rastreamento, anti-golpe e histórico
 */

const { JsonDatabase } = require("wio.db");
const path = require("path");
const logger = require("./logger");

const ordersDB = new JsonDatabase({ databasePath: path.join(__dirname, "../db/orders.json") });

/**
 * Gera ID curto do pedido (ex: #BG-4821)
 */
function generateOrderId() {
    const hoje = new Date();
    const ano = String(hoje.getFullYear()).slice(-2);
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `BG-${random}`;
}

/**
 * Gera código seguro único (ex: BG-2026-02-24-A8K3L)
 */
function generateSecureCode() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let suffix = "";
    for (let i = 0; i < 5; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return `BG-${ano}-${mes}-${dia}-${suffix}`;
}

/**
 * Gera código de garantia/registro (ex: GAR-4821-BR)
 */
function generateGuaranteeCode(orderId) {
    const numericId = orderId.replace(/\D/g, "");
    return `GAR-${numericId}-BR`;
}

/**
 * Cria novo pedido
 */
async function createOrder(clienteId, servico, valor, descricao = "") {
    try {
        const orderId = generateOrderId();
        const secureCode = generateSecureCode();
        const hoje = new Date();
        
        // Determinar prioridade automaticamente
        const prioridade = valor >= 200 ? "Alta" : "Normal";
        
        const order = {
            orderId,
            secureCode,
            guaranteeCode: null,
            clienteId,
            servico,
            valor,
            descricao,
            prioridade,
            status: "Aguardando Pagamento",
            staffResponsavel: null,
            dataCriacao: hoje.toISOString().split("T")[0],
            dataPagamento: null,
            dataFinalizacao: null,
            notas: []
        };
        
        await ordersDB.set(`order_${secureCode}`, order);
        await ordersDB.set(`client_${clienteId}`, (await ordersDB.get(`client_${clienteId}`)) || [], (arr) => {
            arr.push(secureCode);
            return arr;
        });
        
        logger.success(`Pedido criado: ${orderId} (${secureCode})`);
        return order;
    } catch (error) {
        logger.error("Erro ao criar pedido", { error: error.message });
        return null;
    }
}

/**
 * Busca pedido pelo código seguro
 */
async function getOrderBySecureCode(secureCode) {
    try {
        return await ordersDB.get(`order_${secureCode}`);
    } catch (error) {
        logger.error("Erro ao buscar pedido", { error: error.message });
        return null;
    }
}

/**
 * Confirma pagamento e gera código de garantia
 */
async function confirmPayment(secureCode, staffId) {
    try {
        const order = await getOrderBySecureCode(secureCode);
        if (!order) return null;
        
        const hoje = new Date();
        const guaranteeCode = generateGuaranteeCode(order.orderId);
        
        order.status = "Pago";
        order.guaranteeCode = guaranteeCode;
        order.staffResponsavel = staffId;
        order.dataPagamento = hoje.toISOString().split("T")[0];
        
        await ordersDB.set(`order_${secureCode}`, order);
        logger.success(`Pagamento confirmado: ${secureCode} → ${guaranteeCode}`);
        
        return order;
    } catch (error) {
        logger.error("Erro ao confirmar pagamento", { error: error.message });
        return null;
    }
}

/**
 * Atualiza status do pedido
 */
async function updateOrderStatus(secureCode, newStatus) {
    try {
        const order = await getOrderBySecureCode(secureCode);
        if (!order) return null;
        
        order.status = newStatus;
        
        if (newStatus === "Finalizado") {
            const hoje = new Date();
            order.dataFinalizacao = hoje.toISOString().split("T")[0];
        }
        
        await ordersDB.set(`order_${secureCode}`, order);
        logger.success(`Status atualizado: ${secureCode} → ${newStatus}`);
        
        return order;
    } catch (error) {
        logger.error("Erro ao atualizar status", { error: error.message });
        return null;
    }
}

/**
 * Adiciona nota ao pedido
 */
async function addOrderNote(secureCode, author, texto) {
    try {
        const order = await getOrderBySecureCode(secureCode);
        if (!order) return null;
        
        const nota = {
            author,
            texto,
            timestamp: new Date().toISOString()
        };
        
        order.notas.push(nota);
        await ordersDB.set(`order_${secureCode}`, order);
        
        return order;
    } catch (error) {
        logger.error("Erro ao adicionar nota", { error: error.message });
        return null;
    }
}

/**
 * Obtém histórico de pedidos do cliente
 */
async function getClientOrders(clienteId) {
    try {
        const orderCodes = (await ordersDB.get(`client_${clienteId}`)) || [];
        const orders = [];
        
        for (const code of orderCodes) {
            const order = await ordersDB.get(`order_${code}`);
            if (order) orders.push(order);
        }
        
        return orders.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
    } catch (error) {
        logger.error("Erro ao buscar histórico", { error: error.message });
        return [];
    }
}

/**
 * Lista todos os pedidos (para dashboard staff)
 */
async function getAllOrders() {
    try {
        const all = await ordersDB.all();
        return all
            .filter(item => item.key.startsWith("order_"))
            .map(item => item.value)
            .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
    } catch (error) {
        logger.error("Erro ao listar pedidos", { error: error.message });
        return [];
    }
}

/**
 * Obtém estatísticas de vendas
 */
async function getSalesStats() {
    try {
        const orders = await getAllOrders();
        
        const stats = {
            total: orders.length,
            pendentes: orders.filter(o => o.status === "Aguardando Pagamento").length,
            pagos: orders.filter(o => o.status === "Pago").length,
            emProducao: orders.filter(o => o.status === "Em Produção").length,
            finalizados: orders.filter(o => o.status === "Finalizado").length,
            cancelados: orders.filter(o => o.status === "Cancelado").length,
            valorTotal: orders.reduce((sum, o) => sum + o.valor, 0),
            valorPago: orders
                .filter(o => o.status !== "Aguardando Pagamento" && o.status !== "Cancelado")
                .reduce((sum, o) => sum + o.valor, 0)
        };
        
        return stats;
    } catch (error) {
        logger.error("Erro ao calcular estatísticas", { error: error.message });
        return null;
    }
}

/**
 * Valida código de garantia
 */
async function validateGuaranteeCode(guaranteeCode) {
    try {
        const all = await getAllOrders();
        return all.find(o => o.guaranteeCode === guaranteeCode) || null;
    } catch (error) {
        logger.error("Erro ao validar código de garantia", { error: error.message });
        return null;
    }
}

/**
 * Envia log de event para canal privado (webhook)
 */
async function sendOrderLog(client, titulo, descricao, cor = "#0099FF", fields = []) {
    try {
        const configPath = path.join(__dirname, "../db/config.json");
        const configLocal = new JsonDatabase({ databasePath: configPath });
        
        const channelLogsId = await configLocal.get("channel_logs");
        if (!channelLogsId || channelLogsId === "Não Configurado") return;

        const channel = await client.channels.fetch(channelLogsId).catch(() => null);
        if (!channel || !channel.isTextBased()) return;

        const embed = new (require("discord.js").EmbedBuilder)()
            .setColor(cor)
            .setTitle(titulo)
            .setDescription(descricao)
            .setTimestamp();

        if (fields.length > 0) {
            embed.addFields(...fields);
        }

        await channel.send({ embeds: [embed] }).catch(() => {});
    } catch (error) {
        logger.warn("Erro ao enviar log de pedido", { error: error.message });
    }
}

module.exports = {
    ordersDB,
    generateOrderId,
    generateSecureCode,
    generateGuaranteeCode,
    createOrder,
    getOrderBySecureCode,
    confirmPayment,
    updateOrderStatus,
    addOrderNote,
    getClientOrders,
    getAllOrders,
    getSalesStats,
    validateGuaranteeCode,
    sendOrderLog
    getSalesStats,
    validateGuaranteeCode
};
