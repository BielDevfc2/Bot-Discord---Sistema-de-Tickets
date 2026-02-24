## Guia Rápido de Desenvolvimento

Este guia explica como adicionar novos comandos, eventos e funcionalidades no bot.

Formato de comandos suportados
- Novo (recomendado):
```js
module.exports = {
  data: new SlashCommandBuilder()
    .setName('meu-comando')
    .setDescription('Descrição')
    // options...
  ,
  async execute(interaction) {
    // lógica do comando
  }
}
```

- Antigo (compatibilidade):
```js
module.exports = {
  name: 'meu-comando',
  description: 'Descrição',
  type: ApplicationCommandType.ChatInput,
  run: async (client, interaction) => {
    // lógica do comando
  }
}
```

Onde criar
- Coloque comandos em `commands/<categoria>/`. Exemplo: `commands/config/`, `commands/ticket/`, `commands/ranking/`.
- Eventos no diretório `events/` (já existe `events/bot/`).

Como o handler carrega
- O `handler/index.js` já suporta ambos os formatos (`data.execute` e `name.run`).
- Coloque o arquivo `.js` na pasta certa e o handler irá carregá-lo automaticamente.

Boas práticas
- Use `process.env.OWNER_ID` para checar o dono do bot.
- Sempre trate exceções com `try/catch` e logue o erro (`console.error`).
- Não commit `secrets` (arquivo `.env` está em `.gitignore`). Configure variáveis no Railway.
- Prefira `forEach`/`for...of` para iterar arrays quando for concatenar strings ou fazer ações síncronas.

Testes locais
1. No ambiente local, atualize `.env` com as variáveis necessárias.
2. Rode `node .` dentro da pasta `ticket`.
3. Use um servidor de teste no Discord para validar comandos.

Deploy (Railway)
- Faça commit das mudanças e rode `git push`.
- Abra o painel do Railway e aguarde o redeploy automático.
- Se precisar reiniciar manualmente: `Deployments -> Redeploy` no dashboard Railway.

Checklist ao adicionar um comando
- [ ] Arquivo criado em `commands/<categoria>/mycmd.js`
- [ ] Exporta `data` + `execute` (ou `name` + `run` se preferir manter o antigo)
- [ ] Checagens de permissão (usar `process.env.OWNER_ID` quando for owner-only)
- [ ] Tratamento de erros com `try/catch`
- [ ] Testado localmente com `node .`
- [ ] Commit e push para o repositório

Debugging rápido
- Se o bot responder "O aplicativo não respondeu": verifique o console do processo (logs do Railway ou terminal local) para stacktrace.
- Comandos de deploy lentos ou não atualizados: aguarde 1-2 minutos ou force o redeploy.

Contato / Próximos passos
- Se quiser, posso adicionar templates automáticos de comando (gerador de arquivo) ou criar um script de deploy. Quer que eu adicione um template no projeto agora?
