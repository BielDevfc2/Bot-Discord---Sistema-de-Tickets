const fs = require('fs');
const logger = require('../util/logger');

module.exports = {
    run: (client) => {
        logger.info("Carregando eventos...");
        let eventCount = 0;

        fs.readdirSync('./events/').forEach(folder => {
            const arquivosEvent = fs.readdirSync(`./events/${folder}`).filter(archive => archive.endsWith('.js'));
            
            for (const arquivo of arquivosEvent) {
                try {
                    const evento = require(`../events/${folder}/${arquivo}`);
                    
                    if (!evento.name) {
                        logger.warn(`Evento ${arquivo} não tem nome definido`);
                        return;
                    }

                    if (evento.once) {
                        client.once(evento.name, (...args) => evento.run(...args, client));
                    } else {
                        client.on(evento.name, (...args) => evento.run(...args, client));
                    }
                    
                    eventCount++;
                    logger.success(`Evento carregado: ${evento.name} (${arquivo})`);
                } catch (error) {
                    logger.error(`Erro ao carregar evento ${arquivo}`, {
                        error: error.message,
                        folder
                    });
                }
            }
        });

        logger.success(`Total de eventos carregados: ${eventCount}`);
    }
}

