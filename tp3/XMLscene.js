import { CGFscene, CGFshader, CGFtexture } from "../lib/CGF.js";
import { CGFaxis, CGFcamera } from "../lib/CGF.js";
import { MyRectangle } from "./primitives/MyRectangle.js";
import CameraAnimation from "./scenes/model/checkers/animation/CameraAnimation.js";
import MyGameOrchestrator from "./scenes/model/checkers/MyGameOrchestrator.js";
import PickedState from "./scenes/model/checkers/state/PickedState.js";
import TurnState from "./scenes/model/checkers/state/TurnState.js";
import { updateLight } from "./scenes/parser/utils.js";
import { defaultFontSize, isWhitePlayer, player1 } from "./utils/checkers.js";

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface
     * @param {string} filename name of the scene's file
     */
    constructor(myinterface, filename) {
        super();

        this.interface = myinterface;
        this.setUpdatePeriod(100);
        this._filename = filename;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);

        this.initShaders();
        this.initTextures();

        this.setUpdatePeriod(100);

        this.gameOrchestrator = new MyGameOrchestrator(this._filename, this);
        this.startTime = null;
        this.cameraAnimation = null;

        // the activation of picking capabilities in WebCGF
        this.setPickEnabled(true);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(
            0.4,
            0.1,
            500,
            vec3.fromValues(15, 15, 15),
            vec3.fromValues(0, 0, 0)
        );
        this.cameraId = null;
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        // Reads the lights from the scene graph.
        for (const light of Object.values(this.graph.lights)) {
            updateLight(this.lights[light[0]], light);
        }
    }

    /**
     * Initialize custom shaders
     */
    initShaders() {
        this.highlightShader = new CGFshader(this.gl, './shaders/highlight.vert', './shaders/highlight.frag');
        this.pickingShader = new CGFshader(this.gl, './shaders/picking.vert', './shaders/picking.frag');
        this.textShader = new CGFshader(this.gl, "./shaders/font.vert", "./shaders/font.frag");

        this.timeFactor = 0;
        this.totalSteps = 100;
        this.slowdownSteps = 40;
        this.highlightAngVelocity = 2.0 * Math.PI / this.totalSteps;

        this.highlightShader.setUniformsValues({ highlightScale: 1, timeFactor: this.timeFactor, highlightColor: [1, 1, 1, 1] });

        // set number of rows and columns in font texture
		this.textShader.setUniformsValues({'dims': [16, 16]});
    }

    /**
     * Initialize custom textures
     */
    initTextures() {
        this.fontTexture = new CGFtexture(this, './scenes/images/oolite-font.trans.png');
        this.letter = new MyRectangle(this, "letter-rectangle", 0, defaultFontSize, 0, defaultFontSize);
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }

    /** Handler called when the graph is finally loaded.
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.camera =
            this.graph.viewsParser.views[this.graph.viewsParser.defaultViewId];
        this.cameraId = this.graph.viewsParser.defaultViewId;

        // Update the interface's camera
        this.interface.setActiveCamera(this.camera);

        this.gl.clearColor(
            this.graph.background[0],
            this.graph.background[1],
            this.graph.background[2],
            this.graph.background[3]
        );

        this.setGlobalAmbientLight(
            this.graph.ambient[0],
            this.graph.ambient[1],
            this.graph.ambient[2],
            this.graph.ambient[3]
        );

        this.initLights();

        this.setupInterface();

        // Initialize Board
        this.gameOrchestrator.initBoard();
            
        this.sceneInited = true;
    }

    /**
     * Method called after the graph is loaded to setup the interface
     */
    setupInterface() {
        // Display Axis Toggle
        this.displayAxis = false;

        // Display Lights Toggle
        this.displayLights = false;

        // Automatically change perspectives at the start of each turn
        this.rotateAutomatically = true;

        // Select the Active Camera
        this.viewsSelector = Object.keys(this.graph.viewsParser.views).reduce((accumulator, key) => {
            return {...accumulator, [key]: key }
        }, {});

        this.selectedView = this.graph.viewsParser.defaultViewId;

        this.interface.onGraphLoaded();
    }

    /**
     * Method called when the user selects a new view from the interface
     */
    onViewChange = () => {
        if (this.selectedView) {
            if (this.selectedView === this.cameraId) return;

            this.cameraAnimation = new CameraAnimation(
                this, this.camera, this.graph.viewsParser.views[this.selectedView],
                (this.cameraId == "White" || this.cameraId == "Black") && (this.selectedView == "White" || this.selectedView == "Black")
            );
            this.cameraId = this.selectedView;
            this.cameraAnimation.start();
        } else console.log("[Error] No view selected");
    }

    /**
     * Changes the perspective to the current player's
     */
    changePerspective(isWhite) {
        if (!this.rotateAutomatically) return;
        if (isWhite) {
            this.selectedView = "White";
        } else {
            this.selectedView = "Black";
        }

        this.onViewChange();
    }

    /**
     * Method called when automatic perspective rotation is toggled
     */
    onToggleAutoRotate = () => {
        if (this.rotateAutomatically) {
            if (!this.gameOrchestrator.state instanceof TurnState &&
                !this.gameOrchestrator.state instanceof PickedState) return;

                this.changePerspective(isWhitePlayer(this.gameOrchestrator.state.player));
        }
    }

    updateAllLights() {
        for (const light of this.lights) {
            // Update visibility of the light. Disabled lights are not visible
            light.setVisible(this.displayLights && light.enabled);

            light.update();
        }
    }

    /**
     * Iterate all the materials and change the active material to the next one
     */
    cycleMaterials() {
        for (const component of Object.values(this.graph.componentsParser.components)) {
            component.nextMaterial();
        }
    }

    update(t) {
        if (!this.sceneInited) return;
        if (this.startTime === null) this.startTime = t;
        this.gameOrchestrator.update(t - this.startTime);

        let currTimeStep = Math.floor(t / this.slowdownSteps) % this.totalSteps;
        this.timeFactor = (1 + Math.sin(this.highlightAngVelocity * currTimeStep)) / 2.0;

        this.highlightShader.setUniformsValues({ timeFactor: this.timeFactor });

        if (this.cameraAnimation) {
            this.cameraAnimation.update(t);
            if (this.cameraAnimation.ended) this.cameraAnimation = null;
        }
    }

    /**
     * Log Picking checks the buffer of picked objects and collects their ids
     * The Checkers pieces are identified by their position on the board. The pick ids from 1-64 are reserved for the board
     */
    logPicking()
	{
		if (this.pickMode == false) {
			// results can only be retrieved when picking mode is false
			if (this.pickResults != null && this.pickResults.length > 0) {
				for (let i=0; i< this.pickResults.length; i++) {
					const obj = this.pickResults[i][0];
					if (obj)
					{
						let customId = this.pickResults[i][1];				
						console.log("Picked object: " + obj.id + ", with pick id " + customId);
                        
                        this.gameOrchestrator.onClick(obj);
					}
				}
				this.pickResults.splice(0, this.pickResults.length);
			}		
		}
	}

    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Picking setup
        // When picking is enabled, the scene's display method is called once for picking, 
		// and then again for rendering.
		// logPicking does nothing in the beginning of the first pass (when pickMode is true)
		// during the first pass, a picking buffer is filled.
		// in the beginning of the second pass (pickMode false), logPicking checks the buffer and
		// collects the id's of the picked object(s) 
		this.logPicking();

		// this resets the picking buffer (association between objects and ids)
		this.clearPickRegistration();
        this.gameOrchestrator.clearPickRegistration();


        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();

        if (this.displayAxis) this.axis.display();

        if (this.sceneInited) {
            // Draw axis
            this.setDefaultAppearance();
            if (this.cameraAnimation) this.cameraAnimation.apply();

            this.updateAllLights();

            // Displays the game
            this.customPrimitiveIdx = 0;    // Reset the custom primitive index
            this.gameOrchestrator.display();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }

    resetAnimation() {
        this.startTime = null;
    }

    undo() {
        this.gameOrchestrator.undo();
    }

    replay() {
        this.gameOrchestrator.replay();
    }
}
