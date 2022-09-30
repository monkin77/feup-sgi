import { CGFobject } from '../../lib/CGF.js';

/**
 * MySphere
 * @constructor
 * @param radius - Radius of the sphere
 * @param slices - Number of slices around Z axis
 * @param stacks - Number of stacks along Z axis
 */
export class MySphere extends CGFobject {
	constructor(scene, id, radius, slices, stacks) {
		super(scene);
		this.radius = radius;
        this.slices = slices;
        this.stacks = stacks;

		this.initBuffers();
	}

	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

        const sliceDelta = 2*Math.PI / this.slices;
        const stackDelta = Math.PI / this.stacks;
        let idx = 0;

        for (   let curSlice = 0, sliceAng = 0;
                curSlice <= this.slices;
                curSlice++, sliceAng += sliceDelta
            )
        {
            const sliceSin = Math.sin(sliceAng);
            const sliceCos = Math.cos(sliceAng);
            for (   let curStack = 0, stackAng = 0;
                    curStack <= this.stacks;
                    curStack++, stackAng += stackDelta
                )
            {
                const stackSin = Math.sin(stackAng);
                const stackCos = Math.cos(stackAng);

                this.vertices.push(
                    this.radius * stackSin * sliceCos,
                    this.radius * stackSin * sliceSin,
                    this.radius * stackCos,
                );
                // Last vertices already have indices
				if (curSlice < this.slices && curStack < this.stacks) {
					this.indices.push(
						idx, idx + this.stacks + 2, idx + this.stacks + 1,
						idx, idx + 1, idx + this.stacks + 2,
					);
				}
                this.normals.push(
                    stackSin * sliceCos,
                    stackSin * sliceSin,
                    stackCos,
                );
                this.texCoords.push(
                    curSlice / this.slices,
                    curStack / this.stacks,
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
