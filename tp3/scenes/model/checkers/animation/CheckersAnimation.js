import { axisToVec } from "../../../parser/utils.js";
import { KeyFrame } from "../../KeyFrame.js";
import KeyFrameAnimation from "../../KeyFrameAnimation.js";
import MyAnimation from "../../MyAnimation.js";

export default class CheckersAnimation extends MyAnimation {
    /**
     * Constructor for the CheckersAnimation abstract class.
     * It is used to create an animation for the checkers game.
     * @constructor
     * @abstract
    */
    constructor(scene) {
        super();
        if (this.constructor === CheckersAnimation) {
            throw new Error("Abstract classes can't be instantiated.");
        }

        this._ended = false;
        this.keyFrameAnimation = new KeyFrameAnimation(
            scene,
            this.getKeyFrameID(),
            this.buildKeyFrames()
        );
    }

    /**
     * Gets the KeyFrame ID
     */
    getKeyFrameID() {
        throw new Error("Method 'getKeyFrameID()' must be implemented.");
    }

    /**
     * Gets the duration of the animation
     */
    getDuration() {
        throw new Error("Method 'getDuration()' must be implemented.");
    }

    /**
     * Builds the animation's keyframes
     * @abstract
     * @returns {KeyFrame[]}
     */
    buildKeyFrames() {
        throw new Error("Method 'buildKeyFrames()' must be implemented.");
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

    update(t) {
        if (!this.started) return;
        if (!this.startTime) this.startTime = t;

        const animationTime = t - this.startTime;
        this.keyFrameAnimation.update(animationTime);

        if (animationTime > this.getDuration()) {
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

    get ended() {
        return this._ended;
    }
}
