import { CGFinterface, CGFapplication, dat } from '../lib/CGF.js';

/**
 * MyInterface class, creating a GUI interface.
 */

export class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)

        this.initKeys();

        return true;
    }

    /**
     * Method that setups the interface after the graph has been loaded.
     */
    onGraphLoaded() {
        this.gui.add(this.scene, 'displayAxis').name("Display Axis");

        // Lights
        this.gui.add(this.scene, 'displayLights').name("Display Lights");

        const folder = this.gui.addFolder('Lights');
        const lightsProperties = this.scene.graph.lights;
        for (let i = 0; i < Object.keys(lightsProperties).length; i++) {
            folder.add(this.scene.lights[i], 'enabled').name(Object.keys(lightsProperties)[i]);
        }

        // Selected View
        this.gui.add(this.scene, 'selectedView', this.scene.viewsSelector).name('Active View').onChange(this.scene.onViewChange);

    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui = this;
        this.processKeyboard = function() {};
        this.activeKeys = {};
    }

    processKeyDown(event) {
        this.activeKeys[event.code] = true;
        if (event.code == "KeyM" && this.scene.sceneInited) {
            this.scene.cycleMaterials();
        }
    };

    processKeyUp(event) {
        this.activeKeys[event.code] = false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}