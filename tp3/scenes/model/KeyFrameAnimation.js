import { DEGREE_TO_RAD } from "../parser/utils.js";
import MyAnimation from "./MyAnimation.js";

export default class KeyFrameAnimation extends MyAnimation {
    /**
     * Constructor for the KeyFrameAnimation class. It is used to create an animation based on keyframes.
     * @constructor
     * @param {MySceneGraph} scene - Reference to the scene graph
     * @param {string} id - ID of the animation
     * @param {KeyFrame[]} keyframes - Animation's keyframes
     */
    constructor(scene, id, keyframes) {
        super();
        this.scene = scene;
        this.id = id;
        this.keyframes = keyframes;
        this.transfMatrix = mat4.create(); // identity matrix
    }

    /**
     * Updates the animation's state.
     * @param {time} time in seconds
     */
    update(t) {
        if (!this.started) {
            if (t < this.keyframes[0].instant) return;
            this.started = true;
        }

        const {keyframe1, keyframe2} = this.getCurrentKeyFrames(t);
        if (!keyframe2) {
            this.transfMatrix =
                this.createTransformationMatrix(keyframe1.translation, keyframe1.scale, keyframe1.rotations);
            return;
        }

        // Interpolate 2 keyframes
        const t1 = keyframe1.instant;
        const t2 = keyframe2.instant;
        const percentage = (t - t1) / (t2 - t1);

        const translation = vec3.create();
        vec3.lerp(translation, keyframe1.translation, keyframe2.translation, percentage);

        const scale = vec3.create();
        vec3.lerp(scale, keyframe1.scale, keyframe2.scale, percentage);

        const rotations = [];
        for (let i = 0; i < keyframe1.rotations.length; i++) {
            const angle = keyframe1.rotations[i].angle + percentage * (keyframe2.rotations[i].angle - keyframe1.rotations[i].angle);
            rotations.push({axis: keyframe1.rotations[i].axis, angle});
        }

        this.transfMatrix = this.createTransformationMatrix(translation, scale, rotations);
    }

    /**
     * Applies the animation's transformation to the scene.
     */
     apply() {
        if (this.started) {
            this.scene.multMatrix(this.transfMatrix);
        }
    }

    /**
     * Gets the pair of keyframes that are currently being interpolated.
     * Returns the only last keyframe if the animation has ended.
     * @param {time} t current timestamp
     * @returns {KeyFrame[]} Array with the 2 keyframes
     */
    getCurrentKeyFrames(t, low = 0, high = this.keyframes.length - 1) {
        if (t >= this.keyframes[high].instant) return {keyframe1: this.keyframes[high]};
        if (high - low == 1) {
            return {keyframe1: this.keyframes[low], keyframe2: this.keyframes[high]};
        }
        const mid = Math.floor((low + high) / 2);
        if (t < this.keyframes[mid].instant) {
            return this.getCurrentKeyFrames(t, low, mid);
        }
        return this.getCurrentKeyFrames(t, mid, high);
    }

    /**
     * Creates a matrix based on the given transformations.
     * @param {vec3} translation - Translation vector
     * @param {vec3} scale - Scale vector
     * @param {Array} rotations - Array of rotations
     * @returns {mat4} Transformation matrix
     */
    createTransformationMatrix(translation, scale, rotations) {
        const matrix = mat4.create();
        mat4.translate(matrix, matrix, translation);
        mat4.scale(matrix, matrix, scale);
        rotations.forEach(rotation => {
            mat4.rotate(matrix, matrix, rotation.angle * DEGREE_TO_RAD, rotation.axis);
        })
        return matrix;
    }
}