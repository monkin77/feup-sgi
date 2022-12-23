import { CGFappearance } from "../../../lib/CGF.js";
import MyTile from "./MyTile.js";

const tilesPerSide = 8;
const discsPerSide = 12;

// Class for a Checkers board
export default class MyBoard {
    constructor(scene, x, y, z, sideLength) {
        this._scene = scene;
        this._x = x;
        this._y = y;
        this._z = z;
        this._sideLength = sideLength;
        this._tileSideLength = sideLength / tilesPerSide;
        this.buildTiles();

        this._woodMaterial = new CGFappearance(this._scene); // Appearence for wood with default values
        this._woodMaterial.setAmbient(1, 1, 1, 1);
        this._woodMaterial.setDiffuse(1, 1, 1, 1);
        this._woodMaterial.setSpecular(1, 1, 1, 1);
    }

    /**
     * Auxiliary function to build the tiles of the board
     */
    buildTiles = () => {
        const tiles = [];

        for (let i = 0; i < tilesPerSide; i++) {
            for (let j = 0; j < tilesPerSide; j++) {
                const offset = j % 2 == 0 ? 0 : 1; // offset for the tiles in the odd rows
                tiles.push(new MyTile(this._scene, `tile-${i * tilesPerSide + j}`, this._tileSideLength, (i + offset) % 2 != 0));
            }
        }

        this._tiles = tiles;
    }

    display = () => {
        this._scene.pushMatrix();

        // Rotate board to draw it in the XZ plane
        this._scene.rotate(-Math.PI / 2, 1, 0, 0);
        this._scene.translate(this._x, this._y, this._z);

        // Apply wood material
        this._woodMaterial.apply();

        for (let i = 0; i < tilesPerSide; i++) {
            for (let j = 0; j < tilesPerSide; j++) {
                this._scene.pushMatrix();
                this._scene.translate(j * this._tileSideLength, i * this._tileSideLength, 0);
                this._tiles[i * tilesPerSide + j].display(this._woodMaterial);
                this._scene.popMatrix();
            }
        }

        this._scene.popMatrix();
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get z() {
        return this._z;
    }

    get sideLength() {
        return this._sideLength;
    }

    get tiles() {
        return this._tiles;
    }

    get tileSideLength() {
        return this._tileSideLength;
    }
}