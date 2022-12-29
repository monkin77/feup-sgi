export const convertDigitToCharCoords = (digit) => {
    if (digit < 0 || digit > 9) throw new Error("Invalid digit");

    return [digit, 3];
};

export const convertUppercaseLetterToCharCoords = (letter) => {
    if (letter < "A" || letter > "Z") throw new Error("Invalid lupper case etter");

    if (letter <= "O") {
        const digit = letter.charCodeAt(0) - "A".charCodeAt(0) + 1;
        return [digit, 4];
    } else {
        const digit = letter.charCodeAt(0) - "P".charCodeAt(0);
        return [digit, 5];
    }
};

export const convertLowercaseLetterToCharCoords = (letter) => {
    if (letter < "a" || letter > "z") throw new Error("Invalid lower case etter");

    if (letter <= "o") {
        const digit = letter.charCodeAt(0) - "a".charCodeAt(0) + 1;
        return [digit, 6];
    } else {
        const digit = letter.charCodeAt(0) - "p".charCodeAt(0);
        return [digit, 7];
    }
};
