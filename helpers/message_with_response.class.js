class MessageWithResponse {
    constructor(message) {
        this.message = message;
    }

    getResponse(messageText) {
        return this.message.channel.send(messageText)
            .then(() => (
                this.message.channel.awaitMessages(
                    message => message.member.id === this.message.member.id,
                    { max: 1, time: 60000, errors: ['time'] },
                )
                    .then(messages => messages.first().content)
            ))
            .catch(() => {
                this.message.channel.send('I don\'t have all day. Try again when you\'re ready.');
                throw new Error('Timed out waiting for a user response');
            });
    }
}

module.exports = MessageWithResponse;
