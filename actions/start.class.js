const TriviaService = require('../services/trivia.class');
const DBUtils = require('../helpers/database_utilities.class');
const embedColor = require('../constants/embeds').color;

const emojis = {
    0: '🇦',
    1: '🇧',
    2: '🇨',
    3: '🇩',
};

const emojiNumberMap = {
    [emojis[0]]: 0,
    [emojis[1]]: 1,
    [emojis[2]]: 2,
    [emojis[3]]: 3,
};

class Start {
    constructor(channel) {
        this.channel = channel;
        this.currentQuestion = 0;
        this.answerCounts = new Map();
    }


    async start() {
        try {
            await this.initializeChannel();
            this.startQuestions();
        } catch (error) {
            throw error;
        }
    }

    async initializeChannel() {
        try {
            const channel = await DBUtils.getChannel(this.channel.id);

            const categories = await TriviaService.getCategories();
            this.category = categories.find(({ id }) => id === channel.triviaCategoryId);

            const messages = await this.channel.fetchMessages();

            this.roundId = await DBUtils.addRound(this.channel.id);
            messages.deleteAll();
            this.questions = await TriviaService.getQuestions(this.category.id);
            const embed = {
                color: embedColor,
                fields: [
                    {
                        name: 'Category',
                        value: this.category.name,
                    },
                    {
                        name: '# of Questions',
                        value: this.questions.length,
                    },
                    {
                        name: 'How-to Play',
                        // eslint-disable-next-line max-len
                        value: 'You will have 15 seconds to answer each question. You can answer a question by using the reaction that corresponds to your choice.',
                    },
                ],
                footer: {
                    text: 'First question in 60 seconds',
                },
                title: 'Thanks for starting a round of trivia.',
            };
            this.message = await this.channel.send(undefined, { embed });
            return Promise.resolve();
        } catch (error) {
            console.error('There was an error initializing a channel for a round of trivia.');
            console.error(error);
            throw new Error('Error initializing a channel for a round of trivia');
        }
    }

    startQuestions() {
        setTimeout(() => {
            this.askQuestion();
        }, 60000);
    }

    askQuestion() {
        const question = this.questions[this.currentQuestion];
        const embed = {
            color: embedColor,
            description: '',
            footer: {
                text: `Question ${this.currentQuestion + 1} of ${this.questions.length} | ${this.category.name}`,
            },
            title: question.text,
        };

        for (let index = 0; index < question.answers.length; index += 1) {
            embed.description += `${emojis[index]} ${question.answers[index].text}`;

            if (index !== question.answers.length - 1) {
                embed.description += '\n';
            }
        }

        return this.message.clearReactions()
            .then(() => this.message.edit(undefined, { embed })
                .then(() => {
                    const reactWith = [];

                    question.answers.forEach((choice, index) => reactWith.push(emojis[index]));

                    reactWith.reduce(
                        (promise, emoji) => promise.then(() => this.message.react(emoji)),
                        Promise.resolve(),
                    );

                    return this.message.awaitReactions(
                        reaction => Object.values(emojis).includes(reaction.emoji.name),
                        { time: 15000 },
                    )
                        .then((reactions) => {
                            const userReactions = new Map();
                            const cheaters = {};

                            reactions.forEach((reaction) => {
                                reaction.users.forEach((user) => {
                                    if (!user.bot) {
                                        if (userReactions.has(user.id)) {
                                            cheaters[user.id] = true;
                                        } else {
                                            userReactions.set(user.id, { user, emoji: reaction.emoji.name });
                                        }
                                    }
                                });
                            });

                            Object.keys(cheaters).forEach(userId => userReactions.delete(userId));

                            return this.questionResults(Array.from(userReactions.values()));
                        });
                }));
    }

    questionResults(reactions) {
        this.message.clearReactions();

        const correctAnswer = {
            index: this.questions[this.currentQuestion].answers.findIndex(answer => answer.correct),
        };
        correctAnswer.text = this.questions[this.currentQuestion].answers[correctAnswer.index].text;

        reactions.forEach((reaction) => {
            let answerCount = { total: 1, correct: 0, username: reaction.user.username };

            if (this.answerCounts.has(reaction.user.id)) {
                answerCount = this.answerCounts.get(reaction.user.id);
                answerCount.total += 1;
            }

            if (emojiNumberMap[reaction.emoji] === correctAnswer.index) {
                answerCount.correct += 1;
            }

            this.answerCounts.set(reaction.user.id, answerCount);
        });

        if (this.questions[this.currentQuestion + 1]) {
            this.currentQuestion += 1;

            setTimeout(() => {
                this.askQuestion();
            }, 10000);
        } else {
            setTimeout(() => {
                this.end();
            }, 15000);
        }

        let embedFooterText = this.currentQuestion + 1 === this.questions.length ? '' : 'Next question in 10 seconds | ';
        embedFooterText += this.category.name;

        const embed = {
            color: embedColor,
            fields: [this.scoreboardField()],
            footer: {
                text: embedFooterText,
            },
            title: `The correct answer is, ${emojis[correctAnswer.index]} ${correctAnswer.text}`,
        };

        return this.message.edit(undefined, { embed });
    }

    scoreboardField() {
        const scores = [];
        this.answerCounts.forEach(value => scores.push(value));
        scores.sort((scoreA, scoreB) => {
            if (scoreA.correct < scoreB.correct) {
                return -1;
            } if (scoreA.correct > scoreB.correct) {
                return 1;
            }

            return 0;
        });

        const scoreboardText = scores.reduce((text, score) => `${text}${score.username}: **${score.correct}**\n`, '');

        return { name: 'SCOREBOARD', value: scoreboardText || 'You\'re not even going to guess?' };
    }

    end() {
        this.answerCounts.forEach((count, key) => {
            DBUtils.addScore({
                userId: key, total: count.total, correct: count.correct, roundId: this.roundId,
            });
        });

        const embed = {
            color: embedColor,
            description: 'Type `?start` to start another round of trivia.',
            fields: [this.scoreboardField()],
            footer: {
                text: `${this.questions.length} Questions | ${this.category.name}`,
            },
            title: 'Thanks for playing.',
        };

        this.message.edit(undefined, { embed });
    }
}

module.exports = Start;
