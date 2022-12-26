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

        this.init();
    }

    init() {
        this.patch = new CGFnurbsSurface(this.degreeU, this.degreeV, this.controlPoints);
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
        this.obj.display();
    }

    /**
     * 
     * @param {*} idx Index to add to the original id 
     * @returns New object with the same properties as the original one, but with a different id
     */
    copy(idx) {
        return new MyPatch(this.scene, `${this.id}-${idx}`, this.degreeU, this.degreeV, this.partsU, this.partsV, this.controlPoints);
    }
}