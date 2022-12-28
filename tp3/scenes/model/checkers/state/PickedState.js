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
     * @param {MyTile} tile picked tile
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
                    // Turn off the spotlight
                    this._orchestrator.board.disableSpotlight();

                    // Deselect the piece
                    return new TurnState(this.orchestrator, this.player);
                }

                // Store the initial position of the piece for the spotlight animation
                const initPiecePosition = this._orchestrator.board.getTileAbsPosition(this.tile, true)

                this.orchestrator.board = move.execute();
                this._orchestrator.sequence.addMove(move);

                return new MoveAnimState(this.orchestrator, move, switchPlayer(this.player), initPiecePosition);
            } else if (obj.id === this.tile.id) {
                // Turn off the spotlight
                this._orchestrator.board.disableSpotlight();

                // Deselect the piece
                return new TurnState(this.orchestrator, this.player);
            } else {
                // Move the spotlight to the clicked tile
                const tilePos = this._orchestrator.board.getTileAbsPosition(obj, true);
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
