const DBUtils = require('../helpers/database_utilities.class');
const MessageWithResponse = require('../helpers/message_with_response.class');

class Prefix {
    constructor(message) {
        this.message = message;
    }

    async start() {
        try {
            const prefix = await this.askForPrefix();
            await DBUtils.updateServerPrefix(prefix, this.message.guild.id);
            this.message.channel.send(`The Trivia Bot prefix has been updated to \`${prefix}\``);
        } catch (error) {
            console.warn('There was an error while updating the bot prefix.');
        }
    }

    askForPrefix() {
        const prefixMessage = new MessageWithResponse(this.message);
        return prefixMessage.getResponse('Enter the new Trivia Bot prefix');
    }
}

module.exports = Prefix;
