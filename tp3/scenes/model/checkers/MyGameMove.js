export default class MyGameMove {
    /**
     * @param {MyPiece} piece Piece to move
     * @param {MyTile} fromTile Tile the piece is moving from
     * @param {MyTile} toTile Tile the piece is moving to
     * @param {MyBoard} board Board the move is being made on
     */
    constructor(piece, fromTile, toTile, player, board) {
        this._piece = piece;
        this._fromTile = fromTile;
        this._toTile = toTile;
        this._player = player;
        this._board = board;
    }

    /**
     * Validates the move
     */
    validate() {
        const possibleMoves = this._board.getPossibleMoves(this._fromTile);
        if (!possibleMoves.includes(this._toTile)) return false;
        return true;
    }

    /**
     * Executes the move and returns an updated board.
     * Assumes a valid move
     */
    execute() {
        const newBoard = this._board.clone();
        const newFromTile = newBoard.tiles.find(t => t.id === this._fromTile.id);
        const newToTile = newBoard.tiles.find(t => t.id === this._toTile.id);
        const newPiece = newFromTile.piece;

        newBoard.movePiece(newPiece, newFromTile, newToTile);
        return newBoard;
    }

    get board() {
        return this._board;
    }

    get player() {
        return this._player;
    }

    get piece() {
        return this._piece;
    }

    get fromTile() {
        return this._fromTile;
    }

    get toTile() {
        return this._toTile;
    }
}
