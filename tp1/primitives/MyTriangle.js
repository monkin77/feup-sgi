import { CGFobject } from '../../lib/CGF.js';
import { euclideanDistance } from '../utils/algebra.js';

/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - X component of the triangle's vertices
 * @param y - Y component of the triangle's vertices
 * @param z - Z component of the triangle's vertices
 */
export class MyTriangle extends CGFobject {
	constructor(scene, id, x1, x2, x3, y1, y2, y3, z1, z2, z3) {
		super(scene);
		this.x1 = x1; this.x2 = x2; this.x3 = x3;
        this.y1 = y1; this.y2 = y2; this.y3 = y3;
        this.z1 = z1; this.z2 = z2; this.z3 = z3;

		this.initBuffers();
	}

	initBuffers() {
		this.vertices = [
            this.x1, this.y1, this.z1,
            this.x2, this.y2, this.z2,
            this.x3, this.y3, this.z3
        ];

        this.indices = [
            0, 1, 2
        ];

        this.normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ];

        const a = euclideanDistance(this.x1, this.y1, this.z1, this.x2, this.y2, this.z2);
        const b = euclideanDistance(this.x2, this.y2, this.z2, this.x3, this.y3, this.z3);
        const c = euclideanDistance(this.x3, this.y3, this.z3, this.x1, this.y1, this.z1);
        const cos = (a ** 2 - b ** 2 + c ** 2) / (2 * a * c);
        const sin = Math.sqrt(1 - cos ** 2);
        this.texCoords = [
            0, 0,
            a, 0,
            c * cos, c * sin
        ];

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
