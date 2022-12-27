import State from "./State.js";

export default class EndGameState extends State {
    constructor(winner) {
        super();
        this.winner = winner;
    }
}