import { MySceneGraph } from "../../../MySceneGraph.js";
import { boardState, player1, player2, switchPlayer } from "../../../utils/checkers.js";
import MyBoard from "./MyBoard.js";
import MyGameSequence from "./MyGameSequence.js";
import MenuState from "./state/MenuState.js";
import TurnState from "./state/TurnState.js";
import PickedState from "./state/PickedState.js";
import ReplayState from "./state/ReplayState.js";
import MyGameMove from "./MyGameMove.js";
import EndGameState from "./state/EndGameState.js";
import { sceneFiles } from "../../../XMLscene.js";
import MyUndoButton from "./MyUndoButton.js";
import MyReplayButton from "./MyReplayButton.js";

const TURN_DURATION_SECONDS = 60;

/**
 * Class that orchestrates the execution of the checkers game
 * • Manages the entire game:
 *  • Load of new scenes (new files)
 *  • Manage gameplay (game states and interrupting game states)
 *  • Manages undo
 *  • Manages movie play
 *  • Manage object selection
 */
export default class MyGameOrchestrator {
    static pickingId = 1;

    constructor(filename, scene) {
        this._scene = scene;
        this._sequence = new MyGameSequence();
        this._theme = new MySceneGraph(filename, this._scene);
        this.state = new MenuState(this);
    }

    /**
     * Initializes the board after the theme is loaded
     * @param {string} newFilename Filename of the new Scene that was loaded
     */
    initBoard(newFilename) {
        if (!this._board) {
            // If the board is not initialized, initialize it
            this._board = new MyBoard(this._theme, this._theme.boardParser.position, this._theme.boardParser.sideLength);
        } else {
            this._board.updateTheme(this._theme);
            // The Scene was changed
            if (newFilename == sceneFiles[0]) {
                // Temple theme was loaded
            } else if (newFilename == sceneFiles[1]) {
                // Big Checkers theme was loaded
            } else {
                throw new Error("Unknown theme loaded");
            }
        }
    }

    /**
     * Updates the time of the game
     */
    update(t) {
        for (const animation of Object.values(this._theme.animations))
            animation.update(t);
        this.state.update(t);

        if (this.state instanceof EndGameState ||
            this.state instanceof MenuState) return;

        if (!this.lastTimestamp) {
            this.resetTurnCounter();
        } else {
            const secondsElapsed = (t - this.lastTimestamp) / 1000;
            this._turnCounter = Math.max(0, this._turnCounter - secondsElapsed);
            if (this._turnCounter == 0) {
                this.state = new EndGameState(this, switchPlayer(this.state.player));
            }
        }
        this.lastTimestamp = t;
    }

    /**
     * Displays the game
     */
    display() {
        this._theme.displayScene();

        // Display the board according to the current state
        this.state.display();
    }

    /**
     * Changes the theme of the game
     * @param {string} filename Filename of the new theme
     */
    changeTheme(filename) {
        this._theme = new MySceneGraph(filename, this._scene);
    }

    /**
     * Undoes the last move
     */
    undo() {
        if (this.state instanceof TurnState ||
            this.state instanceof PickedState) {
                const lastMove = this._sequence.undo();
                if (!lastMove) return this.state;

                this._board = lastMove.board;
                if (this.state.player !== lastMove.player) {
                    this.resetTurnCounter();
                }
                this.state = new TurnState(this, lastMove.player);
            }
        return this.state;
    }

    /**
     * Replays the moves of the game
     */
    replay() {
        if (!(this.state instanceof MenuState)) {
                this.state = new ReplayState(this, this._sequence, this.state);
            }
    }

    /**
     * Sets the pickId of the components to null
     */
    clearPickRegistration() {
        if (this._scene.sceneInited) {
            for (const component of Object.values(this._theme.componentsParser.components)) {
                component.resetPickId();
            }
            
            MyGameOrchestrator.pickingId = 1;    // Tracks the current picking id to avoid duplicates
        }
    }

    /**
     * Handles a click by the user
     * @param {*} obj Object that was clicked. Can be of various classes 
     */
    onClick(obj) {
        if (obj instanceof MyUndoButton) {
            this.undo();
        } else if (obj instanceof MyReplayButton) {
            this.replay();
        } else {
            this.state = this.state.onClick(obj);
        }
    }

    /**
     * This method contains the logic to calculate the next state of the game
     * @param {MyGameMove} move last executed move 
     * @param {boolean} hasCaptured whether the player has captured a piece
     * @param {number} player player that executed the move
     * @returns {State} next state of the game
     */
    getNextState(move, hasCaptured, player) {
        // Get the (i, j) coordinates of the destination tile
        const {i: iDest, j: jDest} = move.board.getTileCoordinates(move.toTile);
        // Fetch the tile from the updated Board at the destination coordinates. 
        // This is necessary because the move object contains the previous board state
        const lastMoveTile = this.board.getTileByCoordinates(iDest, jDest);

        const newStateIndicator = this.board.checkBoardState(lastMoveTile, hasCaptured);

        switch (newStateIndicator) {
            case boardState.SWITCH_PLAYER:
                return new TurnState(this, switchPlayer(player), true);
            case boardState.MOVE_AGAIN:
                return new TurnState(this, player);
            case boardState.END:
                // The current player won
                // TODO: Complete the EndGameState class
                return new EndGameState(this, player);
            default:
                throw new Error("Invalid board state");
        }
    }

    /*
     * Resets the turn counter
     */
    resetTurnCounter() {
        this._turnCounter = TURN_DURATION_SECONDS;
    }

    get sequence() {
        return this._sequence;
    }

    get board() {
        return this._board;
    }

    set board(board) {
        this._board = board;
    }

    get scene() {
        return this._scene;
    }

    get theme() {
        return this._theme;
    }

    get turnCounter() {
        return this._turnCounter;
    }
}
