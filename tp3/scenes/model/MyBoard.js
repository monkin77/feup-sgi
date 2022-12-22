import MyTile from "./MyTile.js";

const tilesPerSide = 8;
const discsPerSide = 12;

// Class for a Checkers board
export default class MyBoard {
    constructor(x, y, z, sideLength) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._sideLength = sideLength;
        this.buildTiles();
    }

    /**
     * Auxiliary function to build the tiles of the board
     */
    buildTiles = () => {
        const tiles = [];

        for (let i = 0; i < tilesPerSide; i++) {
            for (let j = 0; j < tilesPerSide; j++) {
                const offset = j % 2 == 0 ? 0 : 1; // offset for the tiles in the odd rows
                tiles.push(new MyTile(i * tilesPerSide + j, (i + offset) % 2 != 0));
            }
        }

        this._tiles = tiles;
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

    /**
     * 
     * @returns {number} the length of a tile side
     */
    tileSideLength = () => this._sideLength / tilesPerSide;
}