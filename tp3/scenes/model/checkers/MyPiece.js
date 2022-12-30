import { CGFtexture } from "../../../../lib/CGF.js";
import { MySceneGraph } from "../../../MySceneGraph.js";
import { defaultFontSize } from "../../../utils/checkers.js";
import { displaySymbol } from "../../../utils/font.js";
import PickingInfo from "../PickingInfo.js";
import MyTile from "./MyTile.js";

// Scale factor to make the piece smaller than the tile
export const pieceScaleFactor = 0.65;

/**
 * This class represents a piece on the board
 * Its responsability is to draw the piece on the board
 */
export default class MyPiece {
    /**
     * @param {MySceneGraph} sceneGraph MySceneGraph object to use already created components and access the scene object
     * @param {string} id "piece-<tileId>", where tileId is the id of the initial tile the piece is on
     * @param {*} isWhite Whether the piece is white or black
     * @param {number} sideLength sideLength length of the tile the piece is on
     * @param {CGFtexture} texture
     * @param {CGFappearance} boardMaterial
     */
    constructor(sceneGraph, id, isWhite, sideLength, texture, boardMaterial) {
        this._sceneGraph = sceneGraph;
        this.animation = null;

        this._scene = sceneGraph.scene;
        this._id = id;
        this._isWhite = isWhite;
        this._sideLength = sideLength;
        this._discLength = sideLength * pieceScaleFactor;
        this._height = 2;   // Height of the piece
        this._texture = texture;
        this._boardMaterial = boardMaterial;

        this._radius = this._discLength / 2;

        this._sceneComponents = this._sceneGraph.componentsParser.components;
        const coveredCylinder = this._sceneComponents["coveredCylinder"];

        // Copy the covered cylinder to avoid changing the original
        this._coveredCylinder = coveredCylinder.copy();
        
        this._isKing = false;
    }

    /**
     * Display the piece. If the piece is on the board, it is translated to the center of the tile.
     * @param {boolean} onBoard Whether the piece is on the board or not
     * @param {MyTile | null} tile Tile the piece is on. Used to register the piece for picking with a pointer to the tile
     */
    display(onBoard = false, tile = null) {
        this._boardMaterial.setTexture(this._texture);
        this._boardMaterial.setTextureWrap("REPEAT", "REPEAT");
        this._boardMaterial.apply();

        this._scene.pushMatrix();

        if (this._animation) {
            this._animation.apply();
        }

        if (onBoard) this._scene.translate(this._sideLength/2, this._sideLength/2, 0);
        this._scene.scale(this._radius, this._radius, 0.25);

        // Covered cylinder contains a diameter of 2 and a height of 2
        // Currently, all the pieces are registering the picking id. If it's not selectable, it is being registered with -1
        this._sceneGraph.drawComponent(this._coveredCylinder, null, null, new PickingInfo(this._coveredCylinder.pickingId, tile));

        // If the piece is a king, draw a crown on top of it
        if (this._isKing && onBoard) {
            this._scene.pushMatrix();

            // Desired length of the crown
            const fontSideLength = this._radius * 2 * 0.85;
            // scale factor to achieve that length
            const fontScaleFactor =  fontSideLength / defaultFontSize;

            // Translate the crown to the top of the piece
            this._scene.translate(-fontSideLength/2, -fontSideLength/2, this._height + 0.1);
            this._scene.scale(fontScaleFactor, fontScaleFactor, 1);

            displaySymbol(this._scene, [9, 0], this._boardMaterial);

            this._scene.popMatrix();
        }

        this._scene.popMatrix();
    }

    /**
     * Registers Piece for picking
     * @param {number} currPickId 
     */
    registerPicking(currPickId) {
        this._coveredCylinder.setPickId(currPickId);
    }

    /**
     * Makes the piece a king
     */
    upgradeToKing() {
        this._isKing = true;
    }

    /**
     * Compares the color of another piece
     * @param {MyPiece} otherPiece
     */
    isSameColorAs(otherPiece) {
        return this._isWhite === otherPiece.isWhite;
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

    get isKing() {
        return this._isKing;
    }

    get animation() {
        return this._animation;
    }

    set animation(animation) {
        this._animation = animation;
    }

    get radius() {
        return this._radius;
    }

    /**
     * Clone the piece
     */
    clone() {
        return Object.create(
            Object.getPrototypeOf(this),
            Object.getOwnPropertyDescriptors(this)
        );
    }
}
