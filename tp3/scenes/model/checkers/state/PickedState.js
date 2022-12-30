import MyGameMove from "../MyGameMove.js";
import MyGameOrchestrator from "../MyGameOrchestrator.js";
import MyTile from "../MyTile.js";
import State from "./State.js";
import TurnState from "./TurnState.js";
import MoveAnimState from "./MoveAnimState.js";
import EndGameState from "./EndGameState.js";
import { boardState, switchPlayer } from "../../../../utils/checkers.js";

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

                // Check what is the next game's state
                // TODO: Move this to a function
                const board = this._orchestrator.board;

                // Get the (i, j) coordinates of the destination tile
                const {i: iDest, j: jDest} = move.board.getTileCoordinates(move.toTile);
                // Fetch the tile from the updated Board at the destination coordinates. 
                // This is necessary because the move object contains the previous board state
                const lastMoveTile = board.getTileByCoordinates(iDest, jDest);


                // If a player can capture, he must capture. 
                // So we can consider the canCapture parameter as an indicator of capture
                const newStateIndicator = board.checkBoardState(lastMoveTile, canCapture);
                let nextTurnState;
                switch (newStateIndicator) {
                    case boardState.SWITCH_PLAYER:
                        nextTurnState = new TurnState(this._orchestrator, switchPlayer(this.player));
                        break;
                    case boardState.MOVE_AGAIN:
                        nextTurnState = new TurnState(this._orchestrator, this.player);
                        break;
                    case boardState.END:
                        // The current player won
                        // TODO: Complete the EndGameState class
                        nextTurnState = new EndGameState(this._orchestrator, this.player);
                        break;
                    default:
                        throw new Error("Invalid board state");
                }

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
        this.orchestrator._board.display(this.player, this.tile);
    }
}
