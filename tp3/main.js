import { CGFapplication } from '../lib/CGF.js';
import { XMLscene } from './XMLscene.js';
import { MyInterface } from './MyInterface.js';

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function(m, key, value) {
            vars[decodeURIComponent(key)] = decodeURIComponent(value);
        });
    return vars;
}

function main() {

    // Standard application, scene and interface setup
    const app = new CGFapplication(document.body);
    const myInterface = new MyInterface();

    // get file name provided in URL, e.g. http://localhost/myproj/?file=myfile.xml 
    // or use "demo.xml" as default (assumes files in subfolder "scenes", check MySceneGraph constructor) 
    const filename = getUrlVars()['file'] || "demo.xml";
    const myScene = new XMLscene(myInterface, filename);

    app.init();

    app.setScene(myScene);
    app.setInterface(myInterface);

    myInterface.setActiveCamera(myScene.camera);

    // start
    app.run();
}

main();