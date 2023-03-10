import MyGameMove from "../MyGameMove.js";
import MyGameOrchestrator from "../MyGameOrchestrator.js";
import MyTile from "../MyTile.js";
import State from "./State.js";
import TurnState from "./TurnState.js";
import MoveAnimState from "./MoveAnimState.js";

export default class PickedState extends State {
    /**
     * 
     * @param {MyGameOrchestrator} orchestrator 
     * @param {number} player 
     * @param {MyTile} tile picked tile
     */
    constructor(orchestrator, player, tile) {
        super(orchestrator);
        this.player = player;
        this.tile = tile;
    }

    onClick(obj) {
        if (obj instanceof MyTile) {
            const [possibleTiles, canCapture] = this.orchestrator._board.getPossibleMoves(this.tile);
            if (possibleTiles.includes(obj)) {

                // Perform a Move to a new position
                const move = new MyGameMove(
                    this.tile.piece,
                    this.tile,
                    obj, this.player,
                    this._orchestrator.board
                );
                if (!move.validate()) {
                    // Deselect the piece
                    return new TurnState(this.orchestrator, this.player);
                }

                this.orchestrator.board = move.execute();
                this._orchestrator.sequence.addMove(move);

                // ==== Check what is the next game's state ====
                // If a player can capture, he must capture.
                // So we can consider the canCapture parameter as an indicator of capture
                const nextTurnState = this._orchestrator.getNextState(move, canCapture, this.player);

                return new MoveAnimState(this.orchestrator, move, nextTurnState);
            } else if (obj.id === this.tile.id) {
                // Deselect the piece
                return new TurnState(this.orchestrator, this.player);
            } else {
                // Another piece was selected
                return new PickedState(this.orchestrator, this.player, obj);
            }
        } else {
            return new TurnState(this.orchestrator, this.player);
        }
    }

    display() {
        this.orchestrator.board.display(this.player, this.tile);
    }
}
