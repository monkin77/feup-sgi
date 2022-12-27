import { CGFappearance, CGFtexture } from "../../../../lib/CGF.js";
import { player1, startRowsWithDiscs, tilesPerSide } from "../../../utils/checkers.js";
import MyGameOrchestrator from "./MyGameOrchestrator.js";
import MyPiece from "./MyPiece.js";
import MyTile from "./MyTile.js";

// Class for a Checkers board
export default class MyBoard {
    /**
     *
     * @param {MySceneGraph} sceneGraph MySceneGraph object to use already created components and access the scene object
     * @param {*} x
     * @param {*} y
     * @param {*} z
     * @param {*} sideLength
     */
    constructor(sceneGraph, x, y, z, sideLength) {
        this._sceneGraph = sceneGraph; // TODO: Alternative to using the scene graph

        this._scene = sceneGraph.scene;
        this._x = x;
        this._y = y;
        this._z = z;
        this._sideLength = sideLength;
        this._tileSideLength = sideLength / tilesPerSide;

        this.buildTiles();
        this._capturedPieces = []; // TODO: Display captured pieces

        this._woodMaterial = new CGFappearance(this._scene); // Appearence for wood with default values
        this._woodMaterial.setAmbient(1, 1, 1, 1);
        this._woodMaterial.setDiffuse(1, 1, 1, 1);
        this._woodMaterial.setSpecular(1, 1, 1, 1);

        this._whiteTileTexture = new CGFtexture(this._scene, "scenes/images/board/light_tile.png");
        this._blackTileTexture = new CGFtexture(this._scene, "scenes/images/board/dark_tile.png");
        this._whiteDiscTexture = new CGFtexture(this._scene, "scenes/images/board/light_wood_disc2.jpg");
        this._blackDiscTexture = new CGFtexture(this._scene, "scenes/images/board/dark_wood_disc2.jpg");
    }

    /**
     * Auxiliary function to build the tiles of the board
     */
    buildTiles() {
        const tiles = [];
        const whitePieces = [];
        const blackPieces = [];

        for (let i = 0; i < tilesPerSide; i++) {
            const isEdgeRow = i == 0 || i == tilesPerSide - 1;
            const offset = i % 2 == 0 ? 0 : 1; // offset for the tiles in the odd rows
            for (let j = 0; j < tilesPerSide; j++) {
                const idNumber = i * tilesPerSide + j;
                const isWhite = (j + offset) % 2 != 0;

                let piece = null;
                if (!isWhite && (i < startRowsWithDiscs || i > tilesPerSide - startRowsWithDiscs - 1)) {
                    // If the tile is in the first or last rows, it has a piece
                    piece = new MyPiece(this._sceneGraph, `piece-${idNumber}`, i < startRowsWithDiscs, this._tileSideLength);

                    // Add new Piece to the corresponding array
                    if (isWhite) whitePieces.push(piece);
                    else blackPieces.push(piece);
                }

                tiles.push(
                    new MyTile(
                        this._scene,
                        `tile-${idNumber}`,
                        this._tileSideLength,
                        isWhite, isEdgeRow,
                        piece
                    )
                );
            }
        }

        this._tiles = tiles;
        this._whitePieces = whitePieces;
        this._blackPieces = blackPieces;
    }

    /**
     * Moves a piece from one tile to another. Checks if any piece is captured and updates the board
     * @param {MyPiece} piece
     * @param {MyTile} fromTile
     * @param {MyTile} toTile
     */
    movePiece(piece, fromTile, toTile) {
        if (!piece) throw new Error("The piece is null");
        if (!fromTile.hasPiece()) throw new Error("The tile doesn't have a piece to move");
        if (toTile.hasPiece()) throw new Error("The tile already has a piece");

        fromTile.removePiece();
        toTile.setPiece(piece);
        toTile.checkAndUpgradeToKing();

        const middleTiles = this.getDiagonalBetweenTiles(fromTile, toTile);
        for (const tile of middleTiles) {
            if (tile.hasPiece()) {
                this._capturedPieces.push(tile.piece);
                tile.removePiece();
            }
        }
    }

    /**
     * Gets the possible moves of a given tile
     * @param {MyTile} tile
     * @returns {MyTile[]} Array of possible tiles to move to
     */
    getPossibleMoves(tile) {
        if (!tile.hasPiece()) return [];

        const piece = tile.piece;
        const { i: tileRow, j: tileCol } = this.getTileCoordinates(tile);
        const possibleMoves = [];

        const directions = [];
        if (piece.isWhite || piece.isKing) directions.push({ i: 1, j: 1 }, { i: 1, j: -1 });
        if (!piece.isWhite || piece.isKing) directions.push({ i: -1, j: 1 }, { i: -1, j: -1 });

        for (const direction of directions) {
            if (piece.isKing) {
                let jumpedOver = false;
                for (let i = tileRow + direction.i, j = tileCol + direction.j; 
                    i < tilesPerSide && j < tilesPerSide && i >= 0 && j >= 0;
                    i += direction.i, j += direction.j) {
                    const nextTile = this.getTileByCoordinates(i, j);

                    if (nextTile.hasPiece()) {
                        if (piece.isSameColorAs(nextTile.piece)) break; // Can't jump over a piece of the same color
                        if (jumpedOver) break; // Can't jump over more than one piece
                        jumpedOver = true;
                    } else {
                        possibleMoves.push(nextTile);
                    }
                }
            } else {
                const i = tileRow + direction.i;
                const j = tileCol + direction.j;
                const nextTile = this.getTileByCoordinates(i, j);

                if (!nextTile) continue; // Out of bounds

                if (nextTile.hasPiece()) {
                    if (piece.isSameColorAs(nextTile.piece)) continue; // Can't jump over a piece of the same color

                    const jumpI = i + direction.i;
                    const jumpJ = j + direction.j;
                    const jumpTile = this.getTileByCoordinates(jumpI, jumpJ);

                    if (jumpTile && !jumpTile.hasPiece()) {
                        possibleMoves.push(jumpTile);
                    }
                } else {
                    possibleMoves.push(nextTile);
                }
            }
        }

        return possibleMoves;
    }

    /**
     * Gets the tiles between two tiles in a diagonal
     * Throws an error if the tiles are not in a diagonal
     * @param {MyTile} fromTile
     * @param {MyTile} toTile
     * @returns {MyTile[]} Array of tiles between the two tiles
     */
    getDiagonalBetweenTiles(fromTile, toTile) {
        const { i: fromRow, j: fromCol } = this.getTileCoordinates(fromTile);
        const { i: toRow, j: toCol } = this.getTileCoordinates(toTile);

        if (Math.abs(toRow - fromRow) != Math.abs(toCol - fromCol)) {
            throw Error("The tiles are not in a diagonal");
        }

        const diagonalTiles = [];
        for (let i = fromRow, j = fromCol; i != toRow && j != toCol; 
            i += Math.sign(toRow - fromRow), j += Math.sign(toCol - fromCol)) {
            diagonalTiles.push(this.getTileByCoordinates(i, j));
        }

        return diagonalTiles;
    }

    /**
     * Displays the board
     * @param {number} turn
     * @param {MyTile} selectedTile
     */
    display(turn = null, selectedTile = null) {
        this._scene.pushMatrix();

        // Rotate board to draw it in the XZ plane
        this._scene.translate(this._x, this._y, this._z);
        this._scene.rotate(-Math.PI / 2, 1, 0, 0);


        // Apply wood material
        this._woodMaterial.apply();

        // Calculate the possible moves from the selected tile
        const possibleTiles = selectedTile ? this.getPossibleMoves(selectedTile) : [];

        // Draw the tiles
        this.drawTilesColor(true, turn, possibleTiles);
        this.drawTilesColor(false, turn, possibleTiles);

        // Draw the pieces
        this.drawPiecesColor(true, selectedTile);
        this.drawPiecesColor(false, selectedTile);

        this._scene.popMatrix();
    }

    /**
     * Draws the tiles of the board with the given color
     * @param {boolean} isWhite
     * @param {number} turn
     * @param {MyTile[]} possibleTiles Possible target tiles from the selected tile
     */
    drawTilesColor(isWhite, turn, possibleTiles) {
        const tileTexture = isWhite ? this._whiteTileTexture : this._blackTileTexture;
        // Apply texture for white tiles
        this._woodMaterial.setTexture(tileTexture);
        this._woodMaterial.setTextureWrap("REPEAT", "REPEAT");
        this._woodMaterial.apply();

        for (let i = 0; i < tilesPerSide; i++) {
            let offset = i % 2 == 0 ? 0 : 1; // offset for the tiles in the odd rows (black tiles)
            if (isWhite) offset = 1 - offset; // Offset for the white tiles is the opposite of the black tiles

            for (let j = offset; j < tilesPerSide; j += 2) {
                this._scene.pushMatrix();
                this._scene.translate(j * this._tileSideLength, i * this._tileSideLength, 0);

                const currTileIdx = i * tilesPerSide + j;
                const currTile = this._tiles[currTileIdx];

                const isTargetTile = possibleTiles.includes(currTile);
                currTile.registerPicking(turn, isTargetTile, MyGameOrchestrator.pickingId++);

                if (isTargetTile) this.highlightMaterial();

                currTile.display();

                if (isTargetTile) this.resetMaterial();

                this._scene.popMatrix();
            }
        }
    }

    /**
     * TODO: Perform the move and change turn
     * TODO: Add Light on top of selected piece
     */

    /**
     * Draws the pieces of the board with the given color
     * @param {*} isWhite
     * @param {MyTile} selectedTile
     */
    drawPiecesColor(isWhite, selectedTile) {
        const tileTexture = isWhite ? this._whiteDiscTexture : this._blackDiscTexture;
        // Apply texture for white tiles
        this._woodMaterial.setTexture(tileTexture);
        this._woodMaterial.setTextureWrap("REPEAT", "REPEAT");
        this._woodMaterial.apply();

        for (let i = 0; i < tilesPerSide; i++) {
            for (let j = 0; j < tilesPerSide; j++) {
                const tileIdx = i * tilesPerSide + j;
                const tile = this._tiles[tileIdx];
                if (tile.hasPiece() && tile.piece.isWhite == isWhite) {
                    this._scene.pushMatrix();
                    this._scene.translate(j * this._tileSideLength, i * this._tileSideLength, 0);

                    if (selectedTile == tile) this.highlightMaterial();
                    
                    tile.displayPiece();
                    
                    if (selectedTile == tile) this.resetMaterial();

                    this._scene.popMatrix();
                }
            }
        }
    }

    /**
     * Highlights the board's material
     */
    highlightMaterial() {
        this._woodMaterial.setAmbient(0.8, 0.8, 0, 1);
        this._woodMaterial.setDiffuse(0.8, 0.8, 0, 1);
        this._woodMaterial.setSpecular(0.8, 0.8, 0, 1);
        this._woodMaterial.setEmission(0.4, 0.4, 0.4, 1);
        this._woodMaterial.apply();
    }

    resetMaterial() {
        this._woodMaterial.setAmbient(1, 1, 1, 1);
        this._woodMaterial.setDiffuse(1, 1, 1, 1);
        this._woodMaterial.setSpecular(1, 1, 1, 1);
        this._woodMaterial.setEmission(0, 0, 0, 1);
        this._woodMaterial.apply();
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

    /**
     * Returns the tile that is at the given distance from the board's origin
     * @param {*} x distance in the x axis
     * @param {*} y distance in the y axis
     * @returns {MyTile} the tile at the given distance
     */
    getTileByDistance(x, y) {
        const i = Math.floor(y / this._tileSideLength);
        const j = Math.floor(x / this._tileSideLength);
        return this.getTileByCoordinate(i, j);
    }

    /**
     * Returns the tile at the given coordinates
     * @param {*} i row index
     * @param {*} j column index
     * @returns {MyTile|null} the tile at the given coordinates or null if the coordinates are out of bounds
     */
    getTileByCoordinates(i, j) {
        if (i < 0 || i >= tilesPerSide || j < 0 || j >= tilesPerSide) return null;
        return this._tiles[i * tilesPerSide + j];
    }

    /**
     * Gets the coordinates of the given tile
     * @param {MyTile} tile
     */
    getTileCoordinates(tile) {
        // TODO: Consider adding coordinates to the tile class
        const index = this._tiles.indexOf(tile);
        const i = Math.floor(index / tilesPerSide);
        const j = index % tilesPerSide;
        return { i, j };
    }

    /**
     * Clones the board
     */
    clone() {
        const clone = Object.create(
            Object.getPrototypeOf(this),
            Object.getOwnPropertyDescriptors(this)
        );
        clone._tiles = clone._tiles.map(tile => tile.clone());
        clone._capturedPieces = this._capturedPieces.map(piece => piece.clone());
        return clone;
    }
}