const resposta = require('./commands/config/resposta');
const antiabuso = require('./commands/config/antiabuso');

console.log("=== TESTE DE SERIALIZAÇÃO ===\n");

try {
  console.log("1. Testando resposta.data.toJSON()...");
  const respostaJson = resposta.data.toJSON();
  console.log("   ✅ Sucesso!");
  console.log("   - Nome:", respostaJson.name);
  console.log("   - Opções:", respostaJson.options?.length);
  console.log("   - Tipo da opção 0:", respostaJson.options?.[0]?.type);
} catch (e) {
  console.log("   ❌ Erro:", e.message);
}

try {
  console.log("\n2. Testando antiabuso.data.toJSON()...");
  const antiaburoJson = antiabuso.data.toJSON();
  console.log("   ✅ Sucesso!");
  console.log("   - Nome:", antiaburoJson.name);
  console.log("   - Opções:", antiaburoJson.options?.length);
  console.log("   - Tipo da opção 0:", antiaburoJson.options?.[0]?.type);
} catch (e) {
  console.log("   ❌ Erro:", e.message);
}

console.log("\n=== TESTE DE ESTRUTURA ===\n");

// Simular o que o handler faz
const SlashsArray = [];

if (resposta.data && typeof resposta.data.toJSON === 'function') {
  SlashsArray.push(resposta.data);
}
if (antiabuso.data && typeof antiabuso.data.toJSON === 'function') {
  SlashsArray.push(antiabuso.data);
}

console.log("Comandos a registrar:", SlashsArray.length);

const commandsToRegister = SlashsArray.map(cmd => {
  if (cmd.toJSON && typeof cmd.toJSON === 'function') {
    return cmd.toJSON();
  }
  return cmd;
});

console.log("Comandos processados:", commandsToRegister.length);

commandsToRegister.forEach((cmd, i) => {
  console.log(`\n[${i}] ${cmd.name}`);
  console.log("    - Tipo:", cmd.type);
  console.log("    - Opções:", cmd.options?.length);
  console.log("    - Descrição:", cmd.description.substring(0, 30) + "...");
});

console.log("\n✅ Teste concluído com sucesso!");
