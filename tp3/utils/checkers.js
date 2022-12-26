export const tilesPerSide = 8;

export const discsPerSide = 12;

export const startRowsWithDiscs = 3;

export const player1 = 0;
export const player2 = 1;

/**
 * Method to check if the pieces of a given color correspond to the current player's turn
 * @param {*} turn 
 * @param {*} isWhite 
 * @returns true if it's the turn of the player with the given color, false otherwise
 */
export const isPlayerTurn = (turn, isWhite) => {
    return (turn == player1 && isWhite) || (turn == player2 && !isWhite);
};


