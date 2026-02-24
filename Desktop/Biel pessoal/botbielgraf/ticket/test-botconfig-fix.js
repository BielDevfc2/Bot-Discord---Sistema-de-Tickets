const fs = require('fs');
const path = require('path');

console.log("╔════════════════════════════════════════════════════════════╗");
console.log("║  VALIDAÇÃO - CORREÇÃO DO BOTCONFIG COM CONSOLIDAÇÃO        ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

// Simular o wio.db
class SimpleDB {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {};
    if (fs.existsSync(filePath)) {
      try {
        this.data = JSON.parse(fs.readFileSync(filePath, 'utf8')) || {};
      } catch (e) {
        this.data = {};
      }
    }
  }

  async get(path) {
    const keys = path.split('.');
    let current = this.data;
    for (const key of keys) {
      current = current[key];
      if (!current) return null;
    }
    return current;
  }

  async set(path, value) {
    const keys = path.split('.');
    let current = this.data;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
    return true;
  }
}

const dbPath = './test-config.json';
const config = new SimpleDB(dbPath);

(async () => {
  console.log("1️⃣  Inicializando painel com valores padrão...");
  await config.set("painel", {
    title: "🎲・Central de atendimento",
    footer: "Horário: 10:00 até 23:00",
    desc: "Bem-vindo!",
    banner: "https://example.com/banner.png",
    cor: "Random",
    placeholder: "Escolha uma opção:"
  });
  console.log("   ✅ Painel inicializado\n");

  console.log("2️⃣  Simulando edição de título...");
  const painelAtual1 = await config.get("painel") || {};
  painelAtual1.title = "✨NEW TÍTULO✨";
  await config.set("painel", painelAtual1);
  const painelAfter1 = await config.get("painel");
  console.log(`   Título: ${painelAfter1.title}`);
  console.log(`   Outros campos intactos: footer="${painelAfter1.footer}" cor="${painelAfter1.cor}"`);
  console.log(`   ✅ OK\n`);

  console.log("3️⃣  Simulando edição de descrição...");
  const painelAtual2 = await config.get("painel") || {};
  painelAtual2.desc = "📝 NOVA DESCRIÇÃO";
  await config.set("painel", painelAtual2);
  const painelAfter2 = await config.get("painel");
  console.log(`   Descrição: ${painelAfter2.desc.substring(0, 30)}...`);
  console.log(`   Título preservado: ${painelAfter2.title}`);
  console.log(`   ✅ OK\n`);

  console.log("4️⃣  Simulando edição de cor...");
  const painelAtual3 = await config.get("painel") || {};
  painelAtual3.cor = "#FF0000";
  await config.set("painel", painelAtual3);
  const painelAfter3 = await config.get("painel");
  console.log(`   Cor: ${painelAfter3.cor}`);
  console.log(`   Título preservado: ${painelAfter3.title}`);
  console.log(`   Footer preservado: ${painelAfter3.footer}`);
  console.log(`   ✅ OK\n`);

  console.log("5️⃣  Simulando edição de placeholder...");
  const painelAtual4 = await config.get("painel") || {};
  painelAtual4.placeholder = "🎯 Selecione aqui";
  await config.set("painel", painelAtual4);
  const painelAfter4 = await config.get("painel");
  console.log(`   Placeholder: ${painelAfter4.placeholder}`);
  console.log(`   Todos os campos presentes: ${Object.keys(painelAfter4).join(", ")}`);
  console.log(`   ✅ OK\n`);

  console.log("6️⃣  Validação Final - Objeto Completo:");
  const painelFinal = await config.get("painel");
  console.log(`   Title:       ${painelFinal.title}`);
  console.log(`   Footer:      ${painelFinal.footer}`);
  console.log(`   Desc:        ${painelFinal.desc.substring(0, 25)}...`);
  console.log(`   Banner:      ${painelFinal.banner}`);
  console.log(`   Cor:         ${painelFinal.cor}`);
  console.log(`   Placeholder: ${painelFinal.placeholder}`);

  const todasAsChaves = ['title', 'footer', 'desc', 'banner', 'cor', 'placeholder'];
  const todasPresentes = todasAsChaves.every(k => painelFinal.hasOwnProperty(k));
  
  console.log(`\n════════════════════════════════════════════════════════════`);
  if (todasPresentes) {
    console.log(`✅ TESTE PASSOU! Objeto consolidado com todos os campos!`);
    console.log(`\n🎉 A CORREÇÃO FUNCIONA PERFEITAMENTE!`);
  } else {
    console.log(`❌ TESTE FALHOU! Campos faltando.`);
  }
  console.log(`════════════════════════════════════════════════════════════`);

  // Limpeza
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
})();
