const TriviaService = require('../services/trivia.class');
const DBUtils = require('../helpers/database_utilities.class');

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
        } catch (error) {
            throw error;
        }
    }

    async initializeChannel() {
        try {
            const channel = await DBUtils.getChannel(this.channel.id);
            const categories = await TriviaService.getCategories();
            const category = categories.find(({ id }) => id === channel.triviaCategoryId);
            const messages = await this.channel.fetchMessages();
            this.roundId = await DBUtils.addRound(this.channel.id);
            messages.deleteAll();
            // eslint-disable-next-line max-len
            this.message = await this.channel.send(`Thanks for starting a round of trivia.\n\nThe round will end after 20 questions. Questions will be in the category: ${category.name}. You will have 15 seconds to answer each question. All questions are multiple choice. You can answer a question by using the reaction that corresponds to your choice\n\nThe round will start in 1 minute.`);
            this.questions = await TriviaService.getQuestions(category.id);
            this.startQuestions();
        } catch (error) {
            console.error(error);
        }
    }

    startQuestions() {
        setTimeout(() => {
            this.askQuestion();
        }, 60000);
    }

    askQuestion() {
        const question = this.questions[this.currentQuestion];
        let text = `Question #${this.currentQuestion + 1}\n\n${question.text}\n`;

        for (let index = 0; index < question.answers.length; index += 1) {
            text += `\n${emojis[index]} ${question.answers[index].text}`;
        }

        return this.message.clearReactions()
            .then(() => {
                this.message.edit(text)
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

                                this.questionResults(Array.from(userReactions.values()));
                            })
                            .catch(console.error);
                    })
                    .catch(console.error);
            })
            .catch(console.error);
    }

    questionResults(reactions) {
        this.message.clearReactions();
        const correctAnswer = {
            index: this.questions[this.currentQuestion].answers.findIndex(answer => answer.correct),
        };
        correctAnswer.text = this.questions[this.currentQuestion].answers[correctAnswer.index].text;
        let resultText = `The correct answer is ${emojis[correctAnswer.index]}, ${correctAnswer.text}\n`;

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

        resultText += this.scoreboardText();
        this.message.edit(resultText);
    }

    scoreboardText() {
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
        let scoreboardText = '\nSCOREBOARD';
        scoreboardText = scores.reduce((text, score) => `${text}\n${score.username}: ${score.correct}`, scoreboardText);

        return scoreboardText;
    }

    end() {
        let messageText = `Thanks for playing.\n\nTotal questions this round: ${this.currentQuestion + 1}\n`;
        messageText += this.scoreboardText();

        this.answerCounts.forEach((count, key) => {
            DBUtils.addScore({
                userId: key, total: count.total, correct: count.correct, roundId: this.roundId,
            });
        });

        this.message.edit(messageText);
    }
}

module.exports = Start;
