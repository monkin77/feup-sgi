import { player1 } from "../../../../utils/checkers.js";
import MyPlayButton from "../MyPlayButton.js";
import State from "./State.js";
import TurnState from "./TurnState.js";

export default class MenuState extends State {
    constructor(orchestrator) {
        super(orchestrator);
    }

    onClick(obj) {
        if (obj instanceof MyPlayButton) {
            return new TurnState(this.orchestrator, player1, this.orchestrator.board);
        }
        return this;
    }

    display() {
        this._orchestrator._board.display(null, null, true);
    }
}
