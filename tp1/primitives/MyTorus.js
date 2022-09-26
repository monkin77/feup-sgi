import { CGFobject } from '../../lib/CGF.js';

/**
 * MyTorus
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - X component of the triangle's vertices
 * @param y - Y component of the triangle's vertices
 * @param z - Z component of the triangle's vertices
 */
export class MyTorus extends CGFobject {
	constructor(scene, id, inner, outer, slices, loops) {
		super(scene);
		this.inner = inner;
        this.outer = outer;
        this.slices = slices;
        this.loops = loops;

		this.initBuffers();
	}

	initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const sliceAngle = 2*Math.PI / this.slices;
        const loopAngle = 2*Math.PI / this.loops;
        let idx = 0;

        for (	let curLoop = 0, loopAng = 0;
                curLoop <= this.loops;
                curLoop++, loopAng += loopAngle
            ){
            const loopSin = Math.sin(loopAng);
            const loopCos = Math.cos(loopAng);
            for (	let curSlice = 0, sliceAng = 0;
                    curSlice <= this.slices;
                    curSlice++, sliceAng += sliceAngle
                ) {
                const sliceSin = Math.sin(sliceAng);
                const sliceCos = Math.cos(sliceAng);

                this.vertices.push(
                    (this.outer + this.inner * sliceCos) * loopCos,
                    (this.outer + this.inner * sliceCos) * loopSin,
                    this.inner * sliceSin,
                );

                // Last vertices already have indices
                if (curSlice < this.slices && curLoop < this.loops) {
                    this.indices.push(
                        idx + this.slices + 1, idx, idx + 1,
                        idx + 1, idx + 2 + this.slices, idx + this.slices + 1
                    );
                }

                this.normals.push(
                    loopCos * sliceCos,
                    loopSin * sliceCos,
                    sliceSin,
                );

                this.texCoords.push(
                    curSlice / this.slices,
                    curLoop / this.loops,
                );

                idx++;
            }
        }

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
}
