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
        this.initialTexCoords = [];

        const sliceDelta = 2 * Math.PI / this.slices;
        const stackDelta = Math.PI / this.stacks;
        let idx = 0;

        for (let curSlice = 0, sliceAng = 0; curSlice <= this.slices; curSlice++, sliceAng += sliceDelta) {
            const sliceSin = Math.sin(sliceAng);
            const sliceCos = Math.cos(sliceAng);
            for (let curStack = 0, stackAng = 0; curStack <= this.stacks; curStack++, stackAng += stackDelta) {
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
                this.initialTexCoords.push(
                    curSlice / this.slices,
                    curStack / this.stacks,
                );

                idx++;
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.texCoords = [...this.initialTexCoords];
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
        for (let i = 0; i < this.texCoords.length; i += 2) {
            this.texCoords[i] = this.initialTexCoords[i] / s;
            this.texCoords[i + 1] = this.initialTexCoords[i + 1] / t;
        }

        this.updateTexCoordsGLBuffers();
    }

    /**
     * 
     * @param {*} idx Index to add to the original id 
     * @returns New object with the same properties as the original one, but with a different id
     */
    copy(idx) {
        return new MySphere(this.scene, `${this.id}-${idx}`, this.radius, this.slices, this.stacks);
    }
}