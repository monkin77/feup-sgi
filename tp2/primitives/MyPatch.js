import { CGFnurbsObject, CGFnurbsSurface, CGFobject } from "../../lib/CGF.js";

export class MyPatch extends CGFobject {
    constructor(scene, id, degreeU, degreeV, partsU, partsV, controlPoints) {
        super(scene);
        this.id = id;
        this.degreeU = degreeU;
        this.degreeV = degreeV;
        this.partsU = partsU;
        this.partsV = partsV;
        this.controlPoints = controlPoints;

        this.initialTexCoords = [
            0, 0,
            1, 0,
            0, 1,
            1, 1
        ];

        this.initBuffers();
    }

    initBuffers() {
        this.patch = new CGFnurbsSurface(this.degreeU - 1, this.degreeV - 1, this.controlPoints);
        this.obj = new CGFnurbsObject(this.scene, this.partsU, this.partsV, this.patch);

        this.vertices = [
            this.x1, this.y1, 0, //0
            this.x2, this.y1, 0, //1
            this.x1, this.y2, 0, //2
            this.x2, this.y2, 0 //3
        ];

        //Counter-clockwise reference of vertices
        this.indices = [
            0, 1, 2,
            1, 3, 2
        ];

        //Facing Z positive
        this.normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ];


        this.texCoords = Array.from(this.initialTexCoords);
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * @method updateTexCoords
     * Updates the list of texture coordinates of the rectangle
     * @param {Array} coords - Array of texture coordinates
     */
    updateTexCoords(coords) {
        this.texCoords = [...coords];
        this.updateTexCoordsGLBuffers();
    }

    /**
     * @method scaleTexCoords scales the texture coordinates taking into account the initial texCoords
     * @param {*} s 
     * @param {*} t 
     */
    scaleTexCoords(s, t) {
        // TODO: Verify if this is correct
        for (let i = 0; i < this.texCoords.length; i += 2) {
            this.texCoords[i] = this.initialTexCoords[i] / s;
            this.texCoords[i + 1] = this.initialTexCoords[i + 1] / t;
        }

        this.updateTexCoordsGLBuffers();
    }

    drawElements(mode) {
        this.obj.display();
    }
}