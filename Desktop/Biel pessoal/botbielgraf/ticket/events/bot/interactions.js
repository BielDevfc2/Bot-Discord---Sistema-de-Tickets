const { InteractionType } = require("discord.js");


module.exports = {
    name:"interactionCreate",
    run:async(interaction, client) => {

        if(interaction.type === InteractionType.ApplicationCommand){

            const cmd = client.slashCommands.get(interaction.commandName);
      
            if (!cmd) return interaction.reply(`I can't find this command.`);
      
            interaction["member"] = interaction.guild.members.cache.get(interaction.user.id);
      
            // Suporta tanto novo formato (execute) quanto antigo (run)
            if (cmd.execute) {
              await cmd.execute(interaction);
            } else if (cmd.run) {
              await cmd.run(client, interaction);
            } else {
              return interaction.reply("❌ Comando não configurado corretamente!");
            }
         };
          

    }
}