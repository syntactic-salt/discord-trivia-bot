class MessageWithResponse {
    constructor(message, text) {
        this.message = message;
        this.text = text;
    }

    getResponse() {
        return new Promise((resolve, reject) => {
            this.message.channel.send(this.text)
                .then(() => {
                    this.message.channel.awaitMessages(
                        message => message.member.id === this.message.member.id,
                        { max: 1, time: 60000, errors: ['time'] },
                    )
                        .then((messages) => {
                            const message = messages.first();
                            resolve(message.content);
                        })
                        .catch(() => {
                            reject(new Error('Timed out waiting for a response'));
                        });
                })
                .catch(error => reject(error));
        });
    }
}

module.exports = MessageWithResponse;
