import { KeyFrame } from "../../KeyFrame.js";
import CheckersAnimation from "./CheckersAnimation.js";

const BOUNCE_ANIMATION_DURATION = 1250;
const TIME_FACTOR = BOUNCE_ANIMATION_DURATION / 1000;
const BOUNCE_ANIMATION_ID = "bounce-animation-a-totally-random-string";
const NUM_KEYFRAMES = 100;
const QUADRATIC_SCALE_FACTOR = 15;

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

        const keyframes = [];
        for (let i = 0; i < NUM_KEYFRAMES; i++) {
            const t = (i / NUM_KEYFRAMES) * TIME_FACTOR;
            const y = QUADRATIC_SCALE_FACTOR * t * (TIME_FACTOR - t);
            const yTranslation = [0, 0, y];

            const scaledRealTranslation = vec3.lerp(vec3.create(), [0, 0, 0], realTranslation, t / TIME_FACTOR);
            const translation = vec3.add(vec3.create(), yTranslation, scaledRealTranslation);
            const keyframe = this.buildKeyFrame(t, translation, [0, 0, 0], [1, 1, 1]);
            keyframes.push(keyframe);
        }

        keyframes.push(this.buildKeyFrame(TIME_FACTOR, realTranslation, [0, 0, 0], [1, 1, 1]));

        return keyframes;
    }

    getKeyFrameID() {
        return BOUNCE_ANIMATION_ID;
    }

    getDuration() {
        return BOUNCE_ANIMATION_DURATION;
    }
}
