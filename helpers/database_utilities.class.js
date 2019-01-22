const MySQL = require('mysql');
const defaults = require('../defaults');
const database = require('../database');

class DatabaseUtilities {
    static addServer(guild) {
        return new Promise((resolve, reject) => {
            const connection = MySQL.createConnection(database);
            connection.query(
                'INSERT INTO servers SET discord_id = ?, prefix = ?',
                [guild.id, defaults.prefix],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }

                    connection.destroy();
                },
            );
        });
    }

    static updateServerPrefix(prefix, serverId) {
        return new Promise((resolve, reject) => {
            const connection = MySQL.createConnection(database);
            connection.query(
                'UPDATE servers SET prefix = ? WHERE discord_id = ?',
                [prefix, serverId],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }

                    connection.destroy();
                },
            );
        });
    }

    static getServers() {
        return new Promise((resolve, reject) => {
            const connection = MySQL.createConnection(database);
            connection.query(
                'SELECT * FROM servers',
                (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        const servers = new Map();
                        results.forEach(server => servers.set(server.discord_id, { prefix: server.prefix }));
                        resolve(servers);
                    }

                    connection.destroy();
                },
            );
        });
    }

    static getChannels() {
        return new Promise((resolve, reject) => {
            const connection = MySQL.createConnection(database);
            connection.query(
                'SELECT * FROM channels',
                (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        const channels = new Map();
                        results.forEach(channel => channels.set(
                            channel.discord_id,
                            { serverId: channel.server_discord_id, triviaCategoryId: channel.trivia_category_id },
                        ));
                        resolve(channels);
                    }

                    connection.destroy();
                },
            );
        });
    }

    static addChannel(channel) {
        return new Promise((resolve, reject) => {
            const connection = MySQL.createConnection(database);
            connection.query(
                'INSERT INTO channels SET discord_id = ?, server_discord_id = ?, trivia_category_id = ?',
                [channel.id, channel.guild.id, 15],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }

                    connection.destroy();
                },
            );
        });
    }
}

module.exports = DatabaseUtilities;
