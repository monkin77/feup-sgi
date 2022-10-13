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

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

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
                this.texCoords.push(
                    curSlice / this.slices,
                    curStack / this.stacks,
                )

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

    /**
     * @method scaleTexCoords scales the texture coordinates taking into account the initial texCoords
     * @param {*} s 
     * @param {*} t 
     */
    scaleTexCoords(s, t) {
        return;
    }
}