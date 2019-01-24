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

    static createScore(score) {
        return new Promise((resolve, reject) => {
            const connection = MySQL.createConnection(database);
            connection.query(
                'INSERT INTO scores SET member_discord_id = ?, round_id = ?, total_answers = ?, correct_answers = ?',
                [score.userId, score.roundId, score.total, score.correct],
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

    static getStatsForUser(userId) {
        return new Promise((resolve, reject) => {
            const connection = MySQL.createConnection(database);
            connection.query(
                'SELECT correct_answers, total_answers FROM scores where member_discord_id = ?',
                [userId],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        const stats = result.reduce((acc, current) => {
                            return {
                                rounds: acc.rounds + 1,
                                total: acc.total + current.total_answers,
                                correct: acc.correct + current.correct_answers
                            };
                        }, { total: 0, correct: 0, rounds: 0 });
                        console.log(stats);
                        resolve(stats);
                    }

                    connection.destroy();
                },
            );
        });
    }

    static createRound(channelId) {
        return new Promise((resolve, reject) => {
            const connection = MySQL.createConnection(database);
            connection.query(
                'INSERT INTO rounds SET channel_discord_id = ?',
                [channelId],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.insertId);
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

    static getChannel(discord_id) {
        return new Promise((resolve, reject) => {
            const connection = MySQL.createConnection(database);
            connection.query(
                'SELECT * FROM channels WHERE discord_id = ?',
                [discord_id],
                (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve({ serverId: results[0].server_discord_id, triviaCategoryId: results[0].trivia_category_id });
                    }

                    connection.destroy();
                }
            );
        });
    }

    static addChannel(channel, categoryId) {
        return new Promise((resolve, reject) => {
            const connection = MySQL.createConnection(database);
            connection.query(
                'INSERT INTO channels SET discord_id = ?, server_discord_id = ?, trivia_category_id = ?',
                [channel.id, channel.guild.id, categoryId],
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
