import { MyRectangle } from "../../primitives/MyRectangle.js";
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
    constructor(scene, id, sideLength, isWhite = true, piece = null) {
        this._scene = scene; // TODO: Do we need the scene?
        this._id = id;
        this._isWhite = isWhite;
        this._tileSideLength = sideLength;
        this._rectangle = new MyRectangle(scene, id, 0, sideLength, 0, sideLength);

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
        this._piece?.display();
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
}