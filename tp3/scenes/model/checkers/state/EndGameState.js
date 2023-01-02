import MyHomeButton from "../MyHomeButton.js";
import MenuState from "./MenuState.js";
import State from "./State.js";

export default class EndGameState extends State {
    constructor(orchestrator, winner) {
        super(orchestrator);
        this.winner = winner;
        this.orchestrator.board.scoreboard.increaseScore(this.winner);
    }

    onClick(obj) {
        if (obj instanceof MyHomeButton) {
            return new MenuState(this.orchestrator);
        }
        return this;
    }

    display() {
        this.orchestrator.board.display(null, null, false, this.winner);
    }
}