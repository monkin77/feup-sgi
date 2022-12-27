import { MyRectangle } from "../../../primitives/MyRectangle.js";
import { isPlayerTurn } from "../../../utils/checkers.js";
import MyPiece from "./MyPiece.js";

export default class MyTile {
    /**
     *
     * @param {*} scene
     * @param {*} id
     * @param {*} sideLength length of the tile's side to avoid having to scale the scene
     * @param {*} isWhite whether the tile is white or black
     * @param {MyPiece | null} piece MyPiece object if the tile has a piece on it, null otherwise
     */
    constructor(scene, id, sideLength, isWhite, isEdgeRow, piece = null) {
        this._scene = scene; // TODO: Do we need the scene?
        this._id = id;
        this._isWhite = isWhite;
        this._tileSideLength = sideLength;
        this._rectangle = new MyRectangle(scene, id, 0, sideLength, 0, sideLength);
        this._isEdgeRow = isEdgeRow;

        // The piece on the tile (if any)
        this._piece = piece;
    }

    /**
     * Displays the tile
     */
    display() {
        this._rectangle.display();
    }

    /**
     * Displays the piece on the tile
     * If there is no piece on the tile, nothing is displayed
     */
    displayPiece() {
        this._piece?.display(true, this);
    }

    /**
     * Verifies if the tile has a piece on it from the current player's turn and registers it for picking if it does, incrementing the currPickId
     * @param {number} turn number representing the current player's turn
     * @param {boolean} isTargetTile Whether this tile is a possible target from the selected tile
     * @param {number} currPickId 
     * @returns true if the tile was registered for picking, false otherwise
     */
    registerPicking(turn, isTargetTile, currPickId) {
        // If the tile has a piece on it and it's the player's turn, register it for picking
        if (this.hasPiece() && isPlayerTurn(turn, this._piece.isWhite)) {
            // Register the tile's Rectangle and Piece for picking with the currPickId
            this.setTileAndPiecePicking(currPickId);
            return true;
        } else if (isTargetTile) {
            // If the tile is a possible target tile, register it for picking with the currPickId
            this.setTileAndPiecePicking(currPickId);
            return true;
        }

        // Indicate that the tile was not registered for picking
        this.setTileAndPiecePicking(-1);
        return false;
    }

    setTileAndPiecePicking(pickId) {
        this._scene.registerForPick(pickId, this);
        if (this.hasPiece()) this._piece.registerPicking(pickId);
    }

    get id() {
        return this._id;
    }

    get isWhite() {
        return this._isWhite;
    }

    get piece() {
        return this._piece;
    }

    /**
     * @returns {boolean} Whether the tile has a piece on it
     */
    hasPiece() { return this._piece != null }

    /**
     * Sets a piece on the tile
     * @param {MyPiece} piece
     */
    setPiece(piece) {
        if (this._piece != null) throw Error("Tile already occupied");
        this._piece = piece;
    }

    /**
     * Removes the piece from the tile
     */
    removePiece() {
        this._piece = null;
    }

    /**
     * Checks if the piece can be upgraded to a king
     */
    checkAndUpgradeToKing() {
        if (this._isEdgeRow && this._piece != null) {
            this._piece.upgradeToKing();
            return true;
        }
        return false;
    }

    /**
     * Clones the tile
     */
    clone() {
        const clone = Object.create(
            Object.getPrototypeOf(this),
            Object.getOwnPropertyDescriptors(this)
        );
        clone._piece = this._piece?.clone();
        return clone;
    }
}
