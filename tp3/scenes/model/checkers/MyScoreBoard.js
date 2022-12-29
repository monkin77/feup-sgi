import { MyRectangle } from "../../../primitives/MyRectangle.js";
import { displayText } from "../../../utils/font.js";

export default class MyScoreBoard {
    /**
     * 
     * @param {XMLscene} scene
     * @param {number} sideLength
     */
    constructor(scene, sideLength, boardMaterial) {
        this._scene = scene;
        this._sideLength = sideLength;
        this._spacing = sideLength / 8;

        this._boardMaterial = boardMaterial;

        this._score1 = 0;
        this._score2 = 0;

        this._card = new MyRectangle(scene, "score-board-card", 0, sideLength / 3, 0, sideLength / 5);
    }

    /**
     * Displays the score board
     */
    display() {
        this._scene.pushMatrix();

        this._scene.translate(0, this._sideLength, 0);
        this._scene.rotate(Math.PI / 2, 1, 0, 0);
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
}
