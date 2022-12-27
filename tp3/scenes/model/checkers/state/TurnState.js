import State from "./State.js";

export default class TurnState extends State {
    constructor(player) {
        super();
        this.player = player;
    }
}