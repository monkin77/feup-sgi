import { CGFappearance } from "../../../lib/CGF.js";
import { startRowsWithDiscs, tilesPerSide } from "../../utils/checkers.js";
import MyPiece from "./MyPiece.js";
import MyTile from "./MyTile.js";

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
                const idNumber = i * tilesPerSide + j;
                const offset = j % 2 == 0 ? 0 : 1; // offset for the tiles in the odd rows

                let piece = null;
                if (i < startRowsWithDiscs || i > tilesPerSide - startRowsWithDiscs - 1) {
                    // If the tile is in the first or last rows, it has a piece
                    piece = new MyPiece(this._scene, `piece-${idNumber}`, i < startRowsWithDiscs, this._tileSideLength);
                }

                tiles.push(new MyTile(this._scene, `tile-${idNumber}`, this._tileSideLength, (i + offset) % 2 != 0, piece));
            }
        }

        this._tiles = tiles;
    }

    display = () => {
        this._scene.pushMatrix();

        // Rotate board to draw it in the XZ plane
        this._scene.translate(this._x, this._y, this._z);
        this._scene.rotate(-Math.PI / 2, 1, 0, 0);


        // Apply wood material
        this._woodMaterial.apply();

        // TODO: Draw white tiles first, then black tiles to avoid changing the texture for each tile
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