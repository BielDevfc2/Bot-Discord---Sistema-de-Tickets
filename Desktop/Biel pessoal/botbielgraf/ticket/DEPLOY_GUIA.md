# 🚀 GUIA RÁPIDO DE DEPLOY - ALIENALES BOT V6

## ✅ Pré-requisitos
- Node.js v16+ instalado
- npm ou yarn
- Conta Discord
- Bot criado em Discord Developer Portal

---

## 🔧 Instalação Local

### 1. Clonar/Baixar projeto
```bash
cd seu_projeto_aqui
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar .env
```bash
# Copie os dados de .env.example
cp .env.example .env

# Edite o arquivo .env com seus dados
# TOKEN=seu_token_aqui
# OWNER_ID=seu_id_aqui
```

### 4. Testar
```bash
node test-bot.js
```

### 5. Iniciar
```bash
npm start
```

---

## 🌐 Deploy em Railway

### 1. Criar conta em railway.app

### 2. Conectar GitHub
- Fazer push do código para GitHub
- Autorizar Railway com GitHub

### 3. Configurar variáveis
```
Dashboard → Variáveis
Adicionar: TOKEN, OWNER_ID, etc.
```

### 4. Deploy automático
```
Railway detecta mudanças e faz deploy automático
```

---

## 🎮 Deploy em Replit

### 1. Se já está em Replit
```bash
# No console, instale dependências
npm install

# Configure .env
# TOKEN=seu_token
# OWNER_ID=seu_id
```

### 2. Rode sempre ligado
```
Use Replit Deployments ou UptimeRobot
para manter o bot ligado 24/7
```

### 3. Iniciar
```bash
npm start
```

---

## 🖥️ Deploy em VPS (Linux)

### 1. SSH para o servidor
```bash
ssh user@seu_servidor.com
```

### 2. Clonar repositório
```bash
git clone seu_repositorio
cd seu_repositorio
```

### 3. Instalar Node.js
```bash
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 4. Instalar dependências
```bash
npm install
```

### 5. Configurar .env
```bash
nano .env
# Adicione suas variáveis e salve (Ctrl+X, Y, Enter)
```

### 6. Configurar como serviço (PM2)
```bash
npm install -g pm2

# Iniciar com PM2
pm2 start index.js --name "alienales-bot"

# Startar automaticamente ao reiniciar
pm2 startup
pm2 save

# Ver status
pm2 status
```

### 7. Monitorar
```bash
# Ver logs em tempo real
pm2 logs alienales-bot

# Ou ver logs simples
tail -f logs/2026-02-24.log
```

---

## 📊 Monitoramento em Produção

### Verificar se o bot está online
1. Abra seu servidor Discord
2. Veja nas listas de membros online
3. Se estiver lá, está funcionando! ✅

### Ver comandos registrados
```bash
/botconfig  # Para administradores
```

### Monitorar performance
```bash
# Ver uso de memória
pm2 monit

# Ver logs para erros
grep "ERROR" logs/*.log
```

---

## 🆘 Troubleshooting Deploy

### Bot não inicia
```bash
# Verificar logs
npm start

# Procurar mensagens de erro
# Se TOKEN inválido → Regenere em Discord DevPortal
# Se módulo não encontrado → npm install
```

### Comandos não aparecem
```bash
# Aguardar 5-10 minutos
# Discord precisa sincronizar

# Forçar atualizar
node validate-commands.js
```

### Permissões insuficientes
```
Discord Developer Portal → Bot
Adicione permissões necessárias:
- Send Messages
- Read Messages/View Channels
- Manage Messages
- Create Public Threads
- Manage Channels
```

### Erro de rate limit
```
Isso é normal. O bot tem proteção:
- 5 comandos/segundo por usuário
- Automática
```

---

## 📋 Checklist Final

- [ ] .env configurado
- [ ] TOKEN válido
- [ ] Bot tem permissões no servidor
- [ ] npm install completado
- [ ] test-bot.js passou
- [ ] Bot iniciou sem erros
- [ ] Comandos aparecem no Discord
- [ ] Testou alguns comandos
- [ ] Logs estão sendo salvos
- [ ] PM2 ou serviço rodando 24/7

---

## 🎯 Próximas Etapas

1. Configure o banco de dados (opcional)
2. Setup de pagamentos EFI
3. Configure tickets e vendas
4. Customize branding e cores
5. Adicione mais comandos conforme necessário

---

**Última atualização:** 24/02/2026
