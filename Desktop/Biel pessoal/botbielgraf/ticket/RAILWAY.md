# 🚀 Guia Railway Deploy - Seu Bot 24/7 Grátis

## ✅ Checklist Antes de Começar

- [ ] Projeto está em `C:\Users\Micro\Desktop\Biel pessoal\botbielgraf\ticket`
- [ ] Arquivo `.env.example` existe ✓
- [ ] `.gitignore` configurado ✓
- [ ] Bot testado localmente e funcionando ✓

---

## 📋 Passo 1: Prepare seu GitHub

Se você **ainda não tem repositório**, siga isto:

```powershell
# 1. Navegue ao diretório
cd "C:\Users\Micro\Desktop\Biel pessoal\botbielgraf\ticket"

# 2. Inicialize Git (se ainda não fez)
git init
git add .
git commit -m "Bot tickets inicial - Pronto para deployment"

# 3. Crie repositório no GitHub
# Vá em github.com → New Repository
# Nome: botbielgraf-ticket
# NÃO inicialize com README (você já tem)

# 4. Conecte seu repositório local
git remote add origin https://github.com/SEU_USUARIO/botbielgraf-ticket.git
git branch -M main
git push -u origin main
```

---

## 🚄 Passo 2: Configure Railway (5 minutos)

### **Acesso:**
1. Vá em **https://railway.app**
2. Clique **"Start Free"**
3. Faça login com **GitHub** (mais fácil)

### **Crie Novo Projeto:**
1. Clique **"New Project"**
2. Selecione **"Deploy from GitHub"**
3. Escolha seu repositório `botbielgraf-ticket`
4. Railway detecta automaticamente

---

## 🔐 Passo 3: Configure Variáveis de Ambiente

No dashboard do Railway:

1. Clique no seu projeto
2. Vá em **"Variables"**
3. Clique **"+ New Variable"**
4. Adicione:
   ```
   Name: TOKEN
   Value: seu_token_do_bot_aqui
   ```
5. Clique **"Save"**

**Pronto!** Railway lê seu `.env.example` automaticamente.

---

## ✨ Passo 4: Deploy

> ⚠️ **Atenção:** o arquivo `db/config.json` é usado para armazenar suas preferências. Para evitar que ele seja sobrescrito pelo código do repositório, você pode:
> 1. Comitar mudanças manuais sempre que alterar a configuração (como foi feito agora).  
> 2. Ignorar o arquivo (`.gitignore` já contém `/db/config.json`) e usar backups automáticos (o bot faz isso por padrão). O bot também tenta restaurar automaticamente o último backup se detectar que o config atual é idêntico ao modelo base.  
> 3. Montar um volume persistente no Railway para o diretório `db/` (consulte a documentação do Railway).  


1. Clique **"Deploy"** no dashboard
2. Aguarde 2-5 minutos
3. Você verá:
   ```
   ✅ Build succeeded
   ✅ Deployment successful
   ```
4. Seu bot está **ONLINE 24/7** 🎉

---

## 📊 Monitorar Seu Bot

### **Ver Logs:**
- Dashboard → **"Logs"**
- Vejo todos os logs do bot em tempo real

### **Reiniciar Bot:**
- Dashboard → Menu **"..."** → **"Restart"**

### **Usando em Produção:**
- Seu bot roda continuamente
- Railway reinicia automaticamente se cair
- $5/mês grátis (dura bastante!)

---

## 🔄 Atualizar Bot (Quando fizer mudanças)

```powershell
# No seu PC local:
git add .
git commit -m "Descrição das mudanças"
git push origin main

# Railway detecta automaticamente e faz deploy!
# Seu bot atualiza sozinho em 2 minutos
```

---

## 🆘 Troubleshooting

### Bot não conecta
- [ ] Verifique se TOKEN está correto em Railway
- [ ] Verifique se bot está habilitado em Discord Developer Portal
- [ ] Veja os logs no Railway

### Deploy falha
- [ ] Verifique se `package.json` está correto
- [ ] Rode `npm i` localmente para testar
- [ ] Veja os logs de erro no Railway

### Variáveis de ambiente não funcionam
- [ ] No Railway, adicione:
  ```
  TOKEN = seu_token
  ```
- [ ] Clique **"Save"**
- [ ] Reinicie o bot (Railway → Restart)

---

## 💰 Custos

- **Railway**: $5/mês grátis = ✅ Bot 24/7

Seu bot usa pouquíssimo processamento, então com $5/mês você tem meses de operação.

---

## ✅ Resumo Rápido

| Passo | O que fazer | Tempo |
|-------|------------|-------|
| 1 | Push para GitHub | 5 min |
| 2 | Acessar Railway.app | 2 min |
| 3 | Conectar repositório | 3 min |
| 4 | Adicionar TOKEN | 1 min |
| 5 | Deploy | 5 min |
| **Total** | | **16 minutos** |

---

## 🎯 Próximos Passos

1. ✅ Deploy seu bot
2. ✅ Teste no Discord
3. ✅ Monitore os logs
4. ✅ Aproveite o bot 24/7 grátis!

---

**Qualquer dúvida, é só chamar!** 🚀
