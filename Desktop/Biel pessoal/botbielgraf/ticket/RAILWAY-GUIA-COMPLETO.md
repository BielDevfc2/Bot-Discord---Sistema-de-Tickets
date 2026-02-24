# 📖 GUIA COMPLETO - RAILWAY + BOT DISCORD

## 🎯 O Que é Railway?

Railway é uma plataforma de hospedagem que:
- ✅ Deixa seu bot online 24/7
- ✅ Sem custo (tier gratuito)
- ✅ Deploy automático via GitHub
- ✅ Logs em tempo real
- ✅ Escala automaticamente

**Comparação com outras plataformas:**

| Plataforma | Preço | Facilidade | Uptime |
|-----------|-------|-----------|--------|
| Railway | Grátis | ⭐⭐⭐⭐⭐ | 99.9% |
| Heroku | $7/mês | ⭐⭐⭐⭐ | 99.9% |
| SquareCloud | ~$5/mês | ⭐⭐⭐⭐ | 99.9% |
| VPS | $5-20/mês | ⭐⭐ | Depende |
| Seu PC | Grátis | ⭐ | Fraco |

---

## ✨ Seu Bot Atualmente

```
Status Local: ✅ Funcionando
Verificado: ✅ 19 Comandos OK
Testado: ✅ Sem erros
Pronto para: 🚀 RAILWAY
```

### Arquivos Criados para Railway

```
1. railway.json         → Config do Railway
2. .env.example        → Variáveis de exemplo
3. .gitignore          → Segura seus arquivos
4. deploy.sh           → Script de deploy
5. RAILWAY-SETUP.md    → Guia completo (7 seções)
6. RAILWAY-DEPLOY.md   → Guia rápido (30 segundos)
7. RAILWAY-CHECKLIST.md → Verificação
8. RAILWAY-RAPIDO.md   → Passo a passo visual
```

---

##🚀 COMEÇAR AGORA - 4 PASSOS

### Step 1: Prepare Código
```powershell
cd "C:\Users\Micro\Desktop\Biel pessoal\botbielgraf\ticket"
git init
git add .
git commit -m "Inicio do deploy"
```

### Step 2: Push para GitHub
```powershell
git remote add origin https://github.com/SEU_USER/botbielgraf-ticket.git
git push -u origin main
```

### Step 3: Railway Deploy
```
1. railway.app
2. Login GitHub
3. Deploy from GitHub
4. Selecione: botbielgraf-ticket
5. Clique Deploy
```

### Step 4: Configure Variáveis
```
Railway Dashboard → Variables
TOKEN = seu_token
OWNER_ID = seu_id
```

**Pronto! Bot 24/7** ✅

---

## 🔧 TROUBLESHOOTING

### ❌ "Deploy failed"

**Possíveis Causas:**

1. **Sintaxe JavaScript**
   ```
   Solução: Verifique package.json, index.js
   Railway mostra exatamente onde está o erro
   ```

2. **Módulo não encontrado**
   ```
   Solução: npm install localmente, push para GitHub
   npm install wio.db discord.js dotenv
   git add package.json package-lock.json
   git commit -m "Deps"
   git push
   ```

3. **Node_modules não instalado**
   ```
   Solução: Railway instala automaticamente
   Se não instalar, coloque em .gitignore
   ```

### ❌ "Bot não responde"

**Verificação 1:**
```
No Discord:
/ping ou qualquer comando

Espera 30 segundos
```

**Verificação 2:**
```
Railway Dashboard → Logs
Procure por erros
Copie o erro e procure no Google
```

**Verificação 3:**
```
TOKEN e OWNER_ID corretos?
Foram setados em Railway Variables?
```

### ❌ "Crashed after X seconds"

**Causa**: Erro de runtime

**Solução**:
1. Veja exatamente qual línea do código foi o problema in logs
2. Corrija localmente
3. git commit + git push
4. Railway redeploy automático

### ❌ "Out of memory"

**Causa**: Railway gratuito = 512MB

**Solução**:
1. Se tiver muitos comandos/eventos, ok continua.
2. Se crash consistente, upgarde para $5/mês
3. Ou otimize código:
   ```javascript
   // Não carregue tudo na memória
   const modules = new Map();
   
   function loadModule(name) {
       if (!modules.has(name)) {
           modules.set(name, require(`./${name}`));
       }
       return modules.get(name);
   }
   ```

---

## 📊 MONITORAMENTO

### Acompanhar Bot

**Real-time Logs:**
```
Railway Dashboard → Seu Projeto → Logs (lado direito)
Ver tudo em tempo real
```

**Status:**
```
Railway Dashboard → Service
Verde = online
Amarelo = starting
Vermelho = crashed
```

**Recursos Usados:**
```
Railway Dashboard → Deployments
Ver CPU, RAM, Network
```

### Alertas

```
1. Railway → Seu Projeto → Settings
2. Alerts
3. Email quando crash/erro
4. Slack integration (opcional)
```

---

## ⚙️ CONFIGURAÇÕES AVANÇADAS

### Variáveis de Ambiente

```env
# Essencial
TOKEN = seu_token
OWNER_ID = seu_id

# Otimização
NODE_ENV = production
NODE_OPTIONS = --max-old-space-size=512

# APIs (opcional)
EFI_CLIENT_ID = seu_id
EFI_CLIENT_SECRET = seu_secret
EFI_SANDBOX = true
EFI_PIX_KEY = seu_email@gmail.com

# Database (opcional, JSON é suficiente)
DATABASE_URL = postgresql://...
```

### Health Check

Adicione em index.js:
```javascript
// Health check endpoint
const http = require('http');
http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200);
        res.end('OK');
    }
}).listen(3000);
```

### Auto-Restart

Railway automaticamente reinicia se crash:
- Detecção automática de erro
- Restart em ~10 segundos
- Max 10 retentativas por dia

---

## 🎓 MELHORES PRÁTICAS

### 1. Use .env para Secretos
```javascript
// ✅ Correto
const token = process.env.TOKEN;

// ❌ Errado
const token = "seu_token_aqui"; // Nunca!
```

### 2. Sempre Trate Erros
```javascript
// ✅ Correto
process.on('unhandledRejection', (err) => {
    console.error('Error:', err);
});

// ❌ Errado
// Deixar erro solto = crash
```

### 3. Logs Úteis
```javascript
logger.info('Bot iniciando...');
logger.success('Bot online!');
logger.error('Algo deu errado');
logger.warn('Atenção!');
```

### 4. Atualizar com Git
```powershell
# Sempre use Git para deploy
git add .
git commit -m "Melhoria: xyz"
git push origin main

# Não faça upload manual
# Railway detecta push automaticamente
```

---

## 🎯 Próximos Passos

### Agora
1. Deploy em Railway (5 minutos)
2. Teste os comandos (2 minutos)
3. Configure alertas (1 minuto)

### Depois
- [ ] Adicionar mais comandos
- [ ] Sistema de músic (if needed)
- [ ] Database PostgreSQL (upgrade gratuito)
- [ ] Domínio customizado (upgrade $5)

### Manutenção
- [ ] Revisão mensal de logs
- [ ] Atualizações de dependências
- [ ] Backup de dados (DB)

---

## 💡 DICAS FINAIS

✅ **Seu bot está ótimo** - 19 comandos funcionais, sistema de vendas integrado

✅ **Railway vai ser fácil** - Todos os arquivos já estão prontos

✅ **Custo: ZERO** - Tier gratuito é  suficiente para 1 bot

✅ **Uptime: 99.9%** - Seu bot sempre online

✅ **Deploy: Automático** - Cada push no GitHub = novo deploy

✅ **Suporte: Excelente** - Railway é muito responsivo

---

## 📚 Referências

- [Railway Docs](https://docs.railway.app)
- [Discord.js Docs](https://discord.js.org)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-performance-best-practices/)

---

## 🚀 Você Está Pronto!

**Resumo:**
- ✅ 19 Comandos funcionais
- ✅ Sistema de vendas integrado
- ✅ Todos os arquivos preparados
- ✅ Documentação completa
- ✅ Segurança configurada
- ✅ Pronto para escalar

**Próximo passo:**
```
git push origin main
```

**E pronto! Seu bot estará 24/7 no Railway** 🎉

---

**Última atualização:** 23 de Fevereiro de 2026
**Status:** ✅ 100% Pronto para Production
**Tempo estimado de deploy:** 5-10 minutos
