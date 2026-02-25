const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder } = require("discord.js");
const {JsonDatabase} = require("wio.db");
const cf = new JsonDatabase({databasePath: require("path").join(__dirname, "../../db/config.json")});
const ct = new JsonDatabase({databasePath: require("path").join(__dirname, "../../db/category.json")});

// Função para validar e processar cores
function processarCor(cor) {
    if (!cor) return 0x000000; // Preto por padrão
    
    // Se for "Random", retorna undefined para Discord.js gerar aleatória
    if (cor.toLowerCase() === "random") return null;
    
    // Se for hex #RRGGBB, converte para número
    if (typeof cor === "string" && cor.startsWith("#")) {
        try {
            return parseInt(cor.slice(1), 16);
        } catch (e) {
            console.warn(`Cor hexadecimal inválida: ${cor}`);
            return 0x000000;
        }
    }
    
    // Se já for número ou válido, retorna como está
    return cor;
}

// Garantir que o painel tem todos os campos necessários
async function garantirPainelConsistente() {
    const painelAtual = await cf.get("painel") || {};
    
    if (!painelAtual.title || !painelAtual.footer || !painelAtual.desc) {
        const painelConsistente = {
            title: painelAtual.title || "🎲・Central de atendimento",
            footer: painelAtual.footer || "Horário de atendimento: 10:00 até 23:00",
            desc: painelAtual.desc || "Bem-vindo ao nosso sistema de tickets!",
            banner: painelAtual.banner || "",
            cor: painelAtual.cor || "#000000",
            placeholder: painelAtual.placeholder || "Escolha uma opção:"
        };
        await cf.set("painel", painelConsistente);
        return painelConsistente;
    }
    
    return painelAtual;
}

module.exports = {
    data: new (require("discord.js")).SlashCommandBuilder()
        .setName("ticket")
        .setDescription("[🛠 / Área Staff] Execute o Comando de Enviar o painel de ticket"),
    async execute(interaction) {
        try {
            if (!interaction.member.roles.cache.has(await ct.get("cargo_staff")) && interaction.user.id !== process.env.OWNER_ID) return interaction.reply({content:`⛔ | Permissão Negada.`, ephemeral:true});
            await interaction.reply({content:`🔁 | Aguarde um momento, estou enviando a mensagem.`, ephemeral:true});
            const all = await ct.all();
            
            // Garantir que os dados estão consistentes
            const a = await garantirPainelConsistente();
            
            if (!a) return interaction.editReply({content:`❌ | Painel não configurado. Use /botconfig para configurar.`, ephemeral:true});
            
            // Processar cor e criar embed com tratamento robusto
            const corProcessada = processarCor(a.cor);
            const embed = new EmbedBuilder().setTitle(`${a.title}`).setFooter({text:`${a.footer}`});
            if (corProcessada !== null) {
                embed.setColor(corProcessada);
            }
            let desc = a.desc;
            desc = desc.replace("${interaction.guild.name}", interaction.guild.name);
            embed.setDescription(`${desc}`);
            if(a.banner && a.banner.startsWith("https://")) embed.setImage(a.banner);
            let row;
            const open = await cf.get("open");
            if(open.system === "Select") {
                if(all.length <= 0) return interaction.editReply({content:`❌ | Você não criou nenhuma categoria`, ephemeral:true});
                row = new StringSelectMenuBuilder().setCustomId("ticketslakkk").setMaxValues(1).setPlaceholder(a.placeholder);
                for (const rs of all) {
                    row.addOptions(
                        {
                            label:`${rs.data.titulo}`, 
                            description:`${rs.data.desc}`,
                            emoji: rs.data.emoji,
                            value: rs.ID
                        }
                    )
                }
            } else {
                row = new ButtonBuilder()
                .setCustomId("abrir_ticket")
                .setLabel(open.button.label)
                .setStyle(open.button.style)
                .setEmoji(open.button.emoji);
            }
            await interaction.channel.send({
                embeds:[embed],
                components:[
                    new ActionRowBuilder()
                    .addComponents(row)
                ]
            }).then(() => {
                interaction.editReply({content:`✅ | Enviado com sucesso`});
            })
        } catch (error) {
            console.error("❌ Erro ao executar /ticket:", error);
            return interaction.reply({
                content: `❌ Erro ao enviar painel: ${error.message}`,
                ephemeral: true
            }).catch(() => {
                interaction.editReply({
                    content: `❌ Erro ao enviar painel: ${error.message}`
                });
            });
        }
    }
}
