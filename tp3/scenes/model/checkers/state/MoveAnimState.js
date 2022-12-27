import MoveAnimation from "../animation/MoveAnimation.js";
import State from "./State.js";
import TurnState from "./TurnState.js";

export default class MoveAnimState extends State {
    constructor(orchestrator, move, nextPlayer) {
        super(orchestrator);
        this._move = move;
        this._nextPlayer = nextPlayer;
        this._animation = new MoveAnimation(this.orchestrator._scene);
    }

    onClick(obj) {
        console.log("Game is being animated");
        return this;
    }

    update(t) {
        if (!this._animation.hasStarted()) {
            this._animation.start();
        }

        this._animation.update(t);

        // TODO: Check collisions and trigger collection animations

        if (this._animation.ended) {
            this._orchestrator.state = new TurnState(this._orchestrator, this._nextPlayer);
        }
    }

    display() {
        this._move.piece.animation = this._animation;
        this._move._board.display();
        this._move.piece.animation = null;
    }
}
