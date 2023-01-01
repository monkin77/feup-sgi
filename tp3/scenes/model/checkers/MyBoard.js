import { CGFappearance, CGFtexture } from "../../../../lib/CGF.js";
import { MySceneGraph } from "../../../MySceneGraph.js";
import { boardState, discsPerSide, noPossibleMoves, startRowsWithDiscs, tilesPerSide } from "../../../utils/checkers.js";
import { updateLight } from "../../parser/utils.js";
import MyGameOrchestrator from "./MyGameOrchestrator.js";
import MyMonitor from "./MyMonitor.js";
import MyPiece from "./MyPiece.js";
import MyScoreBoard from "./MyScoreBoard.js";
import MyStorage from "./MyStorage.js";
import MyTile from "./MyTile.js";
import MyTimer from "./MyTimer.js";

// Class for a Checkers board
export default class MyBoard {
    /**
     *
     * @param {MySceneGraph} sceneGraph MySceneGraph object to use already created components and access the scene object
     * @param {number[]} position 3D array with the new position of the board
     * @param {*} sideLength
     */
    constructor(sceneGraph, position, sideLength) {
        if (position.length != 3) throw new Error("Invalid position array length (expected 3, got " + position.length);

        this._sceneGraph = sceneGraph;
        this._scene = sceneGraph.scene;

        [this._x, this._y, this._z] = position;

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
        this._timer = new MyTimer(this._scene, this._sideLength, this._boardMaterial);

        this._monitor = new MyMonitor(this._sceneGraph, this._sideLength, 
            this._boardMaterial, this._scoreboard, this._timer, this._sceneGraph.boardParser.useMonitor);

        /* 
        Initialize the Spotlight
        Properties structure: [sceneIdx, enabled, type, location, ambient, diffuse, 
            specular, attenuation, angle, exponent, target] 
        */
        this._spotlightHeight = this._tileSideLength * 0.5;
        this.initSpotlightProperties = [7, true, "spot", [this._x + this._tileSideLength/2, this._y + this._spotlightHeight, this._z - this._tileSideLength/2, 1.0], [0, 0, 0, 1], [1, 1, 1, 1], 
            [1, 1, 1, 1], [0, 1, 0], 180, 1, [this._x, this._y, this._z]];
    }

    /**
     * Method to update the position and size of the board.
     * Also updates the position and size of the components that depend on it
     * @param {MySceneGraph} newSceneGraph 
     */
    updateTheme(newSceneGraph) {
        const position = newSceneGraph.boardParser.position;
        const sideLength = newSceneGraph.boardParser.sideLength

        if (position.length != 3) throw new Error("Invalid position array length (expected 3, got " + position.length);

        this._sceneGraph = newSceneGraph;

        [this._x, this._y, this._z] = position;
        this._sideLength = sideLength;
        this._tileSideLength = sideLength / tilesPerSide;

        // Update the Tiles and Pieces
        for (const tile of this._tiles) {
            tile.updatePosAndSize(this._tileSideLength);
        }

        // Update the Storages
        this._whiteStorage.updatePosAndSize(this._sideLength);
        this._blackStorage.updatePosAndSize(this._sideLength);

        const monitorEnabled = this._sceneGraph.boardParser.useMonitor;
        // Update the Monitor
        this._monitor.updateTheme(this._sideLength, this._sceneGraph.boardParser.useMonitor);

        // Since the monitor already updates the scoreboard and timer, only update them if the monitor is disabled
        if (!monitorEnabled) {
            // Update the Scoreboard
            this._scoreboard.updatePosAndSize(this._sideLength);

            // Update the Timer
            this._timer.updatePosAndSize(this._sideLength);
        }

        // Update the Spotlight Properties
        this._spotlightHeight = this._tileSideLength * 0.5;
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
                const pieceIsBlack = i < startRowsWithDiscs;
                if (!isWhite && (pieceIsBlack || i > tilesPerSide - startRowsWithDiscs - 1)) {
                    // If the tile is in the first or last rows, it has a piece
                    const texture = pieceIsBlack ? this._blackDiscTexture : this._whiteDiscTexture;
                    piece = new MyPiece(this._sceneGraph, `piece-${idNumber}`, !pieceIsBlack, this._tileSideLength, texture, this._boardMaterial);

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
     * Verifies if the given player can capture a piece in the next move
     * @param {boolean} isWhite true if the player is white, false if it is black
     * @returns {boolean} true if the player can capture a piece in the next move, false otherwise
     */
    playerCanCapture(isWhite) {
        for (const tile of this._tiles) {
            // If the tile has a piece of the given player, check if it can capture a piece
            if (tile.hasPiece() && (tile.piece.isWhite == isWhite)) {
                const [_, canCapture] = this.getPossibleMoves(tile, false);
                if (canCapture) return true;
            }
        }

        return false;
    }

    /**
     * Gets the possible moves of a given tile
     * @param {MyTile} tile
     * @param {boolean} forceCapture If true, only returns the moves that follow strictly the rules of checkers. If false, returns all possible moves
     * @returns {[MyTile[], boolean]} List with 2 elements: [Array of possible tiles to move to, boolean indicating if a capture is possible (true) or not (false))]
     */
    getPossibleMoves(tile, forceCapture = true) {
        if (!tile.hasPiece()) return [];
        
        // Variable stores whether the move on this tile must capture a piece
        const requiresCapture = !forceCapture ? false : this.playerCanCapture(tile.piece.isWhite);

        // Variable stores whether a move on this tile can capture a piece
        let canCapture = false;

        const piece = tile.piece;
        const { i: tileRow, j: tileCol } = this.getTileCoordinates(tile);
        let possibleMoves = [];

        const directions = [];
        if (!piece.isWhite || piece.isKing) directions.push({ i: 1, j: 1 }, { i: 1, j: -1 });
        if (piece.isWhite || piece.isKing) directions.push({ i: -1, j: 1 }, { i: -1, j: -1 });

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
                        
                        if (jumpedOver || !requiresCapture) {
                            // If this move is a capture or 
                            // if we don't need to force a capture, add it to the list of possible moves
                            possibleMoves.push(nextTile);
                        }
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
                    if (!requiresCapture) {
                        // If a capture is not possible, all moves are allowed
                        possibleMoves.push(nextTile);
                    }
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

        // Clear The picking id currently in use
        this._scene.clearPickRegistration();

        // Draw the Storages
        this._whiteStorage.display();
        this._blackStorage.display();

        // Draw the Monitor
        if (this._monitor.enabled) {
            this._monitor.display(this._scene.gameOrchestrator.turnCounter);
        } else {
            // Draw scoreboard
            this._scoreboard.display();

            // Draw timer
            this._timer.display(this._scene.gameOrchestrator.turnCounter);
        }
  
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
    moveSpotlight(position) {
        const fromPos = [position[0], position[1] + this._spotlightHeight, position[2], 1.0];
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
     * @param {MyTile} lastMovedTile The Tile destination of the last move 
     * @param {boolean} hasCaptured Whether the last move resulted in a capture
     * @returns {number} Number representing the board's state according to the boardState Dictionary
     */
    checkBoardState(lastMovedTile, hasCaptured) {
        // If the last move was not a capture, switch to the next player
        if (!hasCaptured) return boardState.SWITCH_PLAYER;

        if (!lastMovedTile.hasPiece()) {
            throw new Error("Last moved tile does not have a piece");
        }
        
        const isWhite = lastMovedTile.piece.isWhite;
        const storage = isWhite ? this._whiteStorage : this._blackStorage;
        if (storage.captured.length == discsPerSide) {
            // Player has captured all the discs
            return boardState.END;
        }

        // Get all possible moves for the last moved piece
        const [_, canCapture] = this.getPossibleMoves(lastMovedTile);
        // If the player has one move that results in a capture, he can move again
        if (canCapture) return boardState.MOVE_AGAIN;
           
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

    get scoreboard() {
        return this._scoreboard;
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