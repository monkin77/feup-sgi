import { CGFobject } from '../../lib/CGF.js';

/**
 * MyCylinder
 * @constructor
 * @param scene - Reference to MyScene object
 * @param radiusBot - Radius of the base
 * @param radiusTop - Radius of the top
 * @param h - Height of the cylinder
 * @param slices - Number of slices on the rotation
 * @param stacks - Number of stacks on the height
 */
export class MyCylinder extends CGFobject {
    constructor(scene, id, radiusBot, radiusTop, h, slices, stacks) {
        super(scene);
        this.radiusBot = radiusBot;
        this.radiusTop = radiusTop;
        this.h = h;
        this.slices = slices;
        this.stacks = stacks;
        this.id = id;

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.initialTexCoords = [];

        const sliceAngle = 2 * Math.PI / this.slices;
        const stackHeight = this.h / this.stacks;
        const radiusDiff = (this.radiusTop - this.radiusBot) / this.stacks;
        let idx = 0;

        for (let curStack = 0, h = 0, curRadius = this.radiusBot; curStack <= this.stacks; curStack++, h += stackHeight, curRadius += radiusDiff) {
            for (let curSlice = 0, ang = 0; curSlice <= this.slices; curSlice++, ang += sliceAngle) {
                const cos = Math.cos(ang);
                const sin = Math.sin(ang);

                this.vertices.push(
                    curRadius * cos, curRadius * sin, h,
                );
                // Last vertices already have indices
                if (curSlice < this.slices && curStack < this.stacks) {
                    this.indices.push(
                        idx + this.slices + 1, idx, idx + 1,
                        idx + 1, idx + 2 + this.slices, idx + this.slices + 1
                    );
                }
                this.normals.push(
                    cos, sin, 0,
                );
                this.initialTexCoords.push(
                    curSlice / this.slices,
                    curStack / this.stacks,
                )

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
        return new MyCylinder(this.scene, `${this.id}-${idx}`, this.radiusBot, this.radiusTop, this.h, this.slices, this.stacks);
    }
}