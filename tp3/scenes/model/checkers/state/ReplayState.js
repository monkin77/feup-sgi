import MoveAnimState from "./MoveAnimState.js";
import State from "./State.js";

export default class ReplayState extends State {
    constructor(orchestrator, sequence, previousState) {
        super(orchestrator);
        this._sequence = sequence;
        this._previousState = previousState;
        this._currentMove = 0;
    }

    onClick(obj) {
        console.log("Game is being replayed");
        return this;
    }

    update(t) {
        this.updateState();
    }

    display() {
        this.updateState();
        this.orchestrator.state.display();
    }

    updateState() {
        if (this._currentMove >= this._sequence.moves.length) {
            // Replay ended
            this.orchestrator.state = this._previousState;
            return;
        }

        const move = this._sequence.moves[this._currentMove++];
        move.board.updateTheme(this.orchestrator.theme);
        this.orchestrator.state = new MoveAnimState(this.orchestrator, move, this);
    }
}
