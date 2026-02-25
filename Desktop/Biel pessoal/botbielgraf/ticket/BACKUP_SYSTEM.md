# 🔄 Sistema Automático de Backup

## O que foi implementado

Um **sistema completo de backup automático** para proteger suas configurações da perda de dados!

### 📁 Estrutura

- **`db/backups/`** - Pasta onde todos os backups são armazenados
- **`util/backupSystem.js`** - Motor de backup (304 linhas)
- **`commands/config/recuperarbackup.js`** - Comando para restaurar backups
- **27 comandos globais registrados** (novo: `/recuperarbackup`)

---

## 🚀 Como Usar

### Ver Backups Disponíveis
```
/recuperarbackup
```
Mostra os últimos 5 backups com:
- Data e hora exata
- Motivo do backup
- Tamanho em KB
- Número de identificação

### Restaurar um Backup Específico
```
/recuperarbackup numero:3
```
Restaura o backup #3 (onde 1 = mais recente)

O comando:
1. Mostra preview com informações do backup
2. Pede confirmação antes de restaurar
3. **Automaticamente faz backup do estado atual** (segurança extra)
4. Confirma sucesso com uma mensagem

---

## 🛡️ Proteção Integrada

O sistema faz **backup automático automaticamente** quando você:

### Alterações do Painel (`/botconfig`)
- ✅ Muda cor do painel
- ✅ Altera placeholder
- ✅ Modifica qualquer propriedade

### Gerenciamento de Serviços (`/vendas`)
- ✅ Adiciona novo serviço (`/adicionarservico`)
- ✅ Remove serviço (`/removerservico`)

### Histórico de Backups
- Mantém os **últimos 50 backups** automaticamente
- Remove backups antigos para não consumir espaço
- Cada backup registra o motivo da alteração

---

## 📊 Estrutura de um Backup

Cada arquivo de backup contém:
```json
{
  "__metadata": {
    "timestamp": "2026-02-24T15:30:45.123Z",
    "reason": "alteração de cor do painel",
    "backupVersion": "1.0"
  },
  "painel": { ... },
  "servicos": [ ... ],
  "botconfig": { ... }
  // ... resto do config.json
}
```

---

## 📋 Exemplo de Uso

### Cenário 1: Atualizou painel e quer voltar
```
1. Vê que o painel ficou errado
2. Digita /recuperarbackup
3. Vê a lista dos últimos 5 backups
4. Digita /recuperarbackup numero:1 (mais recente)
5. Confirma restauração
6. ✅ Painel voltar para como era!
```

### Cenário 2: Perdeu tudo como agora
```
1. Digita /recuperarbackup
2. Procura no histórico um backup de quando estava tudo certo
3. Executa /recuperarbackup numero:X
4. Tudo restaurado! ✅
```

---

## 🔐 Segurança

- **Backup antes de restaurar**: Quando você restaura um backup antigo, o estado atual é salvo como novo backup (você preserva tudo!)
- **Metadados**: Cada backup registra quando foi criado e por qual motivo
- **Apenas admins**: Apenas administradores podem restaurar backups
- **Histórico completo**: Você sempre pode navegar por qualquer backup antigo

---

## 💾 Localização dos Arquivos

```
db/
  └── backups/
      ├── config_2026-02-24_15-30-45.json  ← Mais recente (#1)
      ├── config_2026-02-24_15-20-12.json  
      ├── config_2026-02-24_14-50-33.json  
      └── ... (até 50 arquivos)
```

---

## ⚙️ Limites

- **Máximo de backups**: 50
- **Tamanho típico**: ~1-5 KB por backup
- **Limpeza automática**: Backups antigos são removidos quando excede 50
- **Nenhuma configuração necessária**: Funciona automaticamente! 🎯

---

## ✨ Benefícios

✅ **Nunca mais perde configurações** por acidente  
✅ **Recuperação em 1 clique**  
✅ **Histórico completo** com timestamps  
✅ **Totalmente automático**  
✅ **Apenas admins** podem restaurar (seguro)  
✅ **Backup seguro** ao restaurar (double-safe)  

---

**Seu painel agora está protegido! 🛡️**
