const MySQL = require('mysql');
const defaults = require('../defaults');
const database = require('../database');

class DatabaseUtilities {
    /**
     * Add a server record to the database
     * @param {string} serverId - The Discord ID for the Discord server
     * @returns {Promise<any>}
     */
    static addServer(serverId) {
        return new Promise((resolve, reject) => {
            const connection = MySQL.createConnection(database);
            connection.query(
                'INSERT INTO servers SET discord_id = ?, prefix = ?',
                [serverId, defaults.prefix],
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

    /**
     * Updates the prefix for a server record
     * @param {string} prefix
     * @param {string} serverId - The Discord server ID
     * @returns {Promise<any>}
     */
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

    /**
     * Gets a collection of all servers in the database
     * @returns {Promise<any>}
     */
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

    /**
     * Adds a score record to the database
     * @param {Object} score
     * @returns {Promise<any>}
     */
    static addScore(score) {
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

    /**
     * Get statistics for a user
     * @param {string} userId - The Discord Id for the user
     * @returns {Promise<any>}
     */
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
                        const stats = result.reduce((acc, current) => ({
                            rounds: acc.rounds + 1,
                            total: acc.total + current.total_answers,
                            correct: acc.correct + current.correct_answers,
                        }), { total: 0, correct: 0, rounds: 0 });
                        resolve(stats);
                    }

                    connection.destroy();
                },
            );
        });
    }

    /**
     * Adds a round record to the database
     * @param {string} channelId - The Discord channel ID
     * @returns {Promise<any>}
     */
    static addRound(channelId) {
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

    /**
     * Gets all the channels in the database
     * @returns {Promise<any>}
     */
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

    /**
     * Gets a channel from the database
     * @param {string} channelId - The Discord channel ID
     * @returns {Promise<any>}
     */
    static getChannel(channelId) {
        return new Promise((resolve, reject) => {
            const connection = MySQL.createConnection(database);
            connection.query(
                'SELECT * FROM channels WHERE discord_id = ?',
                [channelId],
                (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve({
                            serverId: results[0].server_discord_id,
                            triviaCategoryId: results[0].trivia_category_id,
                        });
                    }

                    connection.destroy();
                },
            );
        });
    }

    /**
     * Adds a channel record to the database
     * @param {string} channelId - The Discord channel ID
     * @param {string} serverId - The Discord server ID
     * @param {number} categoryId - The category ID for OpenTDB
     * @returns {Promise<any>}
     */
    static addChannel(channelId, serverId, categoryId) {
        return new Promise((resolve, reject) => {
            const connection = MySQL.createConnection(database);
            connection.query(
                'INSERT INTO channels SET discord_id = ?, server_discord_id = ?, trivia_category_id = ?',
                [channelId, serverId, categoryId],
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
