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
     */
    undo() {
        this._moves.pop();
    }

    /**
     * Replays the sequence of moves
     */
    replay() {
        // TODO: Replay
    }
}