import { CGFappearance, CGFtexture } from "../../../lib/CGF.js";
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

        this._whiteTileTexture = new CGFtexture(this._scene, "scenes/images/board/light_tile.png");
        this._blackTileTexture = new CGFtexture(this._scene, "scenes/images/board/dark_tile.png");
    }

    /**
     * Auxiliary function to build the tiles of the board
     */
    buildTiles = () => {
        const tiles = [];

        for (let i = 0; i < tilesPerSide; i++) {
            for (let j = 0; j < tilesPerSide; j++) {
                const idNumber = i * tilesPerSide + j;
                const offset = i % 2 == 0 ? 0 : 1; // offset for the tiles in the odd rows

                let piece = null;
                if (i < startRowsWithDiscs || i > tilesPerSide - startRowsWithDiscs - 1) {
                    // If the tile is in the first or last rows, it has a piece
                    piece = new MyPiece(this._scene, `piece-${idNumber}`, i < startRowsWithDiscs, this._tileSideLength);
                }

                tiles.push(new MyTile(this._scene, `tile-${idNumber}`, this._tileSideLength, (j + offset) % 2 != 0, piece));
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
        // Draw the tiles
        this.drawTilesColor(true);
        this.drawTilesColor(false);

        // Draw the pieces

        this._scene.popMatrix();
    }

    /**
     * 
     * @param {*} isWhite 
     */
    drawTilesColor = (isWhite) => {
        const tileTexture = isWhite ? this._whiteTileTexture : this._blackTileTexture;
        // Apply texture for white tiles
        this._woodMaterial.setTexture(tileTexture);
        this._woodMaterial.setTextureWrap("REPEAT", "REPEAT");
        this._woodMaterial.apply();

        for (let i = 0; i < tilesPerSide; i++) {
            let offset = i % 2 == 0 ? 0 : 1; // offset for the tiles in the odd rows (black tiles)
            if (isWhite) offset = 1 - offset;   // Offset for the white tiles is the opposite of the black tiles

            for (let j = offset; j < tilesPerSide; j += 2) {
                this._scene.pushMatrix();
                this._scene.translate(j * this._tileSideLength, i * this._tileSideLength, 0);
                this._tiles[i * tilesPerSide + j].display();
                this._scene.popMatrix();
            }
        }
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