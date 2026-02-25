/**
 * Sistema Automático de Backup
 * Gerencia backups automáticos de config.json e outros arquivos críticos
 */

const fs = require("fs");
const path = require("path");
const logger = require("./logger");

const BACKUP_DIR = path.join(__dirname, "../db/backups");
const CONFIG_PATH = path.join(__dirname, "../db/config.json");
const MAX_BACKUPS = 50; // Manter últimos 50 backups

/**
 * Cria diretório de backups se não existir
 */
function initializeBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        logger.success("Diretório de backups criado");
    }
}

/**
 * Gera timestamp formatado (YYYY-MM-DD_HH-MM-SS)
 */
function getTimestamp() {
    const now = new Date();
    return now.toISOString()
        .replace(/T/, '_')
        .replace(/:/g, '-')
        .split('.')[0];
}

/**
 * Cria backup do config.json
 * @param {string} reason - Motivo do backup (ex: "comando /botconfig", "restauração")
 * @returns {string} - Caminho do arquivo criado
 */
function createConfigBackup(reason = "automático") {
    try {
        initializeBackupDir();

        if (!fs.existsSync(CONFIG_PATH)) {
            logger.warn("config.json não encontrado para backup");
            return null;
        }

        const timestamp = getTimestamp();
        const backupName = `config_${timestamp}.json`;
        const backupPath = path.join(BACKUP_DIR, backupName);

        // Ler arquivo atual
        const configContent = fs.readFileSync(CONFIG_PATH, "utf-8");
        const configData = JSON.parse(configContent);

        // Adicionar metadados
        const backup = {
            __metadata: {
                timestamp: new Date().toISOString(),
                reason: reason,
                backupVersion: "1.0"
            },
            ...configData
        };

        // Escrever backup
        fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), "utf-8");

        // Limpar backups antigos
        cleanOldBackups();

        logger.success(`Backup criado: ${backupName} (Motivo: ${reason})`);
        return backupPath;

    } catch (error) {
        logger.error("Erro ao criar backup", { error: error.message });
        return null;
    }
}

/**
 * Lista todos os backups disponíveis
 * @returns {Array} - Array com informações dos backups
 */
function listBackups() {
    try {
        initializeBackupDir();

        if (!fs.existsSync(BACKUP_DIR)) {
            return [];
        }

        const files = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('config_') && f.endsWith('.json'))
            .sort()
            .reverse() // Mais recentes primeiro
            .map((f, index) => {
                const filePath = path.join(BACKUP_DIR, f);
                const stats = fs.statSync(filePath);
                const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));

                return {
                    index: index + 1,
                    filename: f,
                    filepath: filePath,
                    date: stats.mtime,
                    reason: content.__metadata?.reason || "desconhecido",
                    timestamp: content.__metadata?.timestamp || "N/A",
                    size: Math.round(stats.size / 1024) // KB
                };
            });

        return files;

    } catch (error) {
        logger.error("Erro ao listar backups", { error: error.message });
        return [];
    }
}

/**
 * Restaura config.json de um backup
 * @param {number} backupIndex - Índice do backup (1 = mais recente)
 * @returns {boolean} - Sucesso da operação
 */
function restoreFromBackup(backupIndex) {
    try {
        const backups = listBackups();

        if (backupIndex < 1 || backupIndex > backups.length) {
            logger.warn(`Índice de backup inválido: ${backupIndex} (máximo: ${backups.length})`);
            return false;
        }

        const selectedBackup = backups[backupIndex - 1];

        // Criar backup do estado atual antes de restaurar
        createConfigBackup(`restauração (backup anterior: ${selectedBackup.filename})`);

        // Ler backup
        const backupContent = fs.readFileSync(selectedBackup.filepath, "utf-8");
        const backupData = JSON.parse(backupContent);

        // Remover metadados
        delete backupData.__metadata;

        // Restaurar para config.json
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(backupData, null, 2), "utf-8");

        logger.success(`Config restaurada do backup #${backupIndex}: ${selectedBackup.filename}`);
        return true;

    } catch (error) {
        logger.error("Erro ao restaurar backup", { error: error.message });
        return false;
    }
}

/**
 * Remove backups antigos, mantendo apenas os MAX_BACKUPS mais recentes
 */
function cleanOldBackups() {
    try {
        if (!fs.existsSync(BACKUP_DIR)) {
            return;
        }

        const files = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('config_') && f.endsWith('.json'))
            .sort()
            .reverse();

        if (files.length > MAX_BACKUPS) {
            const toDelete = files.slice(MAX_BACKUPS);
            toDelete.forEach(f => {
                const filePath = path.join(BACKUP_DIR, f);
                fs.unlinkSync(filePath);
                logger.debug(`Backup antigo removido: ${f}`);
            });
        }

    } catch (error) {
        logger.error("Erro ao limpar backups antigos", { error: error.message });
    }
}

/**
 * Obtém informações do backup mais recente
 * @returns {object|null} - Informações do backup ou null
 */
function getLatestBackup() {
    const backups = listBackups();
    return backups.length > 0 ? backups[0] : null;
}

/**
 * Cria backup automático (chamado periodicamente)
 * Apenas cria se houve mudanças
 */
function autoBackup() {
    try {
        const latest = getLatestBackup();
        const currentConfig = JSON.stringify(JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8")));

        if (latest) {
            const latestData = JSON.parse(fs.readFileSync(latest.filepath, "utf-8"));
            delete latestData.__metadata;
            const latestString = JSON.stringify(latestData);

            // Só cria novo backup se há mudanças
            if (currentConfig === latestString) {
                logger.debug("Nenhuma mudança detectada, backup pulado");
                return null;
            }
        }

        return createConfigBackup("backup automático");

    } catch (error) {
        logger.error("Erro em autoBackup", { error: error.message });
        return null;
    }
}

/**
 * Retorna resumo de backups em formato para embed Discord
 * @returns {string} - Texto formatado para embed
 */
function getBackupsSummary() {
    const backups = listBackups();

    if (backups.length === 0) {
        return "Nenhum backup disponível ainda.";
    }

    let summary = `📊 **Total de Backups:** ${backups.length}/${MAX_BACKUPS}\n\n`;
    summary += "**Últimos 5 Backups:**\n";

    backups.slice(0, 5).forEach(b => {
        const date = new Date(b.date);
        const dateStr = date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR");
        summary += `\`#${b.index}\` ${dateStr} | ${b.reason} (${b.size}KB)\n`;
    });

    return summary;
}

module.exports = {
    initializeBackupDir,
    createConfigBackup,
    listBackups,
    restoreFromBackup,
    getLatestBackup,
    autoBackup,
    getBackupsSummary
};
