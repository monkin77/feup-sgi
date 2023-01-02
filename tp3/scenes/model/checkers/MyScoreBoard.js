import { CGFtexture } from "../../../../lib/CGF.js";
import { MyRectangle } from "../../../primitives/MyRectangle.js";
import { displayText } from "../../../utils/font.js";

export default class MyScoreBoard {
    /**
     * 
     * @param {XMLscene} scene
     * @param {number} sideLength
     * @param {CGFappearance} boardMaterial
     */
    constructor(scene, sideLength, boardMaterial) {
        this._scene = scene;

        this._score1 = 0;
        this._score2 = 0;

        this._boardMaterial = boardMaterial;
        this._texture = new CGFtexture(this._scene, "scenes/images/board/storage_wood.jpg");

        this.updatePosAndSize(sideLength);
    }

    /**
     * Method to update the dimensions of the scoreboard
     * @param {*} newSideLength 
     */
    updatePosAndSize(newSideLength, monitorEnabled = false) {
        this._sideLength = newSideLength;
        this._spacing = newSideLength / 8;
        this._cardLength = newSideLength / 3;
        this._cardHeight = newSideLength / 5;
        this._monitorEnabled = monitorEnabled;

        this._card = new MyRectangle(this._scene, "timer-card", 0, this._cardLength, 0, this._cardHeight);
    }

    /**
     * Displays the score board
     */
    display() {
        this.displayScoreBoard(true);
        this.displayScoreBoard(false);
    }

    /**
     * Displays a score board at either side of the board
     */
    displayScoreBoard(isWhitePerspective) {
        this._boardMaterial.setTexture(this._texture);
        this._boardMaterial.setTextureWrap("REPEAT", "REPEAT");
        this._boardMaterial.apply();

        this._scene.pushMatrix();

        // Offset to take into account if displaying in the monitor or in the board
        const offset = this._monitorEnabled ? this._sideLength + 0.01 : -0.1;

        if (isWhitePerspective) {
            this._scene.translate(0, this._sideLength - offset, 0);
            this._scene.rotate(Math.PI / 2, 1, 0, 0);
        } else {
            this._scene.translate(this._sideLength, offset, 0);
            this._scene.rotate(Math.PI / 2, 1, 0, 0);
            this._scene.rotate(Math.PI, 0, 1, 0);
        }

        this._card.display();
        this._scene.translate(0, 0, 0.1);

        this._boardMaterial.setTexture(this._scene.fontTexture);
        this._boardMaterial.apply();

        this._scene.setActiveShaderSimple(this._scene.textShader);

        const score1 = this._score1.toLocaleString("pt-PT", { minimumIntegerDigits: 2 });
        const score2 = this._score2.toLocaleString("pt-PT", { minimumIntegerDigits: 2 });
        displayText(this._scene, `${score1}-${score2}`, this._spacing / 2);

        this._scene.translate(this._spacing / 2, this._spacing, 0);
        this._scene.scale(0.5, 0.5, 0.5);
        displayText(this._scene, "SCORE", this._spacing / (5/3));

        this._scene.setActiveShaderSimple(this._scene.defaultShader);
        this._scene.popMatrix();
    }

    /**
     * Increases the score of the given player
     * @param {number} player
     */
    increaseScore(player) {
        player === 1 ? this._score1++ : this._score2++;
    }

    get cardHeight() {
        return this._cardHeight;
    }
}
