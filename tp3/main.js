import { CGFapplication } from '../lib/CGF.js';
import { XMLscene } from './XMLscene.js';
import { MyInterface } from './MyInterface.js';

function main() {

    // Standard application, scene and interface setup
    const app = new CGFapplication(document.body);
    const myInterface = new MyInterface();

    const myScene = new XMLscene(myInterface);

    app.init();

    app.setScene(myScene);
    app.setInterface(myInterface);

    myInterface.setActiveCamera(myScene.camera);

    // start
    app.run();
}

main();