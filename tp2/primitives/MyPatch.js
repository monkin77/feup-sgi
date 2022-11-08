import { CGFnurbsObject, CGFnurbsSurface, CGFobject } from "../../lib/CGF.js";

export class MyPatch extends CGFobject {
    constructor(scene, id, degreeU, degreeV, partsU, partsV, controlPoints) {
        super(scene);
        this.id = id;
        this.degreeU = degreeU;
        this.degreeV = degreeV;
        this.partsU = partsU;
        this.partsV = partsV;
        this.controlPoints = [];

        for (let u = 0; u < degreeU + 1; u++) {
            const fixedUPoints = controlPoints.slice(u * (degreeV + 1), (u + 1) * (degreeV + 1));
            this.controlPoints.push(fixedUPoints);
        }
        console.log("control points: ", this.controlPoints);

        this.init();
    }

    init() {
        this.patch = new CGFnurbsSurface(this.degreeU - 1, this.degreeV - 1, this.controlPoints);
        this.obj = new CGFnurbsObject(this.scene, this.partsU, this.partsV, this.patch);
    }

    /**
     * @method scaleTexCoords scales the texture coordinates taking into account the initial texCoords
     * @param {*} s 
     * @param {*} t 
     */
    scaleTexCoords(s, t) {
        return;
    }

    display() {
        console.log("drawing patch " + this.id);
        this.obj.display();
    }
}