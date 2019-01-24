const numberMap = {
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
};

const emojis = {
    one: '1⃣',
    two: '2⃣',
    three: '3⃣',
    four: '4⃣',
    left: '⬅',
    right: '➡',
};

class MessageWithChoice {
    constructor(message, text, choices) {
        this.message = message;
        this.text = text;
        this.choices = this.getChunks(choices);
        this.currentChunk = 0;
        this.callbackMap = {
            [emojis.left]: this.previousChunk.bind(this),
            [emojis.one]: (resolve, choices) => resolve(choices[0].returnValue),
            [emojis.two]: (resolve, choices) => resolve(choices[1].returnValue),
            [emojis.three]: (resolve, choices) => resolve(choices[2].returnValue),
            [emojis.four]: (resolve, choices) => resolve(choices[3].returnValue),
            [emojis.right]: this.nextChunk.bind(this),
        };
    }

    getChoice() {
        return new Promise((resolve, reject) => {
            const choices = this.choices[this.currentChunk];
            let text = `${this.text}\n`;

            for (let index = 0; index < choices.length; index += 1) {
                text += `\n${emojis[numberMap[index + 1]]} ${choices[index].text}`;
            }

            this.sendMessageWithChoices(text, choices)
                .then((emojiName) => {
                    if (this.callbackMap[emojiName]) {
                        this.callbackMap[emojiName](resolve, choices);
                    } else {
                        this.message.channel.send('That wasn\'t one of the choices');
                        reject();
                    }
                })
                .catch(reject);
        });
    }

    nextChunk(resolve) {
        return new Promise(() => {
            this.setCurrentChunk(this.currentChunk + 1);
            const choices = this.choices[this.currentChunk];
            let text = `${this.text}\n`;

            for (let index = 0; index < choices.length; index += 1) {
                text += `\n${emojis[numberMap[index + 1]]} ${choices[index].text}`;
            }

            this.updateMessageWithChoices(text, choices)
                .then((emojiName) => {
                    if (this.callbackMap[emojiName]) {
                        this.callbackMap[emojiName](resolve, choices);
                    } else {
                        this.message.channel.send('That wasn\'t one of the choices');
                    }
                })
                .catch();
        });
    }

    previousChunk(resolve) {
        return new Promise(() => {
            this.setCurrentChunk(this.currentChunk - 1);
            const choices = this.choices[this.currentChunk];
            let text = `${this.text}\n`;

            for (let index = 0; index < choices.length; index += 1) {
                text += `\n${emojis[numberMap[index + 1]]} ${choices[index].text}`;
            }

            this.updateMessageWithChoices(text, choices)
                .then((emojiName) => {
                    if (this.callbackMap[emojiName]) {
                        this.callbackMap[emojiName](resolve, choices);
                    } else {
                        this.message.channel.send('That wasn\'t one of the choices');
                    }
                })
                .catch();
        });
    }

    updateMessageWithChoices(text, choices) {
        return this.sentMessage.clearReactions()
            .then(() => this.sentMessage.edit(text)
                .then((message) => {
                    const reactions = [];

                    if (this.choices[this.currentChunk - 1]) {
                        reactions.push(emojis.left);
                    }

                    choices.forEach((choice, index) => reactions.push(emojis[numberMap[index + 1]]));

                    if (this.choices[this.currentChunk + 1]) {
                        reactions.push(emojis.right);
                    }

                    reactions.reduce((promise, emoji) => promise.then(() => message.react(emoji)), Promise.resolve());

                    return message.awaitReactions(
                        (reaction, user) => this.message.member.id === user.id,
                        { maxEmojis: 1, time: 60000, errors: ['time'] },
                    )
                        .then((reactions) => {
                            const reaction = reactions.first();
                            return reaction.emoji.name;
                        })
                        .catch((error) => {});
                })
                .catch((error) => {}));
    }

    sendMessageWithChoices(text, choices) {
        return this.message.channel.send(text)
            .then((message) => {
                this.sentMessage = message;
                const reactions = [];

                if (this.choices[this.currentChunk - 1]) {
                    reactions.push(emojis.left);
                }

                choices.forEach((choice, index) => reactions.push(emojis[numberMap[index + 1]]));

                if (this.choices[this.currentChunk + 1]) {
                    reactions.push(emojis.right);
                }

                reactions.reduce((promise, emoji) => promise.then(() => message.react(emoji)), Promise.resolve());

                return message.awaitReactions(
                    (reaction, user) => this.message.member.id === user.id,
                    { maxEmojis: 1, time: 60000, errors: ['time'] },
                )
                    .then((reactions) => {
                        const reaction = reactions.first();
                        return reaction.emoji.name;
                    })
                    .catch((error) => {});
            })
            .catch((error) => {});
    }

    getChunks(choices) {
        const choiceChunks = [];
        const chunkSize = 4;

        for (let index = 0; index < choices.length; index += chunkSize) {
            choiceChunks.push(choices.slice(index, index + chunkSize));
        }

        return choiceChunks;
    }

    setCurrentChunk(newChunk) {
        this.currentChunk = newChunk;
    }
}

module.exports = MessageWithChoice;
