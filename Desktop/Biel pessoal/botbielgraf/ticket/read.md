# Bot Discord - Sistema de Tickets

## 🚀 Início Rápido

### Pré-requisitos
- Node.js v16 ou superior
- npm ou yarn

### Instalação

1. **Instale as dependências:**
```bash
npm i
```

2. **Configure o token:**
   - Copie o arquivo `.env.example` para `.env`
   - Abra o arquivo `.env` e adicione seu token do bot Discord:
   ```
   TOKEN=seu_token_do_bot_aqui
   ```

3. **Inicie o bot:**
```bash
node .
```

✅ **Pronto!** Seu bot de tickets está online 🎭

## 🔧 Configuração

O bot armazena suas configurações em arquivos JSON:
- `db/config.json` - Configurações gerais do sistema
- `db/category.json` - Categorias de tickets
- `db/perfil.json` - Perfis de usuários

## 🆘 Suporte

Se encontrar problemas:
1. Verifique se o token está correto no arquivo `.env`
2. Certifique-se de que todas as dependências foram instaladas (`npm i`)
3. Varfique os logs no console para mensagens de erro

## 📝 Alterações Recentes

- ✅ Removido token do arquivo de configuração
- ✅ Adicionado suporte a variáveis de ambiente (.env)
- ✅ Corrigidos bugs de casting de objetos
- ✅ Adicionados utilities para reduzir duplicação de código
- ✅ Melhorado tratamento de erros
- ✅ Corrigidos typos em mensagens
