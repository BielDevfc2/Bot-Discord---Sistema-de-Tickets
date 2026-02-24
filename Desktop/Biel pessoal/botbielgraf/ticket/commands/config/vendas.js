const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const salesUtils = require("../../util/salesUtils");
const { successEmbed, errorEmbed } = require("../../util/embeds");
const logger = require("../../util/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vendas')
        .setDescription('💰 Sistema de vendas e estatísticas')
        .addSubcommand(sc => sc.setName('criar-produto')
            .setDescription('Criar novo produto')
            .addStringOption(o => o.setName('nome').setDescription('Nome do produto').setRequired(true))
            .addNumberOption(o => o.setName('preco').setDescription('Preço em reais').setRequired(true).setMinValue(0.01))
            .addStringOption(o => o.setName('descricao').setDescription('Descrição').setRequired(true))
            .addIntegerOption(o => o.setName('estoque').setDescription('Quantidade em estoque').setRequired(true).setMinValue(0))
        )
        .addSubcommand(sc => sc.setName('listar-produtos')
            .setDescription('Listar todos os produtos')
        )
        .addSubcommand(sc => sc.setName('estatisticas')
            .setDescription('Ver estatísticas de vendas')
        )
        .addSubcommand(sc => sc.setName('top-clientes')
            .setDescription('Ver top 10 clientes')
        ),
    
    async execute(interaction) {
        // Verificar permissão
        const isOwner = interaction.user.id === process.env.OWNER_ID;
        const isStaff = interaction.member?.roles?.cache?.has(interaction.guild?.config?.cargo_staff);
        
        if (!isOwner && !isStaff) {
            return interaction.reply({
                embeds: [errorEmbed('Acesso Negado', 'Você não tem permissão para usar este comando.')],
                ephemeral: true
            });
        }
        
        const sub = interaction.options.getSubcommand();
        
        try {
            if (sub === 'criar-produto') {
                const nome = interaction.options.getString('nome');
                const preco = interaction.options.getNumber('preco');
                const descricao = interaction.options.getString('descricao');
                const estoque = interaction.options.getInteger('estoque');
                
                const id = `produto_${Date.now()}`;
                const produto = await salesUtils.produtos.criar(id, nome, preco, descricao, estoque);
                
                if (!produto) {
                    return interaction.reply({
                        embeds: [errorEmbed('Erro', 'Erro ao criar produto.')],
                        ephemeral: true
                    });
                }
                
                const embed = new EmbedBuilder()
                    .setTitle('✅ Produto Criado')
                    .addFields(
                        { name: 'Nome', value: produto.nome },
                        { name: 'Preço', value: `R$ ${produto.preco.toFixed(2)}` },
                        { name: 'Estoque', value: `${produto.estoque} unidades` },
                        { name: 'Descrição', value: produto.descricao }
                    )
                    .setColor('Green')
                    .setTimestamp();
                
                return interaction.reply({ embeds: [embed] });
            }
            
            else if (sub === 'listar-produtos') {
                const produtos = await salesUtils.produtos.listar();
                
                if (produtos.length === 0) {
                    return interaction.reply({
                        embeds: [errorEmbed('Nenhum Produto', 'Não há produtos cadastrados.')],
                        ephemeral: true
                    });
                }
                
                const embed = new EmbedBuilder()
                    .setTitle('📦 Lista de Produtos')
                    .setColor('Blue')
                    .setTimestamp();
                
                produtos.slice(0, 10).forEach(p => {
                    embed.addFields({
                        name: `${p.nome} - R$ ${p.preco.toFixed(2)}`,
                        value: `Estoque: ${p.estoque} | ${p.descricao}`,
                        inline: false
                    });
                });
                
                return interaction.reply({ embeds: [embed] });
            }
            
            else if (sub === 'estatisticas') {
                const stats = await salesUtils.estatisticas.obterVendas();
                
                const embed = new EmbedBuilder()
                    .setTitle('📊 Estatísticas de Vendas')
                    .addFields(
                        { name: 'Total de Vendas', value: `${stats.totalVendas || 0}`, inline: true },
                        { name: 'Total Recebido', value: `R$ ${(stats.totalRecebido || 0).toFixed(2)}`, inline: true },
                        { name: 'Entregues', value: `${stats.vendasEntregues || 0}`, inline: true },
                        { name: 'Pendentes', value: `${stats.vendoPendentes || 0}`, inline: true }
                    )
                    .setColor('Gold')
                    .setTimestamp();
                
                return interaction.reply({ embeds: [embed] });
            }
            
            else if (sub === 'top-clientes') {
                const topClientes = await salesUtils.estatisticas.obterTopClientes(10);
                
                if (topClientes.length === 0) {
                    return interaction.reply({
                        embeds: [errorEmbed('Nenhuma Venda', 'Não há vendas registradas ainda.')],
                        ephemeral: true
                    });
                }
                
                const embed = new EmbedBuilder()
                    .setTitle('🏆 Top 10 Clientes')
                    .setColor('Purple')
                    .setTimestamp();
                
                topClientes.forEach((cliente, i) => {
                    embed.addFields({
                        name: `#${i + 1} - <@${cliente.usuarioId}>`,
                        value: `Total gasto: R$ ${cliente.total.toFixed(2)} | Compras: ${cliente.quantidade}`,
                        inline: false
                    });
                });
                
                return interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            logger.error('Erro em vendas', { error: error.message });
            return interaction.reply({
                embeds: [errorEmbed('Erro', `Erro ao processar comando: ${error.message}`)],
                ephemeral: true
            });
        }
    }
};
