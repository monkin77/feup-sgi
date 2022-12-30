import State from "./State.js";

export default class MenuState extends State {
    constructor(orchestrator) {
        super(orchestrator);
    }

    onClick(obj) {
        console.log("Game menu");
        return this;
    }

    display() {
        // TODO: Display Menu
        this._orchestrator._board.display();
    }
}
