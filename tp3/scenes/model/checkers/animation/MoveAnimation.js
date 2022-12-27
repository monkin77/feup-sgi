import { axisToVec } from "../../../parser/utils.js";
import { KeyFrame } from "../../KeyFrame.js";
import KeyFrameAnimation from "../../KeyFrameAnimation.js";
import MyAnimation from "../../MyAnimation.js";

const MOVE_ANIMATION_DURATION = 1000;
const MOVE_ANIMATION_ID = "move-animation-a-totally-random-string";

export default class MoveAnimation extends MyAnimation {
    constructor(scene) {
        super();
        this._ended = false;
        this.keyFrameAnimation = new KeyFrameAnimation(
            scene,
            MOVE_ANIMATION_ID,
            this.buildKeyFrames()
        );
    }

    update(t) {
        if (!this.started) return;
        if (!this.startTime) this.startTime = t;

        const animationTime = t - this.startTime;
        this.keyFrameAnimation.update(animationTime);

        if (animationTime > MOVE_ANIMATION_DURATION) {
            this._ended = true;
        }
    }

    apply() {
        if (this.started) {
            this.keyFrameAnimation.apply();
        }
    }

    /**
     * Starts the animation
     */
    start() {
        this.started = true;
    }

    /**
     * Resets the animation
     */
    reset() {
        this._ended = false;
        this.startTime = null;
    }

    /**
     * Builds the animation's keyframes
     * @returns {KeyFrame[]}
     */
    buildKeyFrames() {
        return [
            this.buildKeyFrame(0, [0, 0, 0], [0, 0, 0], [1, 1, 1]),
            this.buildKeyFrame(1, [1, 0, 0], [0, 0, 0], [1, 1, 1]),
        ];
    }

    /**
     * Builds a single keyframe
     */
    buildKeyFrame(t, translations, rotations, scales) {
        const axis = ["x", "y", "z"];
        return new KeyFrame(
            t,
            vec3.fromValues(...translations),
            axis.map((a, i) => ({axis: axisToVec(a), angle: rotations[i]})),
            vec3.fromValues(...scales)
        )
    }

    get ended() {
        return this._ended;
    }
}
