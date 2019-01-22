const DBUtils = require('../helpers/database_utilities.class');

class Create {
    constructor(message, bot) {
        this.message = message;
        this.bot = bot;
    }

    async start() {
        try {
            const channelName = await this.askForChannelName();
            await this.createChannel(channelName);
        } catch (error) {
            throw error;
        }
    }

    askForChannelName() {
        return new Promise((resolve, reject) => {
            const { channel, member } = this.message;
            channel.send('Trivia Bot will create a new channel. Enter a name for the channel.')
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
                            reject(new Error('Timed out waiting for a response'));
                        });
                })
                .catch(error => reject(error));
        });
    }

    createChannel(name) {
        return new Promise((resolve, reject) => {
            this.message.guild.createChannel(name, 'text', [{ id: this.bot.id }])
                .then((channel) => {
                    DBUtils.addChannel(channel)
                        .then(() => {
                            this.message.channel.send(
                                `<#${channel.id}> has been created. Head there to start a round of trivia.`,
                            );
                            resolve(channel);
                        })
                        .catch(error => reject(error));
                })
                .catch(error => reject(error));
        });
    }

    timeout() {
        return this.message.channel.send('I don\'t have all day. Why don\'t you try again when you\'re ready.');
    }
}

module.exports = Create;
