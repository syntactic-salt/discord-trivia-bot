const DBUtils = require('../helpers/database_utilities.class');
const embedColor = require('../constants/embeds').color;

class Stats {
    constructor(message) {
        this.message = message;
    }

    async start() {
        const { member, channel } = this.message;
        const stats = await DBUtils.getStatsForUser(member.id);
        const embed = {
            color: embedColor,
            fields: [
                { name: 'Rounds Played', value: stats.rounds },
                { name: 'Total Questions Answered', value: stats.total },
                { name: 'Total Correct Answers', value: stats.correct },
            ],
            title: 'Stats',
        };
        return channel.send(`<@${member.id}>`, { embed });
    }
}

module.exports = Stats;
