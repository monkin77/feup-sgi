import { MyRectangle } from "../../../primitives/MyRectangle.js";
import { convertDigitToCharCoords, convertLowercaseLetterToCharCoords, convertUppercaseLetterToCharCoords } from "../../../utils/font.js";

export default class MyScoreBoard {
    /**
     * 
     * @param {XMLscene} scene
     * @param {number} sideLength
     */
    constructor(scene, sideLength, boardMaterial) {
        this._scene = scene;
        this._sideLength = sideLength;
        this._width = sideLength / 4;
        this._boardMaterial = boardMaterial;

        this._score1 = 0;
        this._score2 = 0;

        this._letter = new MyRectangle(scene, "score-board-letter", 0, this._width, 0, this._width);
    }

    /**
     * Displays the score board
     */
    display() {
        this._scene.pushMatrix();

        this._boardMaterial.setTexture(this._scene.fontTexture);
        this._boardMaterial.apply();

        this._scene.setActiveShaderSimple(this._scene.textShader);
        this._scene.textShader.setUniformsValues({ "charCoords": convertDigitToCharCoords(this._score1) });

        this._scene.translate(0, 5, 5);
        this._letter.display();

        this._scene.translate(this._width / 2, 0, 0);
        this._scene.textShader.setUniformsValues({ "charCoords": convertUppercaseLetterToCharCoords("P") });
        this._letter.display();

        this._scene.translate(this._width / 2, 0, 0);
        this._scene.textShader.setUniformsValues({ "charCoords": convertLowercaseLetterToCharCoords("a") });
        this._letter.display();

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
