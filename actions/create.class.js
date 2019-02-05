const DBUtils = require('../helpers/database_utilities.class');
const MessageWithResponse = require('../helpers/message_with_response.class');
const MessageWithChoice = require('../helpers/message_with_choice.class');
const TriviaService = require('../services/trivia.class');

class Create {
    constructor(message, bot) {
        this.message = message;
        this.bot = bot;
    }

    async start() {
        try {
            const channelName = await this.askForChannelName();
            const categoryId = await this.askForCategory();
            await this.createChannel(channelName, categoryId);
        } catch (error) {
            throw error;
        }
    }

    askForCategory() {
        return new Promise((resolve, reject) => {
            TriviaService.getCategories()
                .then((categories) => {
                    const choices = [];

                    categories.forEach(category => choices.push({ text: category.name, returnValue: category.id }));

                    const triviaCategoryMessage = new MessageWithChoice(this.message, 'Please select a trivia category for the channel.', choices);
                    triviaCategoryMessage.getChoice()
                        .then(resolve)
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    askForChannelName() {
        return new Promise((resolve, reject) => {
            const channelNameMessage = new MessageWithResponse(this.message, 'Trivia Bot will create a new channel. Enter a name for the channel.');
            channelNameMessage.getResponse()
                .then(response => resolve(response))
                .catch(error => reject(error));
        });
    }

    createChannel(name, categoryId) {
        return new Promise((resolve, reject) => {
            this.message.guild.createChannel(name, 'text', [{ id: this.bot.id }])
                .then((channel) => {
                    DBUtils.addChannel(channel.id, channel.guild.id, categoryId)
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
