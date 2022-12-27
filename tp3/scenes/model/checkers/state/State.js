import MyGameOrchestrator from "../MyGameOrchestrator.js";

export default class State {
    /**
     * Constructor for the State abstract class.
     * @constructor
     * @param {MyGameOrchestrator} orchestrator
     * @abstract
    */
    constructor(orchestrator) {
        if (this.constructor === State) {
            throw new Error("Abstract classes can't be instantiated.");
        }

        this._orchestrator = orchestrator;
    }

    /**
     * Handles a click on a given object
     * @abstract
     * @param {*} obj Object that was clicked. Can be of various classes
     * @returns {State} The next state
     */
    onClick(obj) {
        throw new Error("Method 'onClick()' must be implemented.");
    }

    /**
     * Displays the Board according to the current state
     */
    display() {
        throw new Error("Method 'display()' must be implemented.");
    }

    get orchestrator() {
        return this._orchestrator;
    }
}
