const DBUtils = require('../helpers/database_utilities.class');

class Prefix {
    constructor(message) {
        this.message = message;
    }

    async start() {
        try {
            const prefix = await this.askForPrefix();
            await this.setPrefix(prefix);
        } catch (error) {
            throw error;
        }
    }

    askForPrefix() {
        return new Promise((resolve, reject) => {
            const { channel, member } = this.message;
            channel.send('Enter the new Trivia Bot prefix')
                .then(() => {
                    channel.awaitMessages(
                        message => message.member.id === member.id,
                        { max: 1, time: 60000, errors: ['time'] },
                    )
                        .then((messages) => {
                            const message = messages.first();
                            resolve(message.content);
                        })
                        .catch(() => {
                            this.timeout();
                            reject('Timed out waiting for a response');
                        });
                })
                .catch(error => reject(error));
        });
    }

    setPrefix(prefix) {
        return DBUtils.updateServerPrefix(prefix, this.message.guild.id).then(() => {
            return this.message.channel.send(`The Trivia Bot prefix has been updated to \`${prefix}\``);
        });
    }

    setMessage(message) {
        this.message = message;
    }

    timeout() {
        return this.message.channel.send('Prefix configuration for Trivia Bot has timed out')
    }
}

module.exports = Prefix;
