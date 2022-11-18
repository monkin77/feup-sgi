import { MyAnimation } from "./MyAnimation.js";

export class KeyFrameAnimation extends MyAnimation {
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
    }

    /**
     * Updates the animation's state.
     * @param {time} time in seconds
     */
    update(t) {
        // TODO
    }

    /**
     * Applies the animation's transformation to the scene.
     */
     apply() {
        // TODO
    }
}