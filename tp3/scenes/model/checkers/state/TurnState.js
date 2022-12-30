import MyTile from "../MyTile.js";
import PickedState from "./PickedState.js";
import State from "./State.js";
import { isWhitePlayer, player1 } from "../../../../utils/checkers.js";

export default class TurnState extends State {
    constructor(orchestrator, player, playerChanged = false) {
        super(orchestrator);
        this.player = player;
        this._turnStarted = false;
        this._playerChanged = playerChanged;
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
            this.orchestrator.scene.changePerspective(isWhitePlayer(this.player));
            this._turnStarted = true;
            if (this._playerChanged) this.orchestrator.resetTurnCounter();
        }
        this.orchestrator.board.display(this.player);
    }
}
