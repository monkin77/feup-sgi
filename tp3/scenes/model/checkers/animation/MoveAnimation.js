import { KeyFrame } from "../../KeyFrame.js";
import CheckersAnimation from "./CheckersAnimation.js";

const MOVE_ANIMATION_DURATION = 1000;
const MOVE_ANIMATION_ID = "move-animation-a-totally-random-string";

export default class MoveAnimation extends CheckersAnimation {
    constructor(scene, dx, dy) {
        super(scene);
        this._dx = dx;
        this._dy = dy;
    }

    /**
     * Builds the animation's keyframes
     * @returns {KeyFrame[]}
     */
    buildKeyFrames() {
        return [
            this.buildKeyFrame(0, [0, 0, 0], [0, 0, 0], [1, 1, 1]),
            this.buildKeyFrame(1, [this._dx, this._dy, 0], [0, 0, 0], [1, 1, 1]),
        ];
    }

    getKeyFrameID() {
        return MOVE_ANIMATION_ID;
    }

    getDuration() {
        return MOVE_ANIMATION_DURATION;
    }

    get dx() {
        return this._dx;
    }

    get dy() {
        return this._dy;
    }
}
