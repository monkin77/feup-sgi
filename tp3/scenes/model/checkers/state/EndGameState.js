import State from "./State.js";

export default class EndGameState extends State {
    constructor(orchestrator, winner) {
        super(orchestrator);
        this.winner = winner;
        this.orchestrator.board.scoreboard.increaseScore(this.winner);
    }

    onClick(obj) {
        console.log("Game is over");
        return this;
    }

    display() {
        this.orchestrator.board.display(null, null, false, this.winner);
    }
}