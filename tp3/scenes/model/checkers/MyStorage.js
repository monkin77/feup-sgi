import { CGFtexture } from "../../../../lib/CGF.js";
import { MyRectangle } from "../../../primitives/MyRectangle.js";

export default class MyStorage {
    /**
     *
     * @param {XMLscene} scene 
     * @param {*} id
     * @param {*} isWhite whether the Storage is for the captured pieces by the white player or the black player
     */
    constructor(scene, id, sideLength, isWhite, boardMaterial) {
        this._scene = scene;
        this._id = id;
        this._sideLength = sideLength;
        this._storageWidth = sideLength / 4;
        this._isWhite = isWhite;
        this._boardMaterial = boardMaterial;

        this._rectangle = new MyRectangle(scene, id, 0, this._storageWidth, 0, sideLength);

        this._texture = new CGFtexture(this._scene, "scenes/images/board/storage_wood.jpg");
    }

    display() {
        this._boardMaterial.setTexture(this._texture);
        this._boardMaterial.setTextureWrap("REPEAT", "REPEAT");
        this._boardMaterial.apply();

        this._scene.pushMatrix();

        // Translate the storage to the correct position
        const translateX = this._isWhite ? -this._storageWidth : this._sideLength;
        this._scene.translate(translateX, 0, 0);

        this._rectangle.display();

        this._scene.popMatrix();
    }
}