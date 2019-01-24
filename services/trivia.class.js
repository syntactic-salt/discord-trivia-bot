const https = require('https');
const shuffle = require('../helpers/shuffle_array');

class TriviaService {
    static getCategories() {
        return new Promise((resolve, reject) => {
            https.get('https://opentdb.com/api_category.php', (resp) => {
                let data = '';

                resp.on('data', (chunk) => {
                    data += chunk;
                });

                resp.on('end', () => {
                    const response = JSON.parse(data);
                    const categories = response.trivia_categories;
                    categories.sort((categoryA, categoryB) => {
                        if (categoryA.name > categoryB.name) {
                            return 1;
                        } if (categoryA.name < categoryB.name) {
                            return -1;
                        }

                        return 0;
                    });

                    resolve(categories);
                });
            }).on('error', reject);
        });
    }

    static getQuestions(categoryId) {
        return new Promise((resolve, reject) => {
            https.get(`https://opentdb.com/api.php?amount=20&category=${categoryId}&type=multiple&encode=base64`, (resp) => {
                let data = '';

                resp.on('data', (chunk) => {
                    data += chunk;
                });

                resp.on('end', () => {
                    const response = JSON.parse(data);
                    const questions = response.results.map(({ question, correct_answer, incorrect_answers }) => {
                        const text = Buffer.from(question, 'base64').toString();
                        const answers = [{ text: Buffer.from(correct_answer, 'base64').toString(), correct: true }];
                        answers.push(...incorrect_answers.map(answer => ({ text: Buffer.from(answer, 'base64').toString(), correct: false })));
                        return { text, answers: shuffle(answers) };
                    });

                    resolve(shuffle(questions));
                });
            }).on('error', reject);
        });
    }
}

module.exports = TriviaService;
