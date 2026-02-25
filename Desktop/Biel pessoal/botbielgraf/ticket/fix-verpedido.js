const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'commands/vendas/verpedido.js');
let content = fs.readFileSync(filePath, 'utf8');

// Substituir o bloco catch
const oldCatch = `        } catch (error) {
            logger.error("Erro em /verpedido:", { error: error.message });
            await interaction.reply({
                content: \`❌ | Erro ao processar comando: \${error.message}\`,
                ephemeral: true
            });
        }`;

const newCatch = `        } catch (error) {
            logger.error("Erro em /verpedido:", { error: error.message });
            
            // Verificar se interação já foi respondida
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: \`❌ | Erro ao processar comando: \${error.message}\`,
                    ephemeral: true
                }).catch(() => {});
            } else if (interaction.deferred) {
                await interaction.editReply({
                    content: \`❌ | Erro ao processar comando: \${error.message}\`
                }).catch(() => {});
            }
        }`;

if (content.includes(oldCatch)) {
  content = content.replace(oldCatch, newCatch);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Arquivo verpedido.js corrigido!');
  process.exit(0);
} else {
  console.log('❌ Padrão exato não encontrado');
  console.log('Tentando versão alternativa...');
  process.exit(1);
}
