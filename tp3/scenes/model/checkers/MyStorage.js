import { CGFtexture } from "../../../../lib/CGF.js";
import { MyRectangle } from "../../../primitives/MyRectangle.js";
import { tilesPerSide } from "../../../utils/checkers.js";
import { pieceScaleFactor } from "./MyPiece.js";

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
        this._pieceLength = (this._sideLength * pieceScaleFactor) / tilesPerSide
        this._storagePadding = this._pieceLength * 0.3;

        this._isWhite = isWhite;
        this._boardMaterial = boardMaterial;

        this._captured = [];

        this._rectangle = new MyRectangle(scene, id, 0, this._storageWidth, 0, sideLength);
        this._texture = new CGFtexture(this._scene, "scenes/images/board/storage_wood.jpg");
    }

    display() {
        this._boardMaterial.setTexture(this._texture);
        this._boardMaterial.setTextureWrap("REPEAT", "REPEAT");
        this._boardMaterial.apply();

        this._scene.pushMatrix();

        // Translate the storage to the correct position
        this._scene.translate(...this.getBoardTranslation());

        this._rectangle.display();

        this.displayCapturedPieces();


        this._scene.popMatrix();
    }

    /**
     * Displays the captured pieces
     */
    displayCapturedPieces() {
        this._scene.translate(...this.getPieceStartTranslation());
        for (const idx in this._captured) {
            const piece = this._captured[idx];
            this._scene.translate(...this.getSinglePieceTranslation(idx));
            piece.display();
        }
    }

    /**
     * Returns the translation for a single captured piece
     */
    getSinglePieceTranslation(idx) {
        if (idx == 0) return [0, 0, 0];

        // Array of translation sequences for the captured pieces
        const translateX = (this._storageWidth - 2 * this._storagePadding + (this._pieceLength/2)) / 2;
        const translateY = (this._sideLength - 2 * this._storagePadding + (this._pieceLength/2)) / 6;
        const translations = [
            [translateX, 0, 0],
            [0, translateY, 0],
            [-translateX, 0, 0],
            [0, translateY, 0],
        ]
        return translations[(idx-1) % 4];
    }

    /**
     * Returns the translation for the start of the captured pieces
     */
    getPieceStartTranslation() {
        return [this._storagePadding + (this._pieceLength/2), this._storagePadding + (this._pieceLength/2), 0];
    }

    /**
     * Returns the translation for the storage
     */
    getBoardTranslation() {
        return [this._isWhite ? -this._storageWidth : this._sideLength, 0, 0];
    }

    /**
     * Gets the overall translation of a single captured piece
     */
    getPieceOverallTranslation(idx) {
        const pieceTranslation = this.getSinglePieceTranslation(idx);
        const startTranslation = this.getPieceStartTranslation();
        const translation1 = vec3.add(vec3.create(), pieceTranslation, startTranslation);

        const boardTranslation = this.getBoardTranslation();
        return vec3.add(vec3.create(), translation1, boardTranslation);
    }

    /**
     * Adds a piece to the storage
     * @param {MyPiece} piece 
     */
    addPiece(piece) {
        this._captured.push(piece);
    }

    get numPieces() {
        return this._captured.length;
    }

    get captured() {
        return this._captured;
    }

    /**
     * Creates a clone of the Storage, while also cloning the pieces
     */
    clone() {
        const clone = Object.create(
            Object.getPrototypeOf(this),
            Object.getOwnPropertyDescriptors(this)
        );
        clone._captured = this._captured.map(piece => piece.clone());
        return clone;
    }
}