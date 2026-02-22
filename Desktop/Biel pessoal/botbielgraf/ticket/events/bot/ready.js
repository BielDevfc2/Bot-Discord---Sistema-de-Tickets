const {} = require("discord.js");
module.exports = {
    name:"ready",
    run:async(client) => {
        console.log(`\x1b[36m[BOT] - ${client.user.tag} was successfully started!\x1b[0m`);
        console.log(`\x1b[32m[BOT] - ${client.user.tag} has ${client.users.cache.size} users!\x1b[0m`);
        console.log(`\x1b[33m[BOT] - ${client.user.tag} has ${client.guilds.cache.size} servers!\x1b[0m`);
        console.log(`\x1b[34m[BOT] - ${client.user.tag} has ${client.channels.cache.size} channels!\x1b[0m`);
    }
}