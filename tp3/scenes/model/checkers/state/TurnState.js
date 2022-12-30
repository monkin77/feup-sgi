import MyTile from "../MyTile.js";
import PickedState from "./PickedState.js";
import State from "./State.js";

export default class TurnState extends State {
    constructor(orchestrator, player) {
        console.log("Orchestrator: " + orchestrator, "Player: " + player);
        super(orchestrator);
        this.player = player;
    }

    onClick(obj) {
        if (obj instanceof MyTile) {
            // Select the piece
            return new PickedState(this.orchestrator, this.player, obj);
        } else {
            console.log("Clicked object is not being handled");
            return this;
        }
    }

    display() {
        this.orchestrator.board.display(this.player);
    }
}
