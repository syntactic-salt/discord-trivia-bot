const https = require('https');

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
                        } else if (categoryA.name < categoryB.name) {
                            return -1;
                        }

                        return 0;
                    });

                    resolve(categories);
                });
            }).on("error", error => reject(error));
        });
    }
}

module.exports = TriviaService;
