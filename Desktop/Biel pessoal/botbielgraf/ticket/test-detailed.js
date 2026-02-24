const resposta = require('./commands/config/resposta');
const antiabuso = require('./commands/config/antiabuso');

console.log("=== RESPOSTA COMMAND ===");
console.log("Name:", resposta.data.name);
console.log("Description:", resposta.data.description);
console.log("Has execute:", typeof resposta.execute === 'function');
console.log("Options:", resposta.data.options.length);
resposta.data.options.forEach((opt, i) => {
  console.log(`  [${i}] Type: ${opt.type}, Name: ${opt.name}, Description: ${opt.description}`);
});

console.log("\n=== ANTIABUSO COMMAND ===");
console.log("Name:", antiabuso.data.name);
console.log("Description:", antiabuso.data.description);
console.log("Has execute:", typeof antiabuso.execute === 'function');
console.log("Options:", antiabuso.data.options.length);
antiabuso.data.options.forEach((opt, i) => {
  console.log(`  [${i}] Type: ${opt.type}, Name: ${opt.name}, Description: ${opt.description}`);
});

console.log("\n=== JSON SERIALIZATION TEST ===");
try {
  const respostaJson = resposta.data.toJSON();
  console.log("Resposta JSON keys:", Object.keys(respostaJson));
  console.log("Resposta options count:", respostaJson.options?.length);
  
  const antiabutoJson = antiabuso.data.toJSON();
  console.log("Antiabuso JSON keys:", Object.keys(antiabutoJson));
  console.log("Antiabuso options count:", antiabutoJson.options?.length);
} catch (e) {
  console.log("Erro na serialização:", e.message);
}
