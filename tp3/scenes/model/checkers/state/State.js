export default class State {
    /**
     * Constructor for the State abstract class.
     * @constructor
     * @abstract
    */
    constructor() {
        if (this.constructor === State) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }
}