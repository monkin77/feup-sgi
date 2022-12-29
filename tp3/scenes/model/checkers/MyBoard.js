import { CGFappearance, CGFtexture } from "../../../../lib/CGF.js";
import { boardState, discsPerSide, noPossibleMoves, startRowsWithDiscs, tilesPerSide } from "../../../utils/checkers.js";
import { updateLight } from "../../parser/utils.js";
import MyGameOrchestrator from "./MyGameOrchestrator.js";
import MyPiece from "./MyPiece.js";
import MyScoreBoard from "./MyScoreBoard.js";
import MyStorage from "./MyStorage.js";
import MyTile from "./MyTile.js";

const spotlightDistance = 2;

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

        this._boardMaterial = new CGFappearance(this._scene); // Appearence for wood with default values
        this._boardMaterial.setAmbient(1, 1, 1, 1);
        this._boardMaterial.setDiffuse(1, 1, 1, 1);
        this._boardMaterial.setSpecular(1, 1, 1, 1);

        this._whiteTileTexture = new CGFtexture(this._scene, "scenes/images/board/light_tile.png");
        this._blackTileTexture = new CGFtexture(this._scene, "scenes/images/board/dark_tile.png");
        this._whiteDiscTexture = new CGFtexture(this._scene, "scenes/images/board/light_wood_disc2.jpg");
        this._blackDiscTexture = new CGFtexture(this._scene, "scenes/images/board/dark_wood_disc2.jpg");

        this.buildTiles();
        this.buildStorages();
        this._scoreboard = new MyScoreBoard(this._scene, this._sideLength, this._boardMaterial);

        /* 
        Initialize the Spotlight
        Properties structure: [sceneIdx, enabled, type, location, ambient, diffuse, 
            specular, attenuation, angle, exponent, target] 
        */
        this.initSpotlightProperties = [7, true, "spot", [this._x + this._tileSideLength/2, this._y + spotlightDistance, this._z - this._tileSideLength/2, 1.0], [0, 0, 0, 1], [1, 1, 1, 1], 
            [1, 1, 1, 1], [0, 1, 0], 180, 1, [this._x, this._y, this._z]];
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
                const pieceIsWhite = i < startRowsWithDiscs;
                if (!isWhite && (pieceIsWhite || i > tilesPerSide - startRowsWithDiscs - 1)) {
                    // If the tile is in the first or last rows, it has a piece
                    const texture = pieceIsWhite ? this._whiteDiscTexture : this._blackDiscTexture;
                    piece = new MyPiece(this._sceneGraph, `piece-${idNumber}`, pieceIsWhite, this._tileSideLength, texture, this._boardMaterial);

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
     * Auxiliary function to build the storages for the captured pieces
     */
    buildStorages() {
        this._whiteStorage = new MyStorage(this._scene, "white-storage", this._sideLength, true, this._boardMaterial);
        this._blackStorage = new MyStorage(this._scene, "black-storage", this._sideLength, false, this._boardMaterial);
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
                // Add captured piece to the corresponding storage
                if (piece.isWhite) this._whiteStorage.addPiece(tile.piece);
                else this._blackStorage.addPiece(tile.piece);

                tile.removePiece();
            }
        }
    }

    /**
     * Gets the possible moves of a given tile
     * @param {MyTile} tile
     * @returns {[MyTile[], boolean]} List with 2 elements: [Array of possible tiles to move to, boolean indicating if a capture is possible (true) or not (false))]
     */
    getPossibleMoves(tile) {
        if (!tile.hasPiece()) return [];

        const piece = tile.piece;
        const { i: tileRow, j: tileCol } = this.getTileCoordinates(tile);
        const possibleMoves = [];
        let canCapture = false;

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
                        if (jumpedOver) {
                            // If a piece was jumped over, a capture is possible
                            canCapture = true;
                        }
                        
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
                        // if the tile after the jumped over piece is empty, a capture is possible
                        canCapture = true;

                        possibleMoves.push(jumpTile);
                    }
                } else {
                    possibleMoves.push(nextTile);
                }
            }
        }

        return [possibleMoves, canCapture];
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
        this._boardMaterial.apply();

        // Calculate the possible moves from the selected tile
        const [possibleTiles, canCapture] = selectedTile ? this.getPossibleMoves(selectedTile) : noPossibleMoves;

        // Draw the tiles
        this.drawTilesColor(true, turn, possibleTiles);
        this.drawTilesColor(false, turn, possibleTiles);

        // Draw the pieces
        this.drawPiecesColor(true, selectedTile);
        this.drawPiecesColor(false, selectedTile);

        // Draw the Storages
        this._whiteStorage.display();
        this._blackStorage.display();

        // Draw scoreboard
        this._scoreboard.display();

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
        this._boardMaterial.setTexture(tileTexture);
        this._boardMaterial.setTextureWrap("REPEAT", "REPEAT");
        this._boardMaterial.apply();

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

                if (isTargetTile) this.highlightMaterial(1);

                currTile.display();

                if (isTargetTile) this.resetMaterial();

                this._scene.popMatrix();
            }
        }
    }

    /**
     * Draws the pieces of the board with the given color
     * @param {*} isWhite
     * @param {MyTile} selectedTile
     */
    drawPiecesColor(isWhite, selectedTile) {
        for (let i = 0; i < tilesPerSide; i++) {
            for (let j = 0; j < tilesPerSide; j++) {
                const tileIdx = i * tilesPerSide + j;
                const tile = this._tiles[tileIdx];
                if (tile.hasPiece() && tile.piece.isWhite == isWhite) {
                    this._scene.pushMatrix();
                    this._scene.translate(j * this._tileSideLength, i * this._tileSideLength, 0);

                    if (selectedTile == tile) this.highlightMaterial(0.2);
                    
                    tile.displayPiece();
                    
                    if (selectedTile == tile) this.resetMaterial();

                    this._scene.popMatrix();
                }
            }
        }
    }

    /**
     * Highlights the board's material
     * @param {number} emissionVal Emission value (0-1)
     */
    highlightMaterial(emissionVal = 0) {
        this._boardMaterial.setAmbient(1.0, 0, 0, 1);
        this._boardMaterial.setDiffuse(1.0, 0, 0, 1);
        this._boardMaterial.setSpecular(1.0, 0, 0, 1);
        this._boardMaterial.setEmission(emissionVal, emissionVal, emissionVal, 1);
        this._boardMaterial.apply();
    }

    resetMaterial() {
        this._boardMaterial.setAmbient(1, 1, 1, 1);
        this._boardMaterial.setDiffuse(1, 1, 1, 1);
        this._boardMaterial.setSpecular(1, 1, 1, 1);
        this._boardMaterial.setEmission(0, 0, 0, 1);
        this._boardMaterial.apply();
    }

    /**
     * Moves the board's spotlight to a new position and updates the light
     * @param {number[]} position 3D array representing new position on the board
     */
    moveSpotlight = (position) => {
        const fromPos = [position[0], position[1] + spotlightDistance, position[2], 1.0];
        const toPos = [...position, 1.0];

        const newProps = this.initSpotlightProperties;
        newProps[3] = fromPos;
        newProps[10] = toPos;

        updateLight(this._scene.lights[7], newProps);
    }

    /**
     * Disables the board's spotlight
     */
    disableSpotlight = () => {
        this._scene.lights[7].disable();
        this._scene.lights[7].update();
    }

    /**
     * Analyzes the board's state and returns a value representing it
     * @param {boolean} isWhite Whether the player is white or not
     * @returns {number} Number representing the board's state according to the boardState Dictionary
     */
    checkBoardState(isWhite) {
        const storage = isWhite ? this._whiteStorage : this._blackStorage;
        if (storage.captured.length == discsPerSide) {
            // Player has captured all the discs
            return boardState.END;
        }

        for (const tile of this._tiles) {
            if (tile.hasPiece() && tile.piece.isWhite == isWhite) {
                const [possibleMoves, canCapture] = this.getPossibleMoves(tile);
                // If the player has one move that results in a capture, he can move again

                // TODO: The player can only move again if the last move resulted in a capture
                if (canCapture) return boardState.MOVE_AGAIN;
            }
        }

        return boardState.SWITCH_PLAYER;
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

    get whiteStorage() {
        return this._whiteStorage;
    }

    get blackStorage() {
        return this._blackStorage;
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
     * Gets the absolute position of the bottom left corner of the tile at the given coordinates
     * @param {MyTile} tile
     * @param {boolean} centered if true, the position will be the center of the tile
     * @returns {number[]} 3D array representing the absolute position of the tile
     */
    getTileAbsPosition(tile, centered = false) {
        const { i, j } = this.getTileCoordinates(tile);

        const offset = centered ? this._tileSideLength / 2 : 0;

        return [
            this._x + j * this._tileSideLength + offset,
            this._y,
            this._z - i * this._tileSideLength - offset
        ];
    }

    /**
     * Gets the difference between the coordinates of the two given tiles
     * @param {MyTile} tile1
     * @param {MyTile} tile2
     * @returns {{x: number, y: number}} the difference between the coordinates of the two given tiles
     */
    getDifferenceBetweenTiles(tile1, tile2) {
        const center1 = this.getTileAbsPosition(tile1, true);
        const center2 = this.getTileAbsPosition(tile2, true);

        return {
            rowDiff: center1[2] - center2[2],
            colDiff: center2[0] - center1[0]
        };
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
        clone._whiteStorage = clone._whiteStorage.clone();
        clone._blackStorage = clone._blackStorage.clone();
        
        return clone;
    }
}