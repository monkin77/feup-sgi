import { CGFtexture } from "../../../../lib/CGF.js";
import { MySceneGraph } from "../../../MySceneGraph.js";
import MyGameOrchestrator from "./MyGameOrchestrator.js";
import MyScoreBoard from "./MyScoreBoard.js";
import MyTimer from "./MyTimer.js";

const ceilingHeight = 40;
const quadPrismLargeSide = 2;
const poleLength = 5;
const poleWidth = 1;
const monitorHeight = 8; 

export default class MyMonitor {
    /**
     * 
     * @param {MySceneGraph} sceneGraph
     * @param {number} sideLength
     * @param {CGFappearance} boardMaterial
     * @param {MyScoreBoard} scoreboard
     * @param {MyTimer} timer
     * @param {boolean} enabled
     */
    constructor(sceneGraph, sideLength, boardMaterial, scoreboard, timer, playButton,
        switchSceneButton, undoButton, replayButton, winnerCard, enabled) {
        this._sceneGraph = sceneGraph;
        this._scene = sceneGraph.scene;

        this._boardMaterial = boardMaterial;
        this._texture = new CGFtexture(this._scene, "scenes/images/light-wood.jpg");

        this._sceneComponents = this._sceneGraph.componentsParser.components;
        const quadrangularPrism = this._sceneComponents["quadrangularPrism"];
        this._quadPrism = quadrangularPrism.copy();

        this._scoreboard = scoreboard;
        this._timer = timer;
        this._playButton = playButton;
        this._switchSceneButton = switchSceneButton;
        this._undoButton = undoButton;
        this._replayButton = replayButton;
        this._winnerCard = winnerCard;

        this.updateTheme(sideLength, enabled);
    }

    /**
     * Method to update the dimensions of the Monitor and the components that depend on it
     * @param {*} newSideLength 
     * @param {*} enabled whether the monitor is enabled or not
     */
    updateTheme(newSideLength, enabled) {
        this._sideLength = newSideLength;
        this._monitorWidth = newSideLength / 2.5;

        this._enabled = enabled;
        if (this._enabled) {
            this._timer.updatePosAndSize(this._monitorWidth, enabled);
            this._scoreboard.updatePosAndSize(this._monitorWidth, enabled);
            this._playButton.updatePosAndSize(this._monitorWidth, enabled);
            this._switchSceneButton.updatePosAndSize(this._monitorWidth, enabled);
            this._undoButton.updatePosAndSize(this._monitorWidth, enabled);
            this._replayButton.updatePosAndSize(this._monitorWidth, enabled);
            this._winnerCard.updatePosAndSize(this._monitorWidth, enabled);
        }
    }

    /**
     * 
     * @param {*} turnCounter 
     */
    display(turnCounter, displayMenu = false, winner = null) {
        if (!this._enabled) return;

        this._boardMaterial.setTexture(this._texture);
        this._boardMaterial.setTextureWrap("REPEAT", "REPEAT");
        this._boardMaterial.apply();

        // Draw the Pole
        this._scene.pushMatrix();

        let translateHeight = ceilingHeight - (poleLength / 2);
        let translateXY = this._sideLength / 2 - poleWidth / 2;
        this._scene.translate(translateXY, translateXY, translateHeight);

        const scaleXFactor = poleWidth / quadPrismLargeSide;
        this._scene.scale(scaleXFactor, poleWidth, poleLength);

        this._sceneGraph.drawComponent(this._quadPrism)

        this._scene.popMatrix();

        // Draw The Monitor
        this._scene.pushMatrix();

        translateHeight = ceilingHeight - (poleLength / 2) - (monitorHeight/2);
        translateXY = this._sideLength / 2 - this._monitorWidth / 2;
        this._scene.translate(translateXY, this._sideLength/2, translateHeight);
        this._scene.scale(this._monitorWidth/quadPrismLargeSide, this._monitorWidth, monitorHeight);

        this._sceneGraph.drawComponent(this._quadPrism);

        this._scene.popMatrix();

        
        // Move the scene to the right position to draw the timer and scoreboard
        this._scene.pushMatrix();
        translateHeight = ceilingHeight - (poleLength / 2) - monitorHeight;
        translateXY = this._sideLength / 2 - this._monitorWidth/2;
        this._scene.translate(translateXY, translateXY, translateHeight);

        // Draw the timer
        this._scene.pushMatrix();
        this._scene.translate(0, 0, this._timer.cardHeight/4)

        if (displayMenu) {
            this._scene.registerForPick(MyGameOrchestrator.pickingId++, this._switchSceneButton);
            this._switchSceneButton.display();
        } else if (winner != null) {
            this._winnerCard.display(winner);
        } else {
            this._timer.display(turnCounter);

            this._scene.registerForPick(MyGameOrchestrator.pickingId++, this._undoButton);
            this._undoButton.display();

            this._scene.registerForPick(MyGameOrchestrator.pickingId++, this._replayButton);
            this._replayButton.display();
        }
        this._scene.popMatrix();

        // Draw the scoreboard
        this._scene.pushMatrix();
        this._scene.translate(0, 0, this._scoreboard.cardHeight/4);

        if (displayMenu) {
            this._scene.registerForPick(MyGameOrchestrator.pickingId++, this._playButton);
            this._playButton.display();
        }
        else {
            this._scoreboard.display();
        }

        this._scene.popMatrix();
        this._scene.popMatrix();

    }

    get enabled() {
        return this._enabled;
    }
}
