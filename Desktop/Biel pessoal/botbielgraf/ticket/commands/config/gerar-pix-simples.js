const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gerar-pix-simples")
    .setDescription("Gera um PIX estático simples (sem API Efí)")
    .addNumberOption((option) =>
      option
        .setName("valor")
        .setDescription("Valor em reais (ex: 10.50)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("descricao")
        .setDescription("Descrição/motivo do PIX")
        .setRequired(false)
    ),

  async execute(interaction) {
    // Apenas OWNER pode usar
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: "❌ Apenas o dono pode usar este comando!",
        flags: 64, // ephemeral
      });
    }

    const valor = interaction.options.getNumber("valor");
    const descricao = interaction.options.getString("descricao") || "Pagamento";
    const pixKey = process.env.EFI_PIX_KEY;

    if (!pixKey) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Erro")
            .setDescription("EFI_PIX_KEY não configurada!")
            .setTimestamp(),
        ],
        flags: 64,
      });
    }

    try {
      // Embed com informações do PIX
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("💚 PIX Gerado com Sucesso!")
        .setDescription(`**Valor:** R$ ${valor.toFixed(2)}\n**Descrição:** ${descricao}`)
        .addFields(
          {
            name: "🔑 Chave PIX (Copie e Cole)",
            value: `\`\`\`${pixKey}\`\`\``,
            inline: false,
          },
          {
            name: "📱 Como usar",
            value: "Abra seu banco → Pagar com PIX → Cole a chave acima → Confirme o valor",
            inline: false,
          }
        )
        .setFooter({ text: `Solicitado por ${interaction.user.username}` })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        flags: 64,
      });
    } catch (error) {
      console.error("Erro ao gerar PIX simples:", error);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Erro ao Gerar PIX")
            .setDescription(`${error.message}`),
        ],
        flags: 64,
      });
    }
  },
};
