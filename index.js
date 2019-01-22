const DiscordJS = require('discord.js');
const Utils = require('./helpers/utilities.class');
const DBUtils = require('./helpers/database_utilities.class');
const Prefix = require('./actions/prefix.class');
const Create = require('./actions/create.class');
const discord = require('./discord');

const client = new DiscordJS.Client();
let servers = new Map();

DBUtils.getServers().then((newServers) => {
    servers = newServers;
}).catch(() => {
    console.error('Failed to cache servers');
    process.exit(1);
});

let channels = new Map();

DBUtils.getChannels().then((newChannels) => {
    channels = newChannels;
}).catch(() => {
    console.error('Failed to cache channels');
    process.exit(2);
});

client.on('ready', () => {
    console.log('Bot running...');
});

client.on('message', async (message) => {
    const {
        channel,
        content,
        guild,
        member,
    } = message;

    if (!servers.has(guild.id)) {
        try {
            await DBUtils.addServer(guild);
            servers = await DBUtils.getServers();
        } catch (error) {
            console.warn('Failed to update servers cache');
        }
    }

    if (!Utils.isMe(member, client.user)) {
        const server = servers.get(guild.id);
        const { prefix } = server;

        if (content === `${prefix}prefix` && Utils.isAdmin(member)) {
            const action = new Prefix(message);
            action.start()
                .then(async () => {
                    servers = await DBUtils.getServers();
                })
                .catch(error => console.warn(error));
        } else if (content === `${prefix}create` && Utils.isAdmin(member)) {
            const action = new Create(message, client.user);
            action.start()
                .then(async () => {
                    channels = await DBUtils.getChannels();
                })
                .catch(error => console.warn(error));
        } else if (channels.has(channel)) {
            message.delete();
        }
    }
});

client.on('disconnect', () => client.login(discord.token));

client.login(discord.token);