const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const logger = require("../../util/logger");
const path = require("path");
const { listBackups, restoreFromBackup, getBackupsSummary } = require("../../util/backupSystem");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recuperarbackup')
        .setDescription('🔄 Recuperar configurações de um backup anterior')
        .addNumberOption(option =>
            option
                .setName('numero')
                .setDescription('Número do backup a restaurar (1 = mais recente)')
                .setRequired(false)
                .setMinValue(1)
        ),

    async execute(interaction) {
        try {
            // Verificar permissão (apenas admin ou owner)
            const configDB = new (require('wio.db').JsonDatabase)({ databasePath: require('path').join(__dirname, '../../db/config.json') });
            const cargoAdmin = await configDB.get('cargo_staff');
            const isAdmin = interaction.member?.permissions.has('Administrator') || 
                           interaction.member?.roles?.cache?.has(cargoAdmin) ||
                           interaction.user.id === process.env.OWNER_ID;
            
            if (!isAdmin) {
                return interaction.reply({
                    content: '❌ | Apenas administradores podem usar este comando.',
                    ephemeral: true
                });
            }

            const backupIndex = interaction.options.getNumber('numero');
            let backups = [];
            try {
                backups = listBackups() || [];
            } catch (e) {
                logger.warn('Erro ao listar backups', { error: e.message });
            }

            // Se não há backups
            if (!backups || backups.length === 0) {
                return interaction.reply({
                    content: '❌ | Nenhum backup disponível no momento.',
                    ephemeral: true
                });
            }

            // Se usuário especificou um número
            if (backupIndex && typeof backupIndex === 'number') {
                if (backupIndex > backups.length) {
                    return interaction.reply({
                        content: `❌ | Backup #${backupIndex} não existe. Máximo: ${backups.length}`,
                        ephemeral: true
                    });
                }

                const selected = backups[backupIndex - 1];
                const date = new Date(selected.date);
                const dateStr = date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR");

                const confirmEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('⚠️ Confirmar Restauração')
                    .setDescription(`Você está prestes a restaurar uma versão anterior do config.json`)
                    .addFields(
                        { name: '📦 Backup', value: `#${backupIndex} - ${selected.filename}`, inline: false },
                        { name: '📅 Data', value: dateStr, inline: false },
                        { name: '💾 Tamanho', value: `${selected.size}KB`, inline: false },
                        { name: '🏷️ Motivo', value: selected.reason || 'desconhecido', inline: false },
                        { name: '⚠️ Aviso', value: 'A configuração atual será salva como backup antes da restauração.', inline: false }
                    )
                    .setFooter({ text: 'Esta ação não pode ser desfeita diretamente, mas será criado um novo backup' });

                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`restore_${backupIndex}`)
                            .setLabel('✅ Confirmar Restauração')
                            .setStyle('Success'),
                        new ButtonBuilder()
                            .setCustomId('cancel_restore')
                            .setLabel('❌ Cancelar')
                            .setStyle('Secondary')
                    );

                return interaction.reply({
                    embeds: [confirmEmbed],
                    components: [buttons],
                    ephemeral: true
                });
            }

            // Mostrar lista de backups
            const summaryEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('📊 Backups Disponíveis')
                .setDescription(getBackupsSummary())
                .setFooter({ text: 'Use /recuperarbackup <numero> para restaurar um backup' });

            return interaction.reply({
                embeds: [summaryEmbed],
                ephemeral: true
            });

        } catch (error) {
            logger.error("Erro em /recuperarbackup:", { error: error.message });
            await interaction.reply({
                content: `❌ | Erro ao processar comando: ${error.message}`,
                ephemeral: true
            }).catch(() => {});
        }
    }
};
