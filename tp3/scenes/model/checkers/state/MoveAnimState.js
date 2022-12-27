import MoveAnimation from "../animation/MoveAnimation.js";
import State from "./State.js";
import TurnState from "./TurnState.js";

export default class MoveAnimState extends State {
    constructor(orchestrator, move, nextPlayer) {
        super(orchestrator);
        this._move = move;
        this._nextPlayer = nextPlayer;

        const { rowDiff, colDiff } = move.board.getDifferenceBetweenTiles(move.fromTile, move.toTile);
        // TODO: Fix this offset, there's a small difference between the piece's center and the tile's center
        const baseOffset = - move.piece.radius + move.piece.sideLength / 2;
        const rowOffset = Math.sign(rowDiff) * baseOffset;
        const colOffset = Math.sign(colDiff) * baseOffset;
        this._animation = new MoveAnimation(
            this.orchestrator._scene,
            colDiff + colOffset, rowDiff + rowOffset
        );
    }

    onClick(obj) {
        console.log("Game is being animated");
        return this;
    }

    update(t) {
        if (!this._animation.hasStarted()) {
            this._animation.start();
            this._move.piece.animation = this._animation;
        }

        this._animation.update(t);

        // TODO: Check collisions and trigger collection animations

        if (this._animation.ended) {
            this._move.piece.animation = null;
            this._orchestrator.state = new TurnState(this._orchestrator, this._nextPlayer);
        }
    }

    display() {
        this._move.board.display();
    }
}
