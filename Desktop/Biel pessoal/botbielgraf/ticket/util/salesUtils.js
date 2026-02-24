/**
 * Utilidades para Sistema de Vendas e Pagamentos
 * Integração com funcionalidades do AlienSales
 */

const { JsonDatabase } = require("wio.db");
const path = require("path");
const logger = require("./logger");

// Inicializar bancos de dados
const createDatabase = (name) => {
    return new JsonDatabase({ databasePath: `./db/${name}.json` });
};

const db = {
    produtos: createDatabase("produtos"),
    cupons: createDatabase("cupons"),
    pagamentos: createDatabase("pagamentos"),
    vendas: createDatabase("vendas"),
    usuarios: createDatabase("usuariosinfo"),
    giftcards: createDatabase("giftcards"),
};

/**
 * Sistema de Produtos
 */
const produtosUtils = {
    /**
     * Criar novo produto
     */
    criar: async (id, nome, preco, descricao, estoque) => {
        try {
            const produto = {
                id,
                nome,
                preco,
                descricao,
                estoque,
                criado_em: new Date(),
                ativo: true,
            };
            
            await db.produtos.set(`produto_${id}`, produto);
            logger.success(`Produto criado: ${nome}`);
            return produto;
        } catch (error) {
            logger.error("Erro ao criar produto", { error: error.message });
            return null;
        }
    },
    
    /**
     * Obter produto
     */
    obter: async (id) => {
        try {
            return await db.produtos.get(`produto_${id}`);
        } catch (error) {
            logger.error("Erro ao obter produto", { error: error.message });
            return null;
        }
    },
    
    /**
     * Listar todos os produtos
     */
    listar: async () => {
        try {
            const produtos = await db.produtos.all();
            return produtos.filter(p => p.key.startsWith("produto_")).map(p => p.value);
        } catch (error) {
            logger.error("Erro ao listar produtos", { error: error.message });
            return [];
        }
    },
    
    /**
     * Atualizar estoque
     */
    atualizarEstoque: async (id, quantidade) => {
        try {
            const produto = await db.produtos.get(`produto_${id}`);
            if (!produto) return false;
            
            produto.estoque = Math.max(0, produto.estoque + quantidade);
            await db.produtos.set(`produto_${id}`, produto);
            return true;
        } catch (error) {
            logger.error("Erro ao atualizar estoque", { error: error.message });
            return false;
        }
    },
};

/**
 * Sistema de Cupons
 */
const cupomsUtils = {
    /**
     * Criar cupom
     */
    criar: async (codigo, desconto, tipo = "percentual", maxUsos = null, dataExpiracao = null) => {
        try {
            const cupom = {
                codigo: codigo.toUpperCase(),
                desconto,
                tipo, // "percentual" ou "fixo"
                maxUsos,
                usos: 0,
                dataExpiracao,
                criado_em: new Date(),
                ativo: true,
            };
            
            await db.cupons.set(`cupom_${codigo.toUpperCase()}`, cupom);
            logger.success(`Cupom criado: ${codigo}`);
            return cupom;
        } catch (error) {
            logger.error("Erro ao criar cupom", { error: error.message });
            return null;
        }
    },
    
    /**
     * Validar e usar cupom
     */
    usar: async (codigo, valor) => {
        try {
            const cupom = await db.cupons.get(`cupom_${codigo.toUpperCase()}`);
            
            if (!cupom || !cupom.ativo) {
                return { valido: false, mensagem: "Cupom inválido ou expirado" };
            }
            
            if (cupom.maxUsos && cupom.usos >= cupom.maxUsos) {
                return { valido: false, mensagem: "Cupom limite de usos atingido" };
            }
            
            if (cupom.dataExpiracao && new Date(cupom.dataExpiracao) < new Date()) {
                return { valido: false, mensagem: "Cupom expirado" };
            }
            
            let desconto = 0;
            if (cupom.tipo === "percentual") {
                desconto = (valor * cupom.desconto) / 100;
            } else {
                desconto = cupom.desconto;
            }
            
            cupom.usos++;
            await db.cupons.set(`cupom_${codigo.toUpperCase()}`, cupom);
            
            return {
                valido: true,
                desconto,
                valorFinal: Math.max(0, valor - desconto),
            };
        } catch (error) {
            logger.error("Erro ao usar cupom", { error: error.message });
            return { valido: false, mensagem: "Erro ao processar cupom" };
        }
    },
};

/**
 * Sistema de Pagamentos
 */
const pagamentosUtils = {
    /**
     * Registrar pagamento
     */
    criar: async (usuarioId, valor, metodo, referencia, status = "pendente") => {
        try {
            const id = `${usuarioId}_${Date.now()}`;
            const pagamento = {
                id,
                usuarioId,
                valor,
                metodo, // "pix", "cartao", "boleto"
                referencia,
                status, // "pendente", "confirmado", "cancelado"
                criado_em: new Date(),
                confirmado_em: null,
            };
            
            await db.pagamentos.set(`pag_${id}`, pagamento);
            logger.success(`Pagamento registrado: ${id}`);
            return pagamento;
        } catch (error) {
            logger.error("Erro ao criar pagamento", { error: error.message });
            return null;
        }
    },
    
    /**
     * Confirmar pagamento
     */
    confirmar: async (id) => {
        try {
            const pagamento = await db.pagamentos.get(`pag_${id}`);
            if (!pagamento) return false;
            
            pagamento.status = "confirmado";
            pagamento.confirmado_em = new Date();
            await db.pagamentos.set(`pag_${id}`, pagamento);
            return true;
        } catch (error) {
            logger.error("Erro ao confirmar pagamento", { error: error.message });
            return false;
        }
    },
    
    /**
     * Obter pagamentos do usuário
     */
    obterDoUsuario: async (usuarioId) => {
        try {
            const pagamentos = await db.pagamentos.all();
            return pagamentos
                .filter(p => p.key.startsWith("pag_") && p.value.usuarioId === usuarioId)
                .map(p => p.value);
        } catch (error) {
            logger.error("Erro ao obter pagamentos", { error: error.message });
            return [];
        }
    },
};

/**
 * Sistema de Vendas
 */
const vendasUtils = {
    /**
     * Registrar venda
     */
    criar: async (usuarioId, produtoId, quantidade, valorTotal, status = "ativa") => {
        try {
            const id = `${usuarioId}_${produtoId}_${Date.now()}`;
            const venda = {
                id,
                usuarioId,
                produtoId,
                quantidade,
                valorTotal,
                status, // "ativa", "entregue", "cancelada"
                criado_em: new Date(),
                entregue_em: null,
            };
            
            await db.vendas.set(`venda_${id}`, venda);
            
            // Atualizar estoque
            await produtosUtils.atualizarEstoque(produtoId, -quantidade);
            
            logger.success(`Venda registrada: ${id}`);
            return venda;
        } catch (error) {
            logger.error("Erro ao criar venda", { error: error.message });
            return null;
        }
    },
    
    /**
     * Obter vendas do usuário
     */
    obterDoUsuario: async (usuarioId) => {
        try {
            const vendas = await db.vendas.all();
            return vendas
                .filter(v => v.key.startsWith("venda_") && v.value.usuarioId === usuarioId)
                .map(v => v.value);
        } catch (error) {
            logger.error("Erro ao obter vendas", { error: error.message });
            return [];
        }
    },
    
    /**
     * Marcar venda como entregue
     */
    marcarEntregue: async (id) => {
        try {
            const venda = await db.vendas.get(`venda_${id}`);
            if (!venda) return false;
            
            venda.status = "entregue";
            venda.entregue_em = new Date();
            await db.vendas.set(`venda_${id}`, venda);
            return true;
        } catch (error) {
            logger.error("Erro ao marcar venda entregue", { error: error.message });
            return false;
        }
    },
};

/**
 * Sistema de Estatísticas
 */
const estatisticasUtils = {
    /**
     * Obter estatísticas de vendas
     */
    obterVendas: async () => {
        try {
            const vendas = await db.vendas.all();
            const todasVendas = vendas.filter(v => v.key.startsWith("venda_")).map(v => v.value);
            
            return {
                totalVendas: todasVendas.length,
                totalRecebido: todasVendas.reduce((acc, v) => acc + v.valorTotal, 0),
                vendasEntregues: todasVendas.filter(v => v.status === "entregue").length,
                vendoPendentes: todasVendas.filter(v => v.status === "ativa").length,
            };
        } catch (error) {
            logger.error("Erro ao obter estatísticas", { error: error.message });
            return {};
        }
    },
    
    /**
     * Obter top clientes
     */
    obterTopClientes: async (limite = 10) => {
        try {
            const vendas = await db.vendas.all();
            const todasVendas = vendas.filter(v => v.key.startsWith("venda_")).map(v => v.value);
            
            const clientes = {};
            todasVendas.forEach(v => {
                if (!clientes[v.usuarioId]) {
                    clientes[v.usuarioId] = { total: 0, quantidade: 0 };
                }
                clientes[v.usuarioId].total += v.valorTotal;
                clientes[v.usuarioId].quantidade += v.quantidade;
            });
            
            return Object.entries(clientes)
                .map(([id, dados]) => ({ usuarioId: id, ...dados }))
                .sort((a, b) => b.total - a.total)
                .slice(0, limite);
        } catch (error) {
            logger.error("Erro ao obter top clientes", { error: error.message });
            return [];
        }
    },
};

/**
 * Sistema de Gift Cards
 */
const giftCardsUtils = {
    /**
     * Criar gift card
     */
    criar: async (codigo, valor, uso = "uma_vez") => {
        try {
            const giftcard = {
                codigo: codigo.toUpperCase(),
                valor,
                uso, // "uma_vez" ou "multiplo"
                usado_em: null,
                criado_em: new Date(),
                ativo: true,
            };
            
            await db.giftcards.set(`gc_${codigo.toUpperCase()}`, giftcard);
            logger.success(`Gift card criado: ${codigo}`);
            return giftcard;
        } catch (error) {
            logger.error("Erro ao criar gift card", { error: error.message });
            return null;
        }
    },
    
    /**
     * Usar gift card
     */
    usar: async (codigo, usuarioId) => {
        try {
            const giftcard = await db.giftcards.get(`gc_${codigo.toUpperCase()}`);
            
            if (!giftcard || !giftcard.ativo) {
                return { valido: false, mensagem: "Gift card inválido ou já utilizado" };
            }
            
            if (giftcard.uso === "uma_vez" && giftcard.usado_em) {
                return { valido: false, mensagem: "Gift card já foi utilizado" };
            }
            
            giftcard.usado_em = { usuarioId, data: new Date() };
            if (giftcard.uso === "uma_vez") {
                giftcard.ativo = false;
            }
            
            await db.giftcards.set(`gc_${codigo.toUpperCase()}`, giftcard);
            
            return {
                valido: true,
                valor: giftcard.valor,
                mensagem: `Gift card de R$ ${giftcard.valor} aplicado com sucesso!`,
            };
        } catch (error) {
            logger.error("Erro ao usar gift card", { error: error.message });
            return { valido: false, mensagem: "Erro ao processar gift card" };
        }
    },
};

module.exports = {
    db,
    produtos: produtosUtils,
    cupons: cupomsUtils,
    pagamentos: pagamentosUtils,
    vendas: vendasUtils,
    estatisticas: estatisticasUtils,
    giftcards: giftCardsUtils,
};
