import { MySceneGraph } from "../../../MySceneGraph.js";
import { player1 } from "../../../utils/checkers.js";
import MyBoard from "./MyBoard.js";
import MyGameSequence from "./MyGameSequence.js";
import MenuState from "./state/MenuState.js";
import TurnState from "./state/TurnState.js";
import PickedState from "./state/PickedState.js";
import ReplayState from "./state/ReplayState.js";

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
     */
    initBoard() {
        this._board = new MyBoard(this._theme, -5, 0, 10, 20);
        if (this.state instanceof MenuState) {
            this.state = new TurnState(this, player1, this._board);
        }
    }

    /**
     * Updates the time of the game
     */
    update(t) {
        for (const animation of Object.values(this._theme.animations))
            animation.update(t);
        this.state.update(t);
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
        // TODO: Think how to handle graph in scene/theme and orchestrator
        this._theme = new MySceneGraph(filename, this._scene);
    }

    /**
     * Undoes the last move
     */
    undo() {
        if (this.state instanceof TurnState ||
            this.state instanceof PickedState) {
                const lastMove = this._sequence.undo();
                this._board = lastMove.board;
                this.state = new TurnState(this, lastMove.player);
            }
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
        // TODO: Handle general scene clicks
        this.state = this.state.onClick(obj);
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
}
