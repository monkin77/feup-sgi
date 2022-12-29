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
        this._letterSize = sideLength / 8;

        this._boardMaterial = boardMaterial;

        this._score1 = 0;
        this._score2 = 0;

        this._letter = new MyRectangle(scene, "score-board-letter", 0, this._letterSize, 0, this._letterSize);
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

        this._scene.textShader.setUniformsValues({
            "charCoords": convertDigitToCharCoords(Math.floor(this._score1 / 10))
        });
        this._letter.display();

        this._scene.translate(this._letterSize / 2, 0, 0);
        this._scene.textShader.setUniformsValues({
            "charCoords": convertDigitToCharCoords(Math.floor(this._score1 % 10))
        });
        this._letter.display();

        this._scene.translate(this._letterSize / 2, 0, 0);
        this._scene.textShader.setUniformsValues({ "charCoords": [6, 9] }); // -
        this._letter.display();

        this._scene.translate(this._letterSize / 2, 0, 0);
        this._scene.textShader.setUniformsValues({
            "charCoords": convertDigitToCharCoords(Math.floor(this._score2 / 10))
        });
        this._letter.display();

        this._scene.translate(this._letterSize / 2, 0, 0);
        this._scene.textShader.setUniformsValues({
            "charCoords": convertDigitToCharCoords(Math.floor(this._score2 % 10))
        });
        this._letter.display();

        this._scene.translate(-(3/2) * this._letterSize, this._letterSize, 0);
        this._scene.scale(0.5, 0.5, 0.5);
        this._scene.textShader.setUniformsValues({
            "charCoords": convertUppercaseLetterToCharCoords("S")
        });
        this._letter.display();

        this._scene.translate(this._letterSize / (5/3), 0, 0);
        this._scene.textShader.setUniformsValues({
            "charCoords": convertUppercaseLetterToCharCoords("C")
        });
        this._letter.display();

        this._scene.translate(this._letterSize / (5/3), 0, 0);
        this._scene.textShader.setUniformsValues({
            "charCoords": convertUppercaseLetterToCharCoords("O")
        });
        this._letter.display();

        this._scene.translate(this._letterSize / (5/3), 0, 0);
        this._scene.textShader.setUniformsValues({
            "charCoords": convertUppercaseLetterToCharCoords("R")
        });
        this._letter.display();

        this._scene.translate(this._letterSize / (5/3), 0, 0);
        this._scene.textShader.setUniformsValues({
            "charCoords": convertUppercaseLetterToCharCoords("E")
        });
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
