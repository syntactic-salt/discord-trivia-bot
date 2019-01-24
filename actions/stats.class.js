const DBUtils = require('../helpers/database_utilities.class');

class Stats {
    constructor(message) {
        this.message = message;
    }

    async start() {
        const { member, channel } = this.message;
        const stats = await DBUtils.getStatsForUser(member.id);
        let messageText = `Trivia stats for <@${member.id}>\n\nRounds Played: ${stats.rounds}\nTotal Questions Answered: ${stats.total}\nTotal Correct Answers: ${stats.correct}`;
        return channel.send(messageText);
    }
}

module.exports = Stats;
