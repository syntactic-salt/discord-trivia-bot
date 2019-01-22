const DiscordJS = require('discord.js');
const Utils = require('./helpers/utilities.class');
const DBUtils = require('./helpers/database_utilities.class');
const Prefix = require('./actions/prefix.class');
const discord = require('./discord');

const client = new DiscordJS.Client();
let servers = new Map();

DBUtils.getServers().then((newServers) => {
    servers = newServers;
}).catch(() => {
    console.error('Failed to cache servers');
    process.exit(1);
});

client.on('ready', () => {
    console.log('Bot running...');
});

client.on('message', async (message) => {
    if (!servers.has(message.guild.id)) {
        try {
            await DBUtils.addServer(message.guild);
            servers = await DBUtils.getServers();
        } catch (error) {
            console.warn('Failed to update servers cache');
        }
    }

    if (!Utils.isMe(message.member, client.user)) {
        const server = servers.get(message.guild.id);
        const { prefix } = server;

        if (message.content === `${prefix}prefix`) {
            const action = new Prefix(message);
            action.start()
                .then(async () => {
                    servers = await DBUtils.getServers();
                })
                .catch(error => console.warn(error));
        } else {
            message.delete();
        }
    }
});

client.on('disconnect', () => client.login(discord.token));

client.login(discord.token);
