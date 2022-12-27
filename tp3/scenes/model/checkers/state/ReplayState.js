import State from "./State.js";

export default class ReplayState extends State {
    constructor(orchestrator) {
        super(orchestrator);
    }

    onClick(obj) {
        console.log("Game is being replayed");
        return this;
    }
}