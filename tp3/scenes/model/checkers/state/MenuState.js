import { player1 } from "../../../../utils/checkers.js";
import MyPlayButton from "../MyPlayButton.js";
import MySwitchSceneButton from "../MySwitchSceneButton.js";
import State from "./State.js";
import TurnState from "./TurnState.js";

export default class MenuState extends State {
    constructor(orchestrator) {
        super(orchestrator);
    }

    onClick(obj) {
        console.log(typeof obj)
        if (obj instanceof MyPlayButton) {
            return new TurnState(this.orchestrator, player1, this.orchestrator.board);
        } else if (obj instanceof MySwitchSceneButton) {
            this.orchestrator.scene.onChangeScenery();
        }
        return this;
    }

    display() {
        this._orchestrator._board.display(null, null, true);
    }
}
