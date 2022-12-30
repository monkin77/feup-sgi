import { CGFappearance } from "../../lib/CGF.js";
import { XMLscene } from "../XMLscene.js";

export const convertDigitToCharCoords = (digit) => {
    if (digit < 0 || digit > 9) throw new Error("Invalid digit");

    return [digit, 3];
};

export const convertUppercaseLetterToCharCoords = (letter) => {
    if (letter < "A" || letter > "Z") throw new Error("Invalid lupper case etter");

    if (letter <= "O") {
        const digit = letter.charCodeAt(0) - "A".charCodeAt(0) + 1;
        return [digit, 4];
    } else {
        const digit = letter.charCodeAt(0) - "P".charCodeAt(0);
        return [digit, 5];
    }
};

export const convertLowercaseLetterToCharCoords = (letter) => {
    if (letter < "a" || letter > "z") throw new Error("Invalid lower case etter");

    if (letter <= "o") {
        const digit = letter.charCodeAt(0) - "a".charCodeAt(0) + 1;
        return [digit, 6];
    } else {
        const digit = letter.charCodeAt(0) - "p".charCodeAt(0);
        return [digit, 7];
    }
};

export const displayText = (scene, text, spacing, x = 0, y = 0, z = 0, scale = 1) => {
    scene.pushMatrix();
    scene.translate(x, y, z);
    scene.scale(scale, scale, scale);

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        let charCoords;

        if (char >= "0" && char <= "9") {
            charCoords = convertDigitToCharCoords(char);
        } else if (char >= "A" && char <= "Z") {
            charCoords = convertUppercaseLetterToCharCoords(char);
        } else if (char >= "a" && char <= "z") {
            charCoords = convertLowercaseLetterToCharCoords(char);
        } else if (char == "-") {
            charCoords = [6, 9];
        } else if (char == ":") {
            charCoords = [10, 3];
        } else {
            throw new Error("Unknown character: ", char);
        }

        scene.textShader.setUniformsValues({ charCoords });
        scene.letter.display();
        scene.translate(spacing, 0, 0);
    }

    scene.popMatrix();
};

/**
 * Display a single symbol in the font texture by specifying its coordinates
 * @param {XMLscene} scene 
 * @param {number[]} charCoords 2D Array containing [x, y] coordinates in the font texture
 * @param {CGFappearance} material material to apply the texture
 */
export const displaySymbol = (scene, charCoords, material) => {
    // Save previous texture
    const prevTexture = material.texture;

    // Apply font texture
    material.setTexture(scene.fontTexture);
    material.apply();

    // Apply font shader
    scene.setActiveShaderSimple(scene.textShader);

    // Provide coordinates of the symbol to the shader
    scene.textShader.setUniformsValues({ charCoords });

    // Display the symbol
    scene.letter.display();

    // Restore the default shader
    scene.setActiveShaderSimple(scene.defaultShader);

    // Restore previous texture
    material.setTexture(prevTexture);
}
