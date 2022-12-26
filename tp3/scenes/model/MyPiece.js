import { MySceneGraph } from "../../MySceneGraph.js";

// Scale factor to make the piece smaller than the tile
const pieceScaleFactor = 0.65;

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
     * @param {*} height 
     */
    constructor(sceneGraph, id, isWhite, sideLength, height = 1) {
        this._sceneGraph = sceneGraph; // TODO: Alternative to using the scene graph

        this._scene = sceneGraph.scene;
        this._id = id;
        this._isWhite = isWhite;
        this._sideLength = sideLength;
        this._discLength = sideLength * pieceScaleFactor;
        this._height = height;

        this._radius = this._discLength / 2;

        const coveredCylinder = this._sceneGraph.componentsParser.components["coveredCylinder"];
        this._coveredCylinder = coveredCylinder;
    }
    
    /**
     * Displays the piece on the board.
     * The piece is translated to the center of the tile.
     */
    display = () => {
        // Translate the disc to the center of the tile. Since the scene was already rotated, we translate in the x and y axis
        this._scene.translate(this._sideLength/2, this._sideLength/2, 0);
        this._scene.scale(this._radius, this._radius, 0.25);

        // Covered cylinder contains a diameter of 2 and a height of 2
        
        this._sceneGraph.drawComponent(this._coveredCylinder);
    }

    /**
     * Registers Piece for picking
     * @param {number} currPickId 
     */
    registerPicking(currPickId) {
        this._coveredCylinder.setPickId(currPickId);
        // this._sceneGraph.registerPickingComponent(this._coveredCylinder, currPickId);
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