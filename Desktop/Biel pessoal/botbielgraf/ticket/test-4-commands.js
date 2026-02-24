const resposta = require('./commands/config/resposta');
const antiabuso = require('./commands/config/antiabuso');

console.log("╔════════════════════════════════════════════════════════════╗");
console.log("║         VALIDAÇÃO DOS 4 COMANDOS COM PROBLEMAS              ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

const mockAdminInteraction = (commandName, subcommandName, options = {}) => ({
  commandName,
  guild: { id: '123456789', name: 'Test Guild' },
  user: { id: 'admin123' },
  member: { roles: { cache: { has: () => true } } },
  options: {
    getSubcommand: () => subcommandName,
    getString: (name) => options[name] || null,
    getInteger: (name) => options[name] || null,
  },
  reply: async (msg) => {
    const content = msg.content || (msg.embeds?.length ? `[Embed]` : 'OK');
    return { content };
  },
  channel: {
    send: async (msg) => {
      return { content: '[Sent]' };
    }
  }
});

(async () => {
  let testResults = [];

  // Teste 1: resposta deletar
  console.log("1️⃣  /resposta deletar");
  try {
    const interaction = mockAdminInteraction('resposta', 'deletar', { nome: 'test' });
    await resposta.execute(interaction);
    console.log("   ✅ FUNCIONANDO\n");
    testResults.push(true);
  } catch (e) {
    console.log(`   ❌ ERRO: ${e.message}\n`);
    testResults.push(false);
  }

  // Teste 2: resposta usar
  console.log("2️⃣  /resposta usar");
  try {
    const interaction = mockAdminInteraction('resposta', 'usar', { nome: 'test' });
    await resposta.execute(interaction);
    console.log("   ✅ FUNCIONANDO\n");
    testResults.push(true);
  } catch (e) {
    console.log(`   ❌ ERRO: ${e.message}\n`);
    testResults.push(false);
  }

  // Teste 3: antiabuso info
  console.log("3️⃣  /antiabuso info");
  try {
    const interaction = mockAdminInteraction('antiabuso', 'info');
    await antiabuso.execute(interaction);
    console.log("   ✅ FUNCIONANDO\n");
    testResults.push(true);
  } catch (e) {
    console.log(`   ❌ ERRO: ${e.message}\n`);
    testResults.push(false);
  }

  // Teste 4: antiabuso set
  console.log("4️⃣  /antiabuso set");
  try {
    const interaction = mockAdminInteraction('antiabuso', 'set', { max: 5, cooldown: 300 });
    await antiabuso.execute(interaction);
    console.log("   ✅ FUNCIONANDO\n");
    testResults.push(true);
  } catch (e) {
    console.log(`   ❌ ERRO: ${e.message}\n`);
    testResults.push(false);
  }

  // Resultado final
  console.log("╔════════════════════════════════════════════════════════════╗");
  const allPassed = testResults.every(r => r === true);
  if (allPassed) {
    console.log("║          ✅ TODOS OS 4 COMANDOS FUNCIONANDO 100%!            ║");
  } else {
    console.log(`║          ❌ ${testResults.filter(r => !r).length} comando(s) com problemas              ║`);
  }
  console.log("╚════════════════════════════════════════════════════════════╝");
})();
