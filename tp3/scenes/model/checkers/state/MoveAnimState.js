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
}
