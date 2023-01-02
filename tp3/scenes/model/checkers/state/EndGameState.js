import { player1 } from "../../../../utils/checkers.js";
import MyHomeButton from "../MyHomeButton.js";
import MyRematchButton from "../MyRematchButton.js";
import MenuState from "./MenuState.js";
import State from "./State.js";
import TurnState from "./TurnState.js";

export default class EndGameState extends State {
    constructor(orchestrator, winner) {
        super(orchestrator);
        this.winner = winner;
        this.orchestrator.board.scoreboard.increaseScore(this.winner);
    }

    onClick(obj) {
        if (obj instanceof MyHomeButton) {
            this.orchestrator.restart();
            return new MenuState(this.orchestrator);
        } else if (obj instanceof MyRematchButton) {
            this.orchestrator.rematch();
            return new TurnState(this.orchestrator, player1, true);
        }
        return this;
    }

    display() {
        this.orchestrator.board.display(null, null, false, this.winner);
    }
}