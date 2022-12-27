import { CGFtexture } from "../../../../lib/CGF.js";
import { MySceneGraph } from "../../../MySceneGraph.js";
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
     * @param {*} height
     */
    constructor(sceneGraph, id, isWhite, sideLength, texture, boardMaterial, height = 1,) {
        this._sceneGraph = sceneGraph; // TODO: Alternative to using the scene graph
        this.animation = null;

        this._scene = sceneGraph.scene;
        this._id = id;
        this._isWhite = isWhite;
        this._sideLength = sideLength;
        this._discLength = sideLength * pieceScaleFactor;
        this._height = height;
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

        if (onBoard) this._scene.translate(this._sideLength/2, this._sideLength/2, 0);
        this._scene.scale(this._radius, this._radius, 0.25);

        if (this._animation) {
            this._animation.apply();
        }

        // Covered cylinder contains a diameter of 2 and a height of 2
        // Currently, all the pieces are registering the picking id. If it's not selectable, it is being registered with -1
        this._sceneGraph.drawComponent(this._coveredCylinder, null, null, new PickingInfo(this._coveredCylinder.pickingId, tile));

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
        // TODO: Change the height and appearance of the piece to a king
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
