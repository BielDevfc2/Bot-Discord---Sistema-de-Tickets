const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gerar-pix")
    .setDescription("Gera um PIX com valor personalizado")
    .addNumberOption((option) =>
      option
        .setName("valor")
        .setDescription("Valor em reais")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Apenas OWNER pode usar
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: "❌ Apenas o dono pode usar este comando!",
        flags: 64,
      });
    }

    const valor = interaction.options.getNumber("valor");
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
        .setTitle("💚 PIX Gerado!")
        .setDescription(`**Valor:** R$ ${valor.toFixed(2)}`)
        .addFields({
          name: "🔑 Chave PIX (Copiar e Colar)",
          value: `\`\`\`${pixKey}\`\`\``,
          inline: false,
        })
        .setFooter({ text: `Solicitado por ${interaction.user.username}` })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        flags: 64,
      });
    } catch (error) {
      console.error("Erro ao gerar PIX:", error);
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
