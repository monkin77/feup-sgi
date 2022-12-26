export default class MyAnimation {
    /**
     * Constructor for the MyAnimation abstract class. It is used to create an animation.
     * @constructor
     * @abstract
    */
    constructor() {
        if (this.constructor === MyAnimation) {
            throw new Error("Abstract classes can't be instantiated.");
        }
        this.started = false;
    }

    /**
     * Updates the animation's state.
     * @abstract
     * @param {time} time in seconds
     */
    update(t) {
        throw new Error("Method 'update()' must be implemented.");
    }

    /**
     * Applies the animation's transformation to the scene.
     * @abstract
     */
    apply() {
        throw new Error("Method 'apply()' must be implemented.");
    }

    /**
     * Informs if the animation has started
     * @returns {boolean} true if the animation has started, false otherwise
     */
    hasStarted() {
        return this.started;
    }
}