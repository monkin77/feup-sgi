import { MyCylinder } from "../../primitives/MyCylinder.js";

// Scale factor to make the piece smaller than the tile
const pieceScaleFactor = 0.75;

/**
 * This class represents a piece on the board
 * Its responsability is to draw the piece on the board
 */
export default class MyPiece {
    /**
     * 
     * @param {*} scene 
     * @param {string} id "piece-<tileId>", where tileId is the id of the initial tile the piece is on 
     * @param {*} isWhite Whether the piece is white or black
     * @param {number} sideLength sideLength length of the tile the piece is on
     * @param {*} height 
     */
    constructor(scene, id, isWhite, sideLength, height = 1) {
        this._scene = scene;
        this._id = id;
        this._isWhite = isWhite;
        this._sideLength = sideLength;
        this._discLength = sideLength * pieceScaleFactor;
        this._height = height;

        this._radius = this._discLength / 2;
        this._disc = new MyCylinder(scene, id, this._radius, this._radius, height, 20, 20);
    }
    
    /**
     * Displays the piece on the board.
     * The piece is translated to the center of the tile.
     */
    display = () => {
        // Translate the disc to the center of the tile. Since the scene was already rotated, we translate in the x and y axis
        this._scene.translate(this._radius, this._radius, 0);

        this._disc.display();
    }

    get id() {
        return this._id;
    }

    get isWhite() {
        return this._isWhite;
    }

    get sideLength() {
        return this._sideLength;
    }

    get height() {
        return this._height;
    }

}