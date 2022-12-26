export default class MyGameMove {
    /**
     * @param {MyPiece} piece Piece to move
     * @param {MyTile} fromTile Tile the piece is moving from
     * @param {MyTile} toTile Tile the piece is moving to
     * @param {MyBoard} board Board the move is being made on
     */
    constructor(piece, fromTile, toTile, board) {
        this._piece = piece;
        this._fromTile = fromTile;
        this._toTile = toTile;
        this._board = board;
    }

    animate() {
        // TODO: implement animation
    }
}