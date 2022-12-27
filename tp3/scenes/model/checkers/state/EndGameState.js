import State from "./State.js";

export default class EndGameState extends State {
    constructor(orchestrator, winner) {
        super(orchestrator);
        this.winner = winner;
    }

    onClick(obj) {
        console.log("Game is over");
        return this;
    }
}