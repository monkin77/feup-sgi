import { switchPlayer } from "../../../../utils/checkers.js";
import MyGameMove from "../MyGameMove.js";
import MyGameOrchestrator from "../MyGameOrchestrator.js";
import MyTile from "../MyTile.js";
import State from "./State.js";
import TurnState from "./TurnState.js";

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
        if (obj instanceof MyTile) { // TODO possible tiles not detected
            const possibleTiles = this.orchestrator._board.getPossibleMoves(this.tile);
            if (possibleTiles.includes(obj)) {
                // Perform a Move to a new position
                const move = new MyGameMove(
                    this.tile.piece,
                    this.tile,
                    obj,
                    this.orchestrator._board
                );
                if (!move.validate()) {
                    return new TurnState(this.orchestrator, this.player);
                }

                move.execute();

                this._orchestrator.sequence.addMove(move);

                //this.state = new MoveAnimState(this.player);

                return new TurnState(this.orchestrator, switchPlayer(this.player));
            } else if (obj.id === this.tile.id) {
                // Deselect the piece
                return new TurnState(this.orchestrator, this.player);
            } else {
                // Ignore the click and keep the piece selected
                return new PickedState(this.orchestrator, this.player, obj);
            }
        } else {
            return new TurnState(this.orchestrator, this.player);
        }
    }
}
