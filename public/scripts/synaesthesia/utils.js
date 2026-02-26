/**
 * utils.js
 * Ported from wheelibin/synaesthesia (MIT License)
 * Adapted for ES module / browser use (no bundler).
 */

export const randomIntBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

export const isNumeric = value => {
    return !isNaN(value - parseFloat(value));
};

export const randomFromArray = array => {
    return array[randomIntBetween(0, array.length - 1)];
};

export const shuffleArray = array => {
    let counter = array.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
};
