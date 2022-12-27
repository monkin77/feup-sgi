import State from "./State.js";

export default class MoveAnimState extends State {
    constructor(orchestrator, player) {
        super(orchestrator);
        this.player = player;
    }

    onClick(obj) {
        console.log("Game is being animated");
        return this;
    }

    display() {
        // TODO: Check what should be displayed
        this._orchestrator._board.display();
        this._orchestrator._animator.apply();
    }
}
