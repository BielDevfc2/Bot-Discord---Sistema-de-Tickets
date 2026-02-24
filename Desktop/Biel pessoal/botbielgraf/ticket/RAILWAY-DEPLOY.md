# 🚀 DEPLOYMENT RAILWAY - GUIA RÁPIDO

## ⚡ 30 Segundos Para Deploy

### Passo 1: Enviar para GitHub
```powershell
cd "C:\Users\Micro\Desktop\Biel pessoal\botbielgraf\ticket"

# Se não tiver git iniciado:
git init
git add .
git commit -m "Bot atualizado - Pronto para Railway"

# Se não tiver remote:
git remote add origin https://github.com/SEU_USUARIO/botbielgraf-ticket.git
git branch -M main

# Enviar para GitHub
git push -u origin main
```

### Passo 2: Conectar Railway (5 minutos)

1. **Acesse**: https://railway.app
2. **Login com GitHub** (mais fácil)
3. **New Project** → **Deploy from GitHub**
4. **Selecione o repositório**: `botbielgraf-ticket`
5. **Clique em Deploy** - Railway faz tudo automaticamente!

### Passo 3: Configurar Variáveis de Ambiente

Na dashboard do Railway:
1. Abra seu projeto
2. Vá em **Variables**
3. Adicione:

```
TOKEN = seu_token_do_bot
OWNER_ID = seu_id
EFI_CLIENT_ID = optional
EFI_CLIENT_SECRET = optional
EFI_PIX_KEY = optional
```

---

## ✅ Seu Bot Está Online 24/7!

### Verificar Status
- Railway Dashboard → Seu projeto → Activity/Logs
- Se ver "Listening on port..." = ✅ Online!

### Próximos Passos
- [ ] Teste os comandos no Discord
- [ ] Monitore os logs em real-time
- [ ] Configure alertas de erro (opcional)

---

## 🔧 Troubleshooting

### ❌ "Error: ENOENT: no such file or directory"
**Solução**: Certifique-se de que `.env` tem as variáveis corretas

### ❌ "Bot não responde"
**Solução**: Verifique o TOKEN em variáveis de ambiente (case-sensitive!)

### ❌ "Module not found"
**Solução**: Railway rodará `npm install` automaticamente. Aguarde ~2min na primeira vez

### ❌ "Sandbox API failed"
**Solução**: Se usar EFI, certifique-se que EFI_SANDBOX=true para testes

---

## 📊 Monitorar Aplicação

```bash
# Ver logs em tempo real
railway logs

# Redeployer
railway deploy

# Variáveis de ambiente
railway variables
```

---

## 💡 Dicas

✅ **Railway é grátis** para 1 projeto (5kg RAM, pronto para 1 bot)

✅ **Auto-redeploy** em cada push no GitHub (automático!)

✅ **SSL certifício** incluso (se usar domain)

✅ **Uptime 99.9%** garantido

✅ **Backup automático** de logs

---

## 🔐 Segurança

- ✅ Nunca commite o `.env` (está em `.gitignore`)
- ✅ Use variáveis no Railway, não localmente
- ✅ Railway criptografa automaticamente
- ✅ Logs são privados

---

**Seu bot está 100% pronto para Railway!** 🎉
