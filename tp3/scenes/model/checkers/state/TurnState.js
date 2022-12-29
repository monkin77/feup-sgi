import MyTile from "../MyTile.js";
import PickedState from "./PickedState.js";
import State from "./State.js";
import { player1 } from "../../../../utils/checkers.js";

export default class TurnState extends State {
    constructor(orchestrator, player) {
        console.log("Orchestrator: " + orchestrator, "Player: " + player);
        super(orchestrator);
        this.player = player;
        this._turnStarted = false;
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
        if (!this._turnStarted) {
            this.orchestrator.scene.changePerspective(this.player === player1);
            this._turnStarted = true;
        }
        this.orchestrator.board.display(this.player);
    }
}
