# 📖 Guia de Instalação e Configuração

## ✅ Requisitos
- Node.js v16 ou superior instalado
- npm ou yarn
- Um bot Discord criado no [Discord Developer Portal](https://discord.com/developers/applications)

## 🚀 Passo 1: Instalação Inicial

```bash
# 1. Instale todas as dependências
npm i

# 2. Configure o arquivo de ambiente
cp .env.example .env

# 3. Abra o arquivo .env e adicione seu token
# TOKEN=seu_token_do_bot_aqui
```

## ⚙️ Passo 2: Configuração do Bot

### Arquivo: `.env`
```
TOKEN=seu_token_do_bot_aqui
```

### Arquivo: `config.json`
Este arquivo contém todos os dados de configuração do sistema. Use `db/config.exemple.json` como referência.

> **Nota:** Proteja o arquivo de configuração local `db/config.json` de sobrescritas acidentais. Recomendamos commitar alterações intencionais ou usar variáveis de ambiente/armazenamento persistente em deploys.

**Campos importantes:**
- `cargo_staff`: ID do cargo que terá acesso ao painel de staff
- `channel_logs`: ID do canal de logs administrativos
- `channel_ava`: ID do canal de avaliações
- `botconfig.category`: ID da categoria padrão para tickets

## 🔧 Passo 3: Primeiro Uso

```bash
# Inicie o bot
node .
```

Você deve ver no console:
```
✅ | Bot conectado com sucesso!
```

## 📋 Configuração Recomendada no Discord

### 1. Cargos Necessários
- Crie um cargo **"Staff"** para membros que podem gerenciar tickets
- Anote o ID do cargo (clique com botão direito no cargo → Copiar ID)

### 2. Canais Necessários
- Crie um canal chamado **#tickets** onde o painel será enviado
- Crie um canal chamado **#logs-tickets** para registros administrativos
- Crie um canal chamado **#avaliacoes** para avaliações

### 3. Permissões
- O bot deve ter permissão para:
  - Gerenciar canais
  - Gerenciar mensagens
  - Enviar mensagens em DM
  - Ver histórico de mensagens

## 🎫 Usando o Sistema

### Comando Principal: `/ticket`

```
/ticket - Envia o painel de tickets
```

Apenas o **Owner** ou membros com o cargo **Staff** podem executar este comando.

### Comando de Configuração: `/botconfig`

```
/botconfig - Abre o painel de configuração
```

Apenas o **Owner** pode executar este comando.

## 🔐 Segurança

⚠️ **IMPORTANTE:**
- Nunca compartilhe seu token ou arquivo `.env`
- Não versione o arquivo `.env` (já está no `.gitignore`)
- Mantenha seu bot token seguro
- Use variáveis de ambiente em produção

## 🐛 Troubleshooting

### "Bot não conecta"
- Verifique se o token no `.env` está correto
- Certifique-se de que o bot está habilitado no Developer Portal
- Verifique a conexão com internet

### "Permissão negada nos comandos"
- Verifique o ID do Owner em `config.json`
- Certifique-se de que o ID do cargo está correto
- Verifique as permissões do bot no servidor

### "Erro ao criar ticket"
- Verifique se a categoria de tickets está configurada
- Certifique-se de que o bot tem permissão para criar canais
- Verifique se há espaço para novos canais no servidor

## 📚 Estrutura de Arquivos

```
ticket/
├── index.js                      # Arquivo principal
├── config.json                   # Configuração removida (use .env)
├── .env.example                  # Template de variáveis de ambiente
├── package.json                  # Dependências
├── db/
│   ├── config.json              # Configurações do bot
│   ├── category.json            # Categorias de tickets
│   └── perfil.json              # Perfis de usuários
├── commands/
│   ├── config/
│   │   └── botconfig.js         # Comando de configuração
│   ├── ranking/
│   ├── ticket/
│   │   └── ticket.js            # Comando de tickets
├── events/
│   ├── bot/
│   ├── config/
│   └── ticket/
│       └── ticketEvent.js       # Eventos de tickets
├── handler/
│   ├── Events.js                # Carregador de eventos
│   └── index.js                 # Carregador de comandos
└── util/
    └── ticketUtils.js           # Funções utilitárias
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique o arquivo `BUGFIXES.md` para bugs conhecidos
2. Leia o `read.md` para informações gerais
3. Verifique os logs do console para mensagens de erro

---

🎉 **Pronto!** Seu bot de tickets está configurado e pronto para usar!
