# 🚀 SETUP RÁPIDO - BOT ALIENALES V6 (CORRIGIDO)

## ⚙️ Configuração Inicial

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente (.env)
Edite o arquivo `.env` e adicione seus dados:
```env
TOKEN=seu_token_do_bot_aqui
OWNER_ID=seu_discord_id_aqui
DATABASE_URL=sua_url_postgres_aqui (opcional)
EFI_CLIENT_ID=seu_client_id_efi (para pagamentos)
EFI_CLIENT_SECRET=seu_secret_efi (para pagamentos)
EFI_SANDBOX=true (use true para testes)
EFI_PIX_KEY=sua_chave_pix
```

### 3. Iniciar o Bot
```bash
npm start
```

---

## 📋 Checklist de Funcionamento

### Eventos e Comandos Carregados
- ✅ Handler de comandos (4 pastas: config, ticket, vendas, ranking)
- ✅ Handler de eventos (4 pastas: bot, config, ticket, vendas)
- ✅ Sistema de segurança com rate limit
- ✅ Logger com arquivo de logs

### Principais Comandos Disponíveis

#### 🔧 CONFIG
- `/botconfig` - Configurar sistema de tickets (staff)
- `/ticket` - Enviar painel de tickets (staff)
- `/adicionarservico` - Adicionar novo serviço (staff)
- `/say` - Fazer bot falar (admin)

#### 💳 VENDAS
- `/pedido` - Criar novo pedido de serviço
- `/listarservicos` - Listar serviços disponíveis
- `/historico` - Ver histórico de pedidos
- `/pedidos` - Listar todos os pedidos (admin)
- `/confirmarpagamento` - Confirmar pagamento (staff)

#### 🎫 TICKET
- `/ticket` - Enviar painel de tickets
- Criar tickets via botões

#### 📊 RANKING
- `/rank` - Ver ranking de usuário
- `/rankadm` - Ver ranking admin

---

## 🐛 Correções Realizadas

1. ✅ Limpeza do arquivo `.env` (remover dados sensíveis corruptos)
2. ✅ Corrigir indentação em comandos
3. ✅ Validar estrutura de todos os comandos (execute method)
4. ✅ Verificar handlers (eventos e comandos)
5. ✅ Sistema de segurança e rate limit ativo
6. ✅ Logger funcional com arquivo de logs

---

## 📊 Estrutura de Banco de Dados

### Arquivos JSON em `/db/`
- `config.json` - Configurações globais do bot
- `category.json` - Categorias de tickets
- `orders.json` - Histórico de pedidos
- `usuarios info.json` - Dados dos usuários
- `produtos.json` - Produtos/serviços disponíveis
- E muitos outros...

---

## 🔒 Autenticação

O bot valida automaticamente:
- ✅ Credenciais no Discord
- ✅ Permissões por comando
- ✅ Rate limits por usuário e guild
- ✅ Bloqueio de usuários malintentionados

---

## 📱 Integrações Ativas

- **Discord.js** v14.14.1
- **PostgreSQL** (via Neon para banco em cloud)
- **EFI Payments** (para sistema PIX e pagamentos)
- **QR Code** (para pagamentos)
- **Backup automático** de configurações

---

## 🆘 Troubleshooting

### Bot não inicia
1. Verifique se o TOKEN está correto em .env
2. Regenere o token no portal de desenvolvedor Discord
3. Confira as permissões do bot (ler e escrever mensagens, gerenciar canais)

### Comandos não aparecem
1. Aguarde 5-10 minutos para Discord sincronizar
2. Veja os logs da pasta `/logs/` para erros
3. Rode novamente:  `/register-commands.js`

### Integrações de pagamento não funcionam
1. Configure as credenciais EFI corretamente
2. Use `EFI_SANDBOX=true` para testes
3. Verifique o console para erros de API

---

## 📈 Próximos Passos

- [ ] Deploy em Railway, Replit ou VPS
- [ ] Configurar banco de dados PostgreSQL
- [ ] Testar integrações de pagamento
- [ ] Monitorar logs em produção
- [ ] Fazer backup periódico das configurações

---

**Última Atualização:** 24/02/2026  
**Status:** ✅ Bot Refatorado e Funcional
