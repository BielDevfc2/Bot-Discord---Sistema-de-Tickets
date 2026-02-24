# 🔄 Guia de Migração - Melhorando Seus Comandos

## Template Básico Modernizado

Use este template como referência para atualizar seus comandos:

```javascript
const { SlashCommandBuilder } = require('discord.js');
const { readJson, writeJson } = require('../../util/jsonDb');
const { successEmbed, errorEmbed, warningEmbed } = require('../../util/embeds');
const { validateInput } = require('../../util/security');
const logger = require('../../util/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('seu-comando')
    .setDescription('Descrição do seu comando')
    .addStringOption(o => o
      .setName('parametro')
      .setDescription('Descrição do parâmetro')
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(100)
    ),

  async execute(interaction) {
    try {
      // 1. Pegar parâmetros
      const param = interaction.options.getString('parametro');

      // 2. Validar entrada
      const validation = validateInput(param, {
        maxLength: 100,
        minLength: 1,
      });

      if (!validation.valid) {
        return interaction.reply({
          embeds: [errorEmbed('Entrada Inválida', validation.error)],
          ephemeral: true
        });
      }

      // 3. Verificar permissões (se necessário)
      if (interaction.user.id !== process.env.OWNER_ID) {
        logger.warn('Acesso negado', { 
          userId: interaction.user.id,
          command: 'seu-comando'
        });
        return interaction.reply({
          embeds: [errorEmbed('Permissão Negada', 'Você não tem acesso a este comando.')],
          ephemeral: true
        });
      }

      // 4. Lógica do comando
      // ... faça algo ...

      // 5. Responder com sucesso
      logger.command(
        interaction.user.tag,
        'seu-comando',
        interaction.guild.name,
        { parameter: param }
      );

      return interaction.reply({
        embeds: [successEmbed(
          'Operação Concluída',
          'Seu comando foi executado com sucesso!',
          {
            fields: [
              { name: 'Parâmetro', value: param, inline: false },
            ],
            timestamp: true
          }
        )],
        ephemeral: true
      });

    } catch (error) {
      logger.error('Erro ao executar seu-comando', {
        error: error.message,
        userId: interaction.user.id,
        stack: error.stack
      });

      return interaction.reply({
        embeds: [errorEmbed(
          'Erro ao Executar',
          'Algo deu errado. A equipe foi notificada.'
        )],
        ephemeral: true
      });
    }
  }
};
```

---

## 🎯 Checklist de Migração

Para cada comando que você quer melhorar:

- [ ] **Importe os módulos necessários**
  ```javascript
  const embeds = require('../../util/embeds');
  const security = require('../../util/security');
  const logger = require('../../util/logger');
  const helpers = require('../../util/helpers');
  ```

- [ ] **Adicione try/catch no execute()**
  ```javascript
  async execute(interaction) {
    try {
      // seu código aqui
    } catch (error) {
      logger.error('Erro', { error: error.message });
      // responder ao usuário
    }
  }
  ```

- [ ] **Substitua console.log por logger**
  ```javascript
  // ❌ Antes
  console.log('Comando executado');
  
  // ✅ Depois
  logger.success('Comando executado');
  logger.command(user, command, guild);
  ```

- [ ] **Substitua EmbedBuilder simples por funções do embeds.js**
  ```javascript
  // ❌ Antes
  new EmbedBuilder().setTitle('Erro').setColor('Red')...
  
  // ✅ Depois
  embeds.errorEmbed('Erro', 'Descrição detalhada')
  ```

- [ ] **Adicione validação de entrada**
  ```javascript
  const validation = security.validateInput(userInput);
  if (!validation.valid) return interaction.reply(validation.error);
  ```

- [ ] **Adicione metadata nos discord logs**
  ```javascript
  logger.command(interaction.user.tag, 'comando', guild.name, {
    param1: value1,
    param2: value2
  });
  ```

- [ ] **Adicione min/max nos options do SlashCommand**
  ```javascript
  .addStringOption(o => o
    .setName('texto')
    .setMinLength(1)
    .setMaxLength(100)
  )
  ```

- [ ] **Adicione fields nos embeds para mais contexto**
  ```javascript
  {
    fields: [
      { name: 'Opção 1', value: 'Valor', inline: true },
      { name: 'Opção 2', value: 'Valor', inline: true },
    ]
  }
  ```

---

## 📝 Exemplos Reais

### Exemplo 1: Comando simples - RANK

```javascript
const { SlashCommandBuilder } = require('discord.js');
const { infoEmbed } = require('../../util/embeds');
const logger = require('../../util/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('📊 Mostra seu ranking de atendimento'),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const userRank = 42; // simular busca no DB

      logger.command(
        interaction.user.tag,
        'rank',
        interaction.guild.name
      );

      return interaction.reply({
        embeds: [infoEmbed(
          'Seu Ranking',
          `Você está no ranking de atendimento!`,
          {
            fields: [
              { name: '🏆 Posição', value: `#${userRank}`, inline: true },
              { name: '⭐ Pontos', value: '1.250', inline: true },
            ],
            timestamp: true
          }
        )],
        ephemeral: true
      });
    } catch (error) {
      logger.error('Erro em rank', { error: error.message });
      return interaction.reply({
        content: '❌ Erro ao buscar ranking',
        ephemeral: true
      });
    }
  }
};
```

### Exemplo 2: Comando com validação - RESPOSTA

```javascript
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../util/embeds');
const { validateInput } = require('../../util/security');
const logger = require('../../util/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resposta')
    .setDescription('💬 Salva uma resposta automática')
    .addStringOption(o => o
      .setName('titulo')
      .setDescription('Título da resposta')
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(50)
    )
    .addStringOption(o => o
      .setName('mensagem')
      .setDescription('Conteúdo da resposta')
      .setRequired(true)
      .setMinLength(10)
      .setMaxLength(2000)
    ),

  async execute(interaction) {
    try {
      const title = interaction.options.getString('titulo');
      const message = interaction.options.getString('mensagem');

      // Validar
      let validation = validateInput(title, { minLength: 3, maxLength: 50 });
      if (!validation.valid) {
        return interaction.reply({
          embeds: [errorEmbed('Título Inválido', validation.error)],
          ephemeral: true
        });
      }

      validation = validateInput(message, { minLength: 10, maxLength: 2000 });
      if (!validation.valid) {
        return interaction.reply({
          embeds: [errorEmbed('Mensagem Inválida', validation.error)],
          ephemeral: true
        });
      }

      // Salvar... (sua lógica)
      logger.command(
        interaction.user.tag,
        'resposta',
        interaction.guild.name,
        { title, messageLength: message.length }
      );

      return interaction.reply({
        embeds: [successEmbed(
          'Resposta Salva',
          'Sua resposta automática foi cadastrada!',
          {
            fields: [
              { name: '📝 Título', value: title, inline: false },
              { name: '📏 Caracteres', value: String(message.length), inline: true },
            ],
            timestamp: true
          }
        )],
        ephemeral: true
      });

    } catch (error) {
      logger.error('Erro em resposta', { error: error.message });
      return interaction.reply({
        embeds: [errorEmbed('Erro', 'Ocorreu um erro ao salvar')],
        ephemeral: true
      });
    }
  }
};
```

---

## 🎓 Dicas Profissionais

### 1. Sempre use try/catch
```javascript
// Garante que erros não quebrem o bot
```

### 2. Log tudo importante
```javascript
logger.command(user, command, guild, extraData);
```

### 3. Validar SEMPRE
```javascript
const valid = security.validateInput(userInput);
if (!valid.valid) return;
```

### 4. Use embeds consistentes
```javascript
// Mesmo tema em todo o bot
embeds.successEmbed(...);
embeds.errorEmbed(...);
```

### 5. Adicione fields informativos
```javascript
fields: [
  { name: 'Quem', value: user.tag, inline: true },
  { name: 'Quando', value: new Date().toLocaleString(), inline: true },
]
```

---

## 📊 Antes e Depois

**Comando Antigo:**
- ❌ console.log sem contexto
- ❌ Sem tratamento de erro
- ❌ Embeds simples e inconsistentes
- ❌ Sem validação
- ❌ Código repetido

**Comando Novo:**
- ✅ Logging estruturado
- ✅ Try/catch robusto
- ✅ Embeds profissionais
- ✅ Validação completa
- ✅ Código limpo e reutilizável

---

## 🔗 Referências Rápidas

- **Logger:** `util/logger.js`
- **Security:** `util/security.js`
- **Embeds:** `util/embeds.js`
- **Helpers:** `util/helpers.js`
- **Exemplo:** `commands/config/antiabuso.js` (já melhorado!)

---

## 💡 Próximo Passo

Escolha **um comando** e melhore-o usando este guia. Depois aplique o padrão aos outros! 🚀
