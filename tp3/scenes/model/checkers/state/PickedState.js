import { switchPlayer } from "../../../../utils/checkers.js";
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
     * @param {MyTile} tile 
     */
    constructor(orchestrator, player, tile) {
        super(orchestrator);
        this.player = player;
        this.tile = tile;
    }

    onClick(obj) {
        if (obj instanceof MyTile) { // TODO Finish game logic
            const possibleTiles = this.orchestrator._board.getPossibleMoves(this.tile);
            if (possibleTiles.includes(obj)) {
                // Perform a Move to a new position
                const move = new MyGameMove(
                    this.tile.piece,
                    this.tile,
                    obj, this.player,
                    this.orchestrator._board
                );
                if (!move.validate()) {
                    return new TurnState(this.orchestrator, this.player);
                }

                this.orchestrator.board = move.execute();
                this._orchestrator.sequence.addMove(move);

                return new MoveAnimState(this.orchestrator, move, switchPlayer(this.player));
            } else if (obj.id === this.tile.id) {
                // Turn off the spotlight
                this._orchestrator.board.disableSpotlight();

                // Deselect the piece
                return new TurnState(this.orchestrator, this.player);
            } else {
                // Move the spotlight to the clicked tile
                let tilePos = this._orchestrator.board.getTileAbsPosition(obj);
                tilePos = this._orchestrator.board.getCenteredAbsPosition(tilePos);
                this._orchestrator.board.moveSpotlight(tilePos);

                // Another piece was selected
                return new PickedState(this.orchestrator, this.player, obj);
            }
        } else {
            return new TurnState(this.orchestrator, this.player);
        }
    }

    display() {
        this.orchestrator._board.display(this.player, this.tile);
    }
}
