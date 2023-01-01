import { CGFtexture } from "../../../../lib/CGF.js";
import { MySceneGraph } from "../../../MySceneGraph.js";

const ceilingHeight = 40;

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

        this._poleLength = 6;
        this._poleWidth = 1;

        this._monitorWidth = newSideLength / 3;
        this._monitorHeight = 10; 
    }

    display() {
        this._scene.pushMatrix();

        const monitorHeight = ceilingHeight - this._poleLength - this._monitorHeight;
        this._scene.translate(this._sideLength / 2, this._sideLength / 2, monitorHeight);

        // TODO: Confirm if I need to specify picking -1
        this._sceneGraph.drawComponent(this._quadPrism);


        this._scene.popMatrix();
    }

}
