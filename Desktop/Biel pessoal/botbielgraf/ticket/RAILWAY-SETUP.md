# 🚄 Railway Deploy - Documentação Completa

## 📋 Índice

1. [Setup Inicial](#-setup-inicial)
2. [Deploy](#-deploy) 
3. [Configuração de Variáveis](#-configuração-de-variáveis)
4. [Monitoramento](#-monitoramento)
5. [Troubleshooting](#-troubleshooting)
6. [FAQ](#-faq)

---

## 🔧 Setup Inicial

### Pré-requisitos

- ✅ Conta no [GitHub](https://github.com)
- ✅ Conta no [Railway](https://railway.app)
- ✅ Bot criado no [Discord Developer Portal](https://discord.com/developers)
- ✅ TOKEN do bot e OWNER_ID

### 1. Preparar Código Local

```powershell
cd "C:\Users\Micro\Desktop\Biel pessoal\botbielgraf\ticket"

# Inicializar Git (se não estiver inicializado)
git init
git config user.email "seu_email@gmail.com"
git config user.name "Seu Nome"

# Adicionar todos os arquivos
git add .

# Criar primeiro commit
git commit -m "Bot inicial - Pronto para Railway"
```

### 2. Conectar ao GitHub

```powershell
# Se não tiver repositório no GitHub, crie um:
# 1. Vá em github.com → New Repository
# 2. Nome: botbielgraf-ticket
# 3. Clique "Create Repository"

# Conectar repositório local
git remote add origin https://github.com/SEU_USUARIO/botbielgraf-ticket.git
git branch -M main

# Fazer push
git push -u origin main
```

---

## 🚀 Deploy

### Método 1: Dashboard Web (Recomendado)

1. **Acesse**: https://railway.app
2. **Login com GitHub**:
   - Clique "Start Free"
   - Authorize Railway GitHub App
   - Selecione "All repositories" ou específico

3. **New Project**:
   - Clique "New Project"
   - "Deploy from GitHub"
   - Selecione `botbielgraf-ticket`
   - Clique "Deploy Now"

4. **Aguarde ~3 minutos**:
   - Railway buildará e iniciará o bot automaticamente
   - Você verá logs em tempo real

### Método 2: Railway CLI

```powershell
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railroad init
railway up
```

---

## 🔐 Configuração de Variáveis

### Passo 1: Acessar Variáveis

1. Dashboard Railway
2. Seu projeto → Variables
3. Define as variáveis

### Variáveis Obrigatórias

```
TOKEN = MTQ2M... (seu token aqui)
OWNER_ID = 1215492... (seu ID aqui)
```

### Variáveis Opcionais

```
EFI_CLIENT_ID = Client_Id_...
EFI_CLIENT_SECRET = Client_Secret_...
EFI_SANDBOX = true
EFI_PIX_KEY = seu_email@gmail.com
DATABASE_URL = postgresql://...
NODE_ENV = production
```

### Onde Obter TOKEN

1. Vá em [Discord Developer Portal](https://discord.com/developers/applications)
2. Seu aplicativo → Bot → Copy Token
3. Cole em Railway Variables

### Onde Obter OWNER_ID

1. Discord: Habilite Modo de Desenvolvedor (User Settings → Advanced)
2. Clique direito no seu perfil
3. "Copy User ID"
4. Cole em Railway Variables

---

## 📊 Monitoramento

### Logs em Tempo Real

**No Dashboard**:
- Seu Projeto → Logs
- Veja tudo que seu bot está fazendo

### Alertas Automáticos

1. Vá em Settings
2. Alerts
3. Configure email para erros

### Verificar Bot Online

```discord
/status
ou
/ping
```

Se responder = ✅ Online!

---

## 🔧 Troubleshooting

### ❌ Bot não aparece online

**Verificação 1: TOKEN Correto**
- Vá em Variables
- Confirme TOKEN está exato (case-sensitive)
- Redeploy: Menu (⋮) → Redeploy

**Verificação 2: Logs de Erro**
- Dashboard → Logs
- Procure por "ERROR" ou "Exception"
- Google o erro específico

**Verificação 3: Permissões no Discord**
- Developer Portal → Bot → Intents
- Ative: "Message Content Intent"
- Ative: "Server Members Intent"
- Invente bot novamente

### ❌ "Build failed"

```
Solução: 
1. Verifique se package.json e index.js existem
2. Railway tentará novamente automaticamente
3. Pode levar até 5 minutos na primeira vez
```

### ❌ "Crashed due to memory"

```
Solução:
1. Railway gratuito = 512MB RAM
2. Se usar muitos comandos e dados, é suficiente
3. Para mais, upgrade para $5/mês
```

### ❌ "Module not found: discord.js"

```
Solução:
1. Railway instala package.json automaticamente
2. Aguarde build completar (veja nos logs)
3. Se não funcionar: Railway → Redeploy
```

---

## 📈 Performance

### Informações do Projeto

```
Limite Gratuito:
- CPU: Compartilhado
- RAM: 512MB (suficiente para 1 bot)
- Storage: 100GB
- Fora/mês: 500GB
- Uptime: 99.9%
```

### Otimizar Bot

```javascript
// 1. Lazy-load de módulos
const vendasUtils = () => require('./util/salesUtils');

// 2. Cache de dados frequentes
const cache = new Map();

// 3. Limitar logs em produção
if (process.env.NODE_ENV !== 'production') {
    logger.debug(...);
}
```

---

## 🔄 Atualizar Bot

### Após fazer mudanças locais

```powershell
# Fazer mudanças nos arquivos
# ...

# Fazer commit
git add .
git commit -m "Descrição da mudança"

# Push para GitHub
git push origin main

# Railway detecta automaticamente e redeploy!
# Leva ~2-3 minutos
```

---

## 🆘 Suporte & Resources

### Documentação Oficial
- [Railway Docs](https://docs.railway.app)
- [Discord.js Guide](https://discordjs.guide)

### Comunidades
- [Railway Discord Community](https://railway.app/chat)
- [Discord.js Support](https://discord.gg/djs)

### Seu Projeto
- Dashboard: https://railway.app/project/seu-projeto
- Logs: Dashboard → Logs (em tempo real)
- Redeploy: Dashboard → Menu (⋮) → Redeploy

---

## ✅ Checklist de Deploy

- [ ] Code está no GitHub
- [ ] TOKEN configurado em Railway Variables
- [ ] OWNER_ID configurado em Railway Variables
- [ ] Logs mostram "Ready" ou semelhante
- [ ] Bot aparece online no Discord
- [ ] Comandos respondem quando chamados
- [ ] Nenhum erro nos logs últimos 5 minutos

---

## 🎉 Sucesso!

Seu bot agora está:
- ✅ Online 24/7
- ✅ Auto-deployável via GitHub
- ✅ Com logs em tempo real
- ✅ Grátis (até certain limites)
- ✅ Pronto para escalar

**Bem-vindo à nuvem!** 🚀
