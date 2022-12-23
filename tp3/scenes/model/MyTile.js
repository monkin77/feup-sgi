import { CGFtexture } from "../../../lib/CGF.js";
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
    constructor(scene, id, sideLength, isWhite = true, piece) {
        this._scene = scene;
        this._id = id;
        this._isWhite = isWhite;
        this._tileSideLength = sideLength;
        this._rectangle = new MyRectangle(scene, id, 0, sideLength, 0, sideLength);

        const texturePath = isWhite ? "scenes/images/board/light_tile.png" : "scenes/images/board/dark_tile.png";
        this._tileTexture = new CGFtexture(this._scene, texturePath);

        // The piece on the tile (if any)
        this._piece = piece;
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

        // TODO: Draw all the white pieces first, and then all the black pieces. To avoid changing the texture every time
        if (this.hasPiece()) {
            this._piece.display(woodAppearence);
        }
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

    hasPiece = () => this._piece != null;

    /**
     * Sets a piece on the tile
     * @param {MyPiece} piece 
     * @returns false if the tile is already occupied, true otherwise
     */
    setPiece = (piece) => {
        if (this._piece != null) return false; // Tile already occupied

        this._piece = piece;
        return true;
    }
}