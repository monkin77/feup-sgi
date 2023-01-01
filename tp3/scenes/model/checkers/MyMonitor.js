import { CGFtexture } from "../../../../lib/CGF.js";
import { MySceneGraph } from "../../../MySceneGraph.js";

const ceilingHeight = 40;
const quadPrismLargeSide = 2;

export default class MyMonitor {
    /**
     * 
     * @param {MySceneGraph} sceneGraph
     * @param {number} sideLength
     * @param {CGFappearance} boardMaterial
     */
    constructor(sceneGraph, sideLength, boardMaterial) {
        this._sceneGraph = sceneGraph;
        this._scene = sceneGraph.scene;

        this._boardMaterial = boardMaterial;
        this._texture = new CGFtexture(this._scene, "scenes/images/board/storage_wood.jpg");

        this._sceneComponents = this._sceneGraph.componentsParser.components;
        const quadrangularPrism = this._sceneComponents["quadrangularPrism"];
        this._quadPrism = quadrangularPrism.copy();

        this.updatePosAndSize(sideLength);
    }

    /**
     * Method to update the dimensions of the Monitor and the components that depend on it
     * @param {*} newSideLength 
     */
    updatePosAndSize(newSideLength) {
        this._sideLength = newSideLength;

        this._poleLength = 8;
        this._poleWidth = 1;

        this._monitorWidth = newSideLength / 2.5;
        this._monitorHeight = 8; 
    }

    display() {
        // Draw The Monitor
        this._scene.pushMatrix();

        let translateHeight = ceilingHeight - (this._poleLength / 2) - (this._monitorHeight/2);
        let translateXY = this._sideLength / 2 - this._monitorWidth / 2;
        this._scene.translate(translateXY, translateXY + this._monitorWidth/2, translateHeight);
        this._scene.scale(this._monitorWidth/quadPrismLargeSide, this._monitorWidth, this._monitorHeight);

        this._sceneGraph.drawComponent(this._quadPrism);

        this._scene.popMatrix();

        // Draw the Pole
        this._scene.pushMatrix();

        translateHeight = ceilingHeight - (this._poleLength / 2);
        translateXY = this._sideLength / 2 - this._poleWidth / 2;
        this._scene.translate(translateXY, translateXY, translateHeight);

        const scaleXFactor = this._poleWidth / quadPrismLargeSide;
        this._scene.scale(scaleXFactor, this._poleWidth, this._poleLength);

        this._sceneGraph.drawComponent(this._quadPrism)

        this._scene.popMatrix();


    }

}
