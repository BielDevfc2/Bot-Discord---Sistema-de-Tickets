# 📋 Boas Práticas - BielGraf Bot v2.0

## 🎯 Segurança

### ✅ Faça
- [ ] Sempre validar entrada do usuário
- [ ] Usar try/catch em todos os comandos
- [ ] Verificar permissões antes de executar
- [ ] Log de ações críticas com contexto
- [ ] Implementar rate limiting
- [ ] Usar ephemeral: true para respostas sensíveis

```javascript
// ✅ BOM
if (interaction.user.id !== process.env.OWNER_ID) {
  logger.warn('Acesso negado', { userId: interaction.user.id });
  return interaction.reply({ ephemeral: true, ... });
}
```

### ❌ Não Faça
- [ ] Confiar cegamente em input do usuário
- [ ] Deixar promises sem tratamento
- [ ] Expor dados sensíveis em logs públicos
- [ ] Usar commands globais sem verificação
- [ ] Guardar tokens em código

```javascript
// ❌ RUIM
if (interaction.options.getString('command') === 'admin') {
  // executar sem verificação
}
```

---

## 🚀 Performance

### ✅ Faça
- [ ] Cache resultados frequentes
- [ ] Use callbacks em vez de promises em massa
- [ ] Cleanup periódico de rate limits
- [ ] Lazy loading de módulos
- [ ] Batch operations quando possível

```javascript
// ✅ BOM - Cache
const cache = new Map();
function getData(id) {
  if (cache.has(id)) return cache.get(id);
  const data = fetchData(id);
  cache.set(id, data);
  return data;
}
```

### ❌ Não Faça
- [ ] Fazer queries ao DB em cada comando
- [ ] Guardar tudo na memória
- [ ] Sync operations em async context
- [ ] N+1 queries

```javascript
// ❌ RUIM - Sem cache
for (let i = 0; i < 1000; i++) {
  const data = await database.get(id); // 1000 queries!
}
```

---

## 📝 Logging

### ✅ Faça
- [ ] Log de sucesso, erro e aviso
- [ ] Include contexto relevante (userId, guildId)
- [ ] Use níveis apropriados (info, warn, error, debug)
- [ ] Incluir timestamps
- [ ] Log de ações do usuário

```javascript
// ✅ BOM
logger.command(
  interaction.user.tag,
  'antiabuso',
  interaction.guild.name,
  { action: 'set', max: 50, cooldown: 300 }
);
```

### ❌ Não Faça
- [ ] console.log sem estrutura
- [ ] Logs genéricos sem contexto
- [ ] Exposição de dados sensíveis (tokens, senhas)
- [ ] Spam de logs desnecessários

```javascript
// ❌ RUIM
console.log('Usuário tentou comando');
```

---

## 🎨 UX/UI

### ✅ Faça
- [ ] Usar embeds para respostas principais
- [ ] Cores consistentes (success=green, error=red)
- [ ] Fornecer feedback visual
- [ ] Mensagens claras e diretas
- [ ] Timestamps em operações
- [ ] Emojis apropriados

```javascript
// ✅ BOM
embeds.successEmbed(
  'Configurado',
  'Seu comando foi salvo com sucesso',
  { timestamp: true }
)
```

### ❌ Não Faça
- [ ] Respostas genéricas
- [ ] Cores aleatórias
- [ ] Mensagens técnicas ao usuário
- [ ] Sem feedback visual
- [ ] Emojis demais

```javascript
// ❌ RUIM
interaction.reply('ok')
```

---

## ⚙️ Código

### ✅ Faça
- [ ] Usar const/let (não var)
- [ ] Arrow functions quando apropriado
- [ ] Nomes descritivos de variáveis
- [ ] DRY - Don't Repeat Yourself
- [ ] Funções pequenas e focadas
- [ ] Comentários em lógica complexa

```javascript
// ✅ BOM
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const hasPermission = (user) => user.id === OWNER_ID || user.isStaff;
```

### ❌ Não Faça
- [ ] Usar var
- [ ] Variáveis com nomes genéricos (x, temp, data)
- [ ] Código duplicado
- [ ] Funções muito grandes
- [ ] Magic numbers sem explicação

```javascript
// ❌ RUIM
var x = 5;
if (x > 0 && a === "admin") { // Magic number
  // fazer algo
}
```

---

## 📫 Tratamento de Erro

### ✅ Faça
- [ ] Try/catch em operações perigosas
- [ ] Responder ao usuário com mensagem clara
- [ ] Log do erro com stack trace
- [ ] Graceful degradation
- [ ] Timeout handling

```javascript
// ✅ BOM
try {
  await operation();
} catch (error) {
  logger.error('Operação falhou', { 
    error: error.message,
    stack: error.stack 
  });
  
  interaction.reply({
    embeds: [errorEmbed('Erro', 'A operação falhou. Tente novamente.')],
    ephemeral: true
  });
}
```

### ❌ Não Faça
- [ ] Ignorar errors silenciosamente
- [ ] Deixar unhandled rejections
- [ ] Expor stack trace ao usuário
- [ ] Sem timeout em operações longas

```javascript
// ❌ RUIM
await operation(); // sem try/catch
```

---

## 🔄 Versionamento de Dados

### ✅ Faça
- [ ] Versionamento de schema do DB
- [ ] Migration scripts
- [ ] Backup antes de mudanças
- [ ] Log de mudanças estruturais

```javascript
// ✅ BOM
const data = {
  version: 2,
  user: { /* ... */ }
};
```

### ❌ Não Faça
- [ ] Mudanças diretas na estrutura
- [ ] Sem backup
- [ ] Estruturas inconsistentes

---

## 🧪 Testes

### ✅ Faça
- [ ] Executar `test-complete-bot.js` antes de deploy
- [ ] Testar cada comando novo
- [ ] Testar edge cases
- [ ] Verificar logs após operação

```bash
node test-complete-bot.js
```

---

## 📱 Comandos Slash

### ✅ Faça
- [ ] Descrição clara e concisa
- [ ] Opções com minLength/maxLength
- [ ] Usar choices quando apropriado
- [ ] Exemplo de uso na descrição
- [ ] Ephemeral para respostas sensíveis

```javascript
// ✅ BOM
.addStringOption(o => o
  .setName('email')
  .setDescription('Email para validar')
  .setRequired(true)
  .setMinLength(5)
  .setMaxLength(100)
)
```

### ❌ Não Faça
- [ ] Descrições vagas
- [ ] Sem limites de entrada
- [ ] Muitas opções (max 25)
- [ ] Nomes de comando confusos

---

## 🌐 Internacionalização (Futuro)

### Preparação para i18n
```javascript
// Prepare now para traduzir depois
const messages = {
  'en': { success: 'Success!' },
  'pt-BR': { success: 'Sucesso!' }
};

function getMessage(key, lang = 'pt-BR') {
  return messages[lang][key];
}
```

---

## 📜 Checklist de Deploy

- [ ] Ran `test-complete-bot.js` - 100% pass
- [ ] Todos os comandos têm try/catch
- [ ] Logging implementado
- [ ] Embeds profissionais
- [ ] Validação de entrada
- [ ] No console.log() restante
- [ ] Sem dados sensíveis nos logs
- [ ] Rate limiting ativo
- [ ] .env configurado
- [ ] Migrations de DB aplicadas
- [ ] Backup realizado
- [ ] Documentação atualizada

---

## 🔗 Referências

- **Discord.js Docs:** https://discord.js.org
- **Node.js Best Practices:** https://nodejs.org
- **Security:** OWASP Top 10

---

## 📞 Suporte

Dúvidas? Segue as boas práticas acima e seu bot será profissional e seguro! 🚀
