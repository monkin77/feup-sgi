import State from "./State.js";

export default class MenuState extends State {
    constructor(orchestrator) {
        super(orchestrator);
    }

    onClick(obj) {
        console.log("Game menu");
        return this;
    }
}
