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

        // Fallback: se soft-restart falhar em X ms, encerra o processo (espera que um process manager reinicie)
        const FALLBACK_MS = 10000;
        let fallback = setTimeout(() => {
            try { process.exit(0); } catch (e) { process.kill(process.pid); }
        }, FALLBACK_MS);

        try {
            // Tentar destruir o cliente e relogar (soft-restart)
            if (client && typeof client.destroy === 'function') {
                await client.destroy();
            }

            // Tentar relogar
            await client.login(token);

            // Quando o client emitir ready, limpar fallback e notificar
            client.once('ready', async () => {
                clearTimeout(fallback);
                try {
                    await interaction.followUp({ content: '✅ Reiniciado com sucesso (soft-restart).', ephemeral: true });
                } catch (e) { /* ignore */ }
            });
        } catch (err) {
            clearTimeout(fallback);
            try {
                await interaction.followUp({ content: `⚠️ Soft-restart falhou: ${err.message}. Saindo para reiniciar (fallback).`, ephemeral: true });
            } catch (e) { /* ignore */ }
            setTimeout(() => {
                try { process.exit(0); } catch (e) { process.kill(process.pid); }
            }, 2000);
        }
    }
};
