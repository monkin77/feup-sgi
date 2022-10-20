import { CGFscene } from "../lib/CGF.js";
import { CGFaxis, CGFcamera } from "../lib/CGF.js";
import { updateLight } from "./scenes/parser/utils.js";

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
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
        this.setUpdatePeriod(100);
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
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        // Reads the lights from the scene graph.
        for (const light of Object.values(this.graph.lights)) {
            updateLight(this.lights[light[0]], light);
        }
        // console.log(this.lights)
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
            this.camera = this.graph.viewsParser.views[this.selectedView];
            // Update the interface's camera
            this.interface.setActiveCamera(this.camera);
        } else console.log("[Error] No view selected");
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
        console.log("here")
        for (const component of Object.values(this.graph.componentsParser.components)) {
            component.nextMaterial();
        }
    }


    /**
     * Displays the scene.
     */
    display() {
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

            this.updateAllLights();

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}