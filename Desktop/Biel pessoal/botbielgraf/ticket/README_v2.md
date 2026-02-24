# 🤖 BielGraf Bot - Sistema de Tickets Discord v2.0

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Status](https://img.shields.io/badge/status-active-success)
![Tests](https://img.shields.io/badge/tests-51%2F51-brightgreen)
![Node](https://img.shields.io/badge/node-v14%2B-green)

Um bot Discord profissional e seguro para gerenciamento de tickets com sistema de anti-abuso, ranking e muito mais!

## ✨ Recursos

- 🎫 **Sistema de Tickets** - Criação, gerenciamento e fechamento automático
- 🛡️ **Anti-Abuso** - Rate limiting e proteção contra spam
- 📊 **Ranking** - Sistema de ranking de atendimento
- 🔐 **Segurança** - Validação robusta e logging estruturado
- ⚡ **Performance** - Otimizado com cache e cleanup automático
- 🎨 **Interface Profissional** - Embeds coloridos e responsivos
- 📝 **Logging** - Todos os eventos registrados com contexto
- 🧪 **100% Testado** - 51 testes automatizados

## 📋 Pré-requisitos

- Node.js v14+
- Discord Bot Token
- npm ou yarn

## 🚀 Instalação Rápida

### 1. Clone o repositório
```bash
cd botbielgraf/ticket
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
# Copiar exemplo
cp .env.example .env

# Editar .env
# TOKEN=seu_token_aqui
# OWNER_ID=seu_id_aqui
```

### 4. Teste o bot
```bash
npm test
```

### 5. Inicie o bot
```bash
npm start
```

## 📁 Estrutura do Projeto

```
ticket/
├── commands/                 # Comandos slash
│   ├── config/              # Comandos de configuração
│   ├── ranking/             # Comandos de ranking
│   └── ticket/              # Comandos de ticket
├── events/                  # Listeners de eventos
│   ├── bot/                # Eventos do bot
│   ├── config/             # Eventos de config
│   └── ticket/             # Eventos de ticket
├── handler/                 # Carregadores
│   ├── Events.js           # Carregador de eventos
│   └── index.js            # Carregador de comandos
├── util/                    # Utilitários
│   ├── logger.js           # Sistema de logging
│   ├── security.js         # Segurança e validação
│   ├── embeds.js           # Embeds profissionais
│   ├── helpers.js          # Funções auxiliares
│   ├── jsonDb.js           # Database JSON
│   └── ticketUtils.js      # Utilitários de ticket
├── db/                      # Database
│   ├── config.json         # Configurações
│   ├── antiabuso.json      # Anti-abuso
│   └── ... (outros)
├── logs/                    # Logs (criado automaticamente)
├── index.js                # Arquivo principal
├── package.json            # Dependências
└── IMPROVEMENTS.md         # Documentação de melhorias
```

## 🎮 Comandos Disponíveis

### Admin/Config
- `/antiabuso set` - Configurar limites anti-abuso
- `/antiabuso info` - Ver configuração de anti-abuso
- `/antiabuso reset` - Resetar dados de anti-abuso
- `/botconfig` - Configurações do bot
- `/prioridade` - Gerenciar prioridades
- `/resposta` - Gerenciar respostas automáticas

### Ranking
- `/rank` - Ver seu ranking
- `/rankadm` - Ver ranking total

### Tickets
- `/ticket` - Sistema de tickets

## 🔧 Novos Sistemas (v2.0)

### 1️⃣ Logger Estruturado
```javascript
const logger = require('./util/logger');

logger.success('Operação concluída');
logger.error('Erro crítico', { data: value });
logger.command(user, command, guild);
```
**Recursos:**
- Logs coloridos no console
- Persistência em arquivo (`logs/YYYY-MM-DD.log`)
- Contexto estruturado com JSON

### 2️⃣ Segurança Robusta
```javascript
const security = require('./util/security');

// Rate limiting automático
const check = security.validateCommand(interaction);
if (!check.proceed) return;

// Validação de entrada
const valid = security.validateInput(userInput, {
  maxLength: 100,
  minLength: 5
});
```
**Recursos:**
- Rate limiting (por usuário + guild)
- Validação de entrada
- Sistema de bloqueio
- Cleanup automático

### 3️⃣ Embeds Profissionais
```javascript
const embeds = require('./util/embeds');

// Automático com cores, footers, timestamps
embeds.successEmbed('Título', 'Descrição', {
  fields: [...],
  timestamp: true
});
```
**Tipos:**
- successEmbed, errorEmbed, warningEmbed, infoEmbed
- customEmbed, loadingEmbed, pageableEmbed

### 4️⃣ Helpers Utilitários
```javascript
const helpers = require('./util/helpers');

helpers.formatCurrency(1500);      // R$ 1.500,00
helpers.formatTime(3600000);       // 1h
helpers.truncate(text, 100);       // "texto..."
helpers.chunk(array, 25);          // Divide em pedaços
```

## 🧪 Testes

### Teste Completo (51 testes)
```bash
node test-complete-bot.js
```

Valida:
- ✅ Estrutura de pastas
- ✅ Carregamento de comandos (17)
- ✅ Carregamento de eventos
- ✅ Módulos utilitários
- ✅ Dependências
- ✅ Variáveis de ambiente
- ✅ Integridade de database

## 📚 Documentação

- **IMPROVEMENTS.md** - Todas as melhorias implementadas
- **MIGRATION_GUIDE.md** - Como melhorar seus comandos
- **BEST_PRACTICES.md** - Boas práticas e padrões

## 🔒 Segurança

### Rate Limiting
- 5 comandos por segundo (por usuário)
- 20 comandos por 5 segundos (por servidor)
- Cleanup automático de expirados

### Validação
- Input length validation
- Pattern matching
- Tipo checking
- Permissão verification

### Logging
- Todos os comandos registrados
- Contexto completo (user, guild, params)
- Erros com stack trace
- Arquivo de log persistente

## ⚡ Performance

- Cache automático
- Lazy loading de comandos
- Cleanup periódico
- Rate limit optimization

## 🎨 Exemplo de Comando Moderno

```javascript
const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../util/embeds');
const security = require('../../util/security');
const logger = require('../../util/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('exemplo')
    .setDescription('Seu comando')
    .addStringOption(o => o
      .setName('param')
      .setDescription('Descrição')
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(100)
    ),

  async execute(interaction) {
    try {
      const param = interaction.options.getString('param');

      // Validar
      const valid = security.validateInput(param);
      if (!valid.valid) return interaction.reply(embeds.errorEmbed('Erro', valid.error));

      // Fazer algo

      // Log
      logger.command(interaction.user.tag, 'exemplo', interaction.guild.name);

      // Responder
      return interaction.reply({
        embeds: [embeds.successEmbed('Sucesso', 'Feito!')],
        ephemeral: true
      });

    } catch (error) {
      logger.error('Erro em exemplo', { error: error.message });
      return interaction.reply(embeds.errorEmbed('Erro', 'Falha ao executar'));
    }
  }
};
```

## 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| Comandos | 17 |
| Eventos | 5 |
| Utilitários | 6 módulos |
| Testes | 51 |
| Taxa de Sucesso | 100% |
| Linhas de Código | ~5000+ |

## 🚀 Próximas Melhorias

- [ ] Cache com Redis
- [ ] Dashboard web
- [ ] Sistema de permissões granular
- [ ] i18n (múltiplos idiomas)
- [ ] Análise e relatórios
- [ ] Sistema de backups automáticos

## 🐛 Troubleshooting

### Comandos não aparecem
```bash
node test-complete-bot.js
```
Verifique se a saída mostra "Total de comandos carregados: 17"

### Bot não responde
1. Verifique TOKEN em .env
2. Verifique intents no cliente
3. Veja os logs em `logs/`

### Rate limit muito restritivo
Edite `util/security.js`:
```javascript
const RATE_LIMIT_MAX = 5; // Aumentar este número
```

## 📞 Suporte

- Verificar logs em: `logs/YYYY-MM-DD.log`
- Ler BEST_PRACTICES.md
- Ler MIGRATION_GUIDE.md

## 📄 Licença

ISC

## 👤 Autor

Desenvolvido com ❤️ para a comunidade Discord

---

**Versão:** 2.0.0  
**Data:** 23 de fevereiro de 2026  
**Status:** ✅ Totalmente Operacional
