export default class MyGameSequence {
    /**
     * @param {MyGameMove[]} moves Array of moves to be executed in sequence
     */
    constructor(moves = []) {
        this._moves = moves;
    }

    /**
     * Adds a move to the sequence
     * @param {MyGameMove} move
     */
    addMove(move) {
        this._moves.push(move);
    }

    /**
     * Goes back to the previous move in the sequence
     * Returns the move that was undone
     */
    undo() {
        return this._moves.pop();
    }

    get moves() {
        return this._moves;
    }
}