import { getTranslation } from "../../../../utils/algebra.js";
import BounceAnimation from "../animation/BounceAnimation.js";
import MoveAnimation from "../animation/MoveAnimation.js";
import State from "./State.js";
import TurnState from "./TurnState.js";

export default class MoveAnimState extends State {
    constructor(orchestrator, move, nextPlayer) {
        super(orchestrator);
        this._move = move;
        this._nextPlayer = nextPlayer;

        const { rowDiff, colDiff } = move.board.getDifferenceBetweenTiles(move.fromTile, move.toTile);
        this._animation = new MoveAnimation(
            this.orchestrator._scene,
            colDiff, rowDiff
        );
        this._collisionAnimations = [];
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
        this._collisionAnimations.forEach(a => a.update(t));

        this.checkCollisionsAndAnimate();

        if (this._animation.ended) {
            if (this._collisionAnimations.some(a => !a.ended)) return;
            this._move.piece.animation = null;
            this._orchestrator.state = new TurnState(this._orchestrator, this._nextPlayer);
        }
    }

    checkCollisionsAndAnimate() {
        const initialPos = this._move.board.getCenteredAbsPosition(
            this._move.board.getTileAbsPosition(this._move.fromTile)
        );
        const transfMatrix = this._animation.keyFrameAnimation.transfMatrix;
        const translation = getTranslation(transfMatrix);
        const boardTranslation = [translation[0], translation[2], -translation[1]];
        const curPos = vec3.add(vec3.create(), initialPos, boardTranslation);

        this._move.board.tiles.forEach(tile => {
            if (tile === this._move.fromTile || tile === this._move.toTile || !tile.piece) {
                return;
            }

            const tilePos = this._move.board.getCenteredAbsPosition(
                this._move.board.getTileAbsPosition(tile)
            );
            if (vec3.dist(tilePos, curPos) < tile.piece.radius + this._move.piece.radius) {
                if (tile.piece.animation) return;

                const storage = tile.piece.isWhite ? this._move.board.blackStorage : this._move.board.whiteStorage;
                const pieceTranslation = storage.getPieceOverallTranslation(storage.captured.length);
                const realPieceTranslation = [pieceTranslation[0], pieceTranslation[2], -pieceTranslation[1]];
                const relativeOrigin = this._move.board.getTileAbsPosition(this._move.board.getTileByCoordinates(0, 0));
                const finalPos = vec3.add(vec3.create(), relativeOrigin, realPieceTranslation);

                const collisionAnimation = new BounceAnimation(
                    this._orchestrator._scene,
                    tilePos, finalPos
                );

                collisionAnimation.start();
                tile.piece.animation = collisionAnimation;
                this._collisionAnimations.push(collisionAnimation);
            }
        });
    }

    display() {
        this._move.board.display();
    }
}
