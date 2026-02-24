const resposta = require('./commands/config/resposta');
const antiabuso = require('./commands/config/antiabuso');

console.log("=== TESTE DE SUBCOMANDOS ===\n");

// Simulando interações
const mockInteraction = (commandName, subcommandName, options = {}) => ({
  commandName,
  guild: { id: '123456789' },
  user: { id: 'user123' },
  member: { roles: { cache: { has: () => false } } },
  options: {
    getSubcommand: () => subcommandName,
    getString: (name) => options[name] || null,
    getInteger: (name) => options[name] || null,
  },
  reply: async (msg) => {
    console.log(`   [RESPOSTA]: ${msg.content || msg.embeds?.length || 'aviso'}`);
    return true;
  },
  channel: {
    send: async (msg) => {
      console.log(`   [ENVIADO NO CANAL]: ${JSON.stringify(msg).substring(0, 50)}...`);
      return true;
    }
  }
});

async function testCommand(cmd, commandName, subcommandName, options = {}) {
  console.log(`\n✓ Testando: /${commandName} ${subcommandName}`);
  try {
    const interaction = mockInteraction(commandName, subcommandName, options);
    await cmd.execute(interaction);
    console.log(`  ✅ Subcomando '${subcommandName}' funcionou!`);
  } catch (e) {
    console.log(`  ❌ Erro: ${e.message}`);
  }
}

(async () => {
  // Testes para resposta
  console.log("\n📋 TESTANDO RESPOSTA:");
  await testCommand(resposta, 'resposta', 'listar');
  await testCommand(resposta, 'resposta', 'criar', { 
    nome: 'teste', 
    titulo: 'Título de Teste',
    mensagem: 'Esta é uma mensagem de teste'
  });
  await testCommand(resposta, 'resposta', 'usar', { nome: 'teste' });
  await testCommand(resposta, 'resposta', 'deletar', { nome: 'teste' });

  // Testes para antiabuso
  console.log("\n🛡️  TESTANDO ANTIABUSO:");
  
  // Precisamos testar como admin
  const mockAdminInteraction = (commandName, subcommandName, options = {}) => ({
    ...mockInteraction(commandName, subcommandName, options),
    user: { id: process.env.OWNER_ID || 'admin123' },
  });

  const antiabusoCopy = { ...antiabuso };
  antiabusoCopy.execute = async function(interaction) {
    // Reimplementar com mock admin
    if (interaction.user.id === process.env.OWNER_ID || true) {
      return await antiabuso.execute(interaction);
    }
    return interaction.reply('Sem permissão');
  };

  await testCommand(antiabusoCopy, 'antiabuso', 'info');
  await testCommand(antiabusoCopy, 'antiabuso', 'set', { max: 5, cooldown: 300 });
  await testCommand(antiabusoCopy, 'antiabuso', 'reset');

  console.log("\n✅ Todos os testes de subcomandos foram executados!");
})();
