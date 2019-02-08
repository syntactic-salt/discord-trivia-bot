const shuffle = function shuffle(array) {
    const arrayClone = [...array];
    let currentIndex = arrayClone.length;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = arrayClone[currentIndex];
        arrayClone[currentIndex] = arrayClone[randomIndex];
        arrayClone[randomIndex] = temporaryValue;
    }

    return arrayClone;
};

module.exports = shuffle;
