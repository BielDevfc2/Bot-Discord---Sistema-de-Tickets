const { SlashCommandBuilder } = require("discord.js");
const logger = require("../../util/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('🔄 [Apenas Dono] Reinicia o bot'),
    
    async execute(interaction) {
        if (interaction.user.id !== process.env.OWNER_ID) {
            return interaction.reply({
                content: `❌ | Você não tem permissão para executar este comando!`,
                ephemeral: true
            });
        }

        await interaction.reply({ content: '🔄 Tentando reinício suave (soft-restart)...', ephemeral: true });

        const token = process.env.TOKEN;
        if (!token) {
            await interaction.followUp({ content: '❌ TOKEN não configurado no servidor. Abortando.', ephemeral: true });
            return;
        }

        // Fallback: se soft-restart falhar em X ms, encerra o processo
        const FALLBACK_MS = 10000;
        let fallback = setTimeout(() => {
            process.exit(0);
        }, FALLBACK_MS);

        try {
            // Usar o client do próprio interaction
            const botClient = interaction.client;

            if (!botClient) {
                clearTimeout(fallback);
                return await interaction.followUp({ content: '❌ Cliente do bot não encontrado.', ephemeral: true });
            }

            // Tentar destruir o cliente atual
            try {
                await botClient.destroy();
                await new Promise(r => setTimeout(r, 1000));
            } catch (e) {
                logger.error('Erro ao destruir client:', e.message);
            }

            // Tentar relogar
            await botClient.login(token);

            // Quando o client emitir ready, limpar fallback e notificar
            botClient.once('ready', async () => {
                clearTimeout(fallback);
                try {
                    await interaction.followUp({ content: '✅ Reiniciado com sucesso (soft-restart).', ephemeral: true });
                } catch (e) {
                    logger.error('Erro ao notificar sucesso:', e.message);
                }
            });
        } catch (err) {
            clearTimeout(fallback);
            logger.error('Erro no soft-restart:', err.message);
            try {
                await interaction.followUp({ content: `⚠️ Soft-restart falhou: ${err.message}. Saindo para reiniciar (fallback).`, ephemeral: true });
            } catch (e) {
                logger.error('Erro ao notificar falha:', e.message);
            }
            process.exit(0);
        }
    }
};
