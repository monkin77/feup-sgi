import { CGFtexture } from "../../../lib/CGF.js";
import { MyRectangle } from "../../primitives/MyRectangle.js";

export default class MyTile {
    /**
     * 
     * @param {*} scene 
     * @param {*} id 
     * @param {*} sideLength length of the tile's side to avoid having to scale the scene
     * @param {*} isWhite whether the tile is white or black
     */
    constructor(scene, id, sideLength, isWhite = true) {
        this._scene = scene;
        this._id = id;
        this._isWhite = isWhite;
        this._tileSideLength = sideLength;
        this._rectangle = new MyRectangle(scene, id, 0, sideLength, 0, sideLength);

        const texturePath = isWhite ? "scenes/images/board/light_tile.png" : "scenes/images/board/dark_tile.png";
        this._tileTexture = new CGFtexture(this._scene, texturePath);
    }

    /**
     * Displays the tile
     * @param {*} woodAppearence appearence to apply the texture
     */
    display = (woodAppearence) => {
        // Apply texture to the tile
        woodAppearence.setTexture(this._tileTexture);
        woodAppearence.setTextureWrap("REPEAT", "REPEAT");
        woodAppearence.apply();

        this._rectangle.display();
    }

    get id() {
        return this._id;
    }

    get isWhite() {
        return this._isWhite;
    }
}