import { MySceneGraph } from "../../../MySceneGraph.js";
import CheckersAnimation from "./CheckersAnimation.js";
import MyBoard from "./MyBoard.js";
import MyGameSequence from "./MyGameSequence.js";

/**
 * TODO: Class that orchestrates the execution of the checkers game
 * • Manages the entire game:
 *  • Load of new scenes (new files)
 *  • Manage gameplay (game states and interrupting game states)
 *  • Manages undo
 *  • Manages movie play
 *  • Manage object selection
 */
export default class MyGameOrchestrator {
    constructor(filename, scene) {
        this._scene = scene;
        this._sequence = new MyGameSequence();
        this._animator = new CheckersAnimation(this._sequence);
        this._theme = new MySceneGraph(filename, this._scene);
    }

    /**
     * Initializes the board after the theme is loaded
     */
    initBoard() {
        this._board = new MyBoard(this._theme, -5, 0, 10, 20);
    }

    /**
     * Updates the time of the game
     */
    update(t) {
        for (const animation of Object.values(this._theme.animations))
            animation.update(t);
        this._animator.update(t);
    }

    /**
     * Displays the game
     */
    display() {
        this._theme.displayScene();
        this._board.display();
        this._animator.apply();
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
        // TODO: Implement undo
        this._sequence.undo();
    }

    /**
     * Replays the moves of the game
     */
    replay() {
        // TODO: Implement replay
        this._sequence.replay();
    }

    /**
     * Sets the pickId of the components to null
     */
    clearPickRegistration() {
        if (this._scene.inited) {
            for (const component of Object.values(this._theme.componentsParser.components)) {
                component.resetPickId();
            }
        }
    }

    /**
     * Handles a click by the user
     * @param {*} boardIdx 
     */
    onClick(boardIdx) {
        if (boardIdx >= 0 && boardIdx < 64) {
            this._board.selectTile(boardIdx);
        } else {
            console.log("Click index is unknown");
        }
    }
}
