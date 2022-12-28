import { KeyFrame } from "../../KeyFrame.js";
import CheckersAnimation from "./CheckersAnimation.js";

const BOUNCE_ANIMATION_DURATION = 1000;
const BOUNCE_ANIMATION_ID = "bounce-animation-a-totally-random-string";

export default class BounceAnimation extends CheckersAnimation {
    constructor(scene, initialPos, finalPos) {
        super(scene);
        this._initialPos = initialPos;
        this._finalPos = finalPos;
    }

    /**
     * Builds the animation's keyframes
     * @returns {KeyFrame[]}
     */
    buildKeyFrames() {
        // get translation from initialPos to finalPos
        const boardTranslation = vec3.sub(vec3.create(), this._finalPos, this._initialPos);
        const realTranslation = [boardTranslation[0], -boardTranslation[2], boardTranslation[1]];
        return [
            this.buildKeyFrame(0, [0, 0, 0], [0, 0, 0], [1, 1, 1]),
            this.buildKeyFrame(1, realTranslation, [0, 0, 0], [1, 1, 1]),
        ];
    }

    getKeyFrameID() {
        return BOUNCE_ANIMATION_ID;
    }

    getDuration() {
        return BOUNCE_ANIMATION_DURATION;
    }
}
