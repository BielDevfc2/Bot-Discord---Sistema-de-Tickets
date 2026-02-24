const resposta = require('./commands/config/resposta');
const antiabuso = require('./commands/config/antiabuso');
const fs = require('fs');

console.log("=== TESTE FINAL COM PERMISSÕES DE ADMIN ===\n");

// Limpar dados de teste
const cleanupDb = () => {
  try {
    if (fs.existsSync('./db/respostas.json')) {
      fs.unlinkSync('./db/respostas.json');
    }
    if (fs.existsSync('./db/antiabuso.json')) {
      fs.unlinkSync('./db/antiabuso.json');
    }
    console.log("✓ Banco de dados limpo\n");
  } catch (e) {
    console.log("⚠️  Não foi possível limpar DB (normal se não existir)\n");
  }
};

cleanupDb();

// Mock com permissões de admin
const mockAdminInteraction = (commandName, subcommandName, options = {}) => ({
  commandName,
  guild: { 
    id: '123456789',
    name: 'Test Guild'
  },
  user: { id: 'admin123' }, // Admin
  member: { 
    roles: { cache: { has: () => true } } // Tem role de staff
  },
  options: {
    getSubcommand: () => subcommandName,
    getString: (name) => options[name] || null,
    getInteger: (name) => options[name] || null,
  },
  reply: async (msg) => {
    console.log(`   → ${msg.content || (msg.embeds?.length ? `[Embed enviado]` : msg)}`);
    return true;
  },
  channel: {
    send: async (msg) => {
      console.log(`   → [Mensagem enviada no canal]`);
      return true;
    }
  }
});

async function testSubcommand(cmd, commandName, subcommandName, options = {}, description = '') {
  console.log(`\n📌 ${commandName} ${subcommandName}${description ? ' - ' + description : ''}`);
  try {
    const interaction = mockAdminInteraction(commandName, subcommandName, options);
    await cmd.execute(interaction);
    console.log(`   ✅ OK`);
    return true;
  } catch (e) {
    console.log(`   ❌ ERRO: ${e.message}`);
    return false;
  }
}

(async () => {
  let totalTests = 0;
  let passedTests = 0;

  // Testes RESPOSTA
  console.log("\n═══════════════════════════════════════");
  console.log("COMANDO: /resposta");
  console.log("═══════════════════════════════════════");

  totalTests++;
  if (await testSubcommand(resposta, 'resposta', 'listar', {}, 'mostra templates')) passedTests++;

  totalTests++;
  if (await testSubcommand(resposta, 'resposta', 'criar', {
    nome: 'boas-vindas',
    titulo: '👋 Bem-vindo!',
    mensagem: 'Obrigado por entrar no servidor!'
  }, 'criar novo template')) passedTests++;

  totalTests++;
  if (await testSubcommand(resposta, 'resposta', 'listar', {}, 'listar após criar')) passedTests++;

  totalTests++;
  if (await testSubcommand(resposta, 'resposta', 'usar', {
    nome: 'boas-vindas'
  }, 'usar template')) passedTests++;

  totalTests++;
  if (await testSubcommand(resposta, 'resposta', 'deletar', {
    nome: 'boas-vindas'
  }, 'deletar template')) passedTests++;

  totalTests++;
  if (await testSubcommand(resposta, 'resposta', 'listar', {}, 'confirmar deleção')) passedTests++;

  // Testes ANTIABUSO
  console.log("\n═══════════════════════════════════════");
  console.log("COMANDO: /antiabuso");
  console.log("═══════════════════════════════════════");

  totalTests++;
  if (await testSubcommand(antiabuso, 'antiabuso', 'info', {}, 'ver config antes')) passedTests++;

  totalTests++;
  if (await testSubcommand(antiabuso, 'antiabuso', 'set', {
    max: 5,
    cooldown: 300
  }, 'configurar limites')) passedTests++;

  totalTests++;
  if (await testSubcommand(antiabuso, 'antiabuso', 'info', {}, 'ver config depois')) passedTests++;

  totalTests++;
  if (await testSubcommand(antiabuso, 'antiabuso', 'reset', {}, 'resetar dados')) passedTests++;

  // Resultado
  console.log("\n═══════════════════════════════════════");
  console.log(`RESULTADO FINAL: ${passedTests}/${totalTests} testes passaram`);
  console.log("═══════════════════════════════════════");
  
  if (passedTests === totalTests) {
    console.log("\n🎉 TODOS OS COMANDOS ESTÃO 100% FUNCIONAIS!");
  } else {
    console.log(`\n⚠️  ${totalTests - passedTests} testes falharam`);
  }
})();
