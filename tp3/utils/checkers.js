export const tilesPerSide = 8;

export const discsPerSide = 12;

export const startRowsWithDiscs = 3;

export const player1 = 0;
export const player2 = 1;

export const boardState = {
    END: 0,
    MOVE_AGAIN: 1,
    SWITCH_PLAYER: 2,
};

// Variable to be returned when there are no possible moves [[list of moves], canCapture]
export const noPossibleMoves = [[], false];

export const defaultFontSize = 2.5;

/**
 * Method to check if the pieces of a given color correspond to the current player's turn
 * @param {*} turn 
 * @param {*} isWhite 
 * @returns true if it's the turn of the player with the given color, false otherwise
 */
export const isPlayerTurn = (turn, isWhite) => {
    return (turn == player1 && isWhite) || (turn == player2 && !isWhite);
};

export const switchPlayer = (turn) => {
    return turn == player1 ? player2 : player1;
}

/**
 * 
 * @param {number} player 
 * @returns true if the player is white, false otherwise
 */
export const isWhitePlayer = (player) => (
    player == player1
)

