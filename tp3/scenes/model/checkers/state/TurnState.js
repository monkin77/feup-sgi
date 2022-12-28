import MyTile from "../MyTile.js";
import PickedState from "./PickedState.js";
import State from "./State.js";

export default class TurnState extends State {
    constructor(orchestrator, player) {
        super(orchestrator);
        this.player = player;
    }

    onClick(obj) {
        if (obj instanceof MyTile) {
            // Move the spotlight to the clicked tile
            const tilePos = this._orchestrator.board.getTileAbsPosition(obj, true);
            this._orchestrator.board.moveSpotlight(tilePos);

            // Select the piece
            return new PickedState(this.orchestrator, this.player, obj);
        } else {
            console.log("Clicked object is not being handled");
            return this;
        }
    }

    display() {
        this.orchestrator._board.display(this.player);
    }
}
