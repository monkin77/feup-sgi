import MyAnimation from "../MyAnimation.js";

export default class CheckersAnimation extends MyAnimation {
    constructor(sequence) {
        super();
        this._sequence = sequence;
    }

    update(t) {
        // TODO: Update animation
    }

    apply() {
        // TODO: Display animation
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
        // TODO: Reset animation
    }
}
