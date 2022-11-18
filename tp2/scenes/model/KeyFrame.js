export class KeyFrame {
    /**
     * Constructor for the KeyFrame class. It is used to represent a keyframe of an animation.
     * @constructor
     * @param {number} instant - Keyframe's instant
     * @param {vec3} translation - Keyframe's translation transformation
     * @param {Array} rotation - Keyframe's rotation transformation
     * @param {vec3} scale - Keyframe's scale transformation
     */
    constructor(instant, translation, rotations, scale) {
        this._instant = instant;
        this._translation = translation;
        this._rotations = rotations;
        this._scale = scale;
    }

    get instant() {
        return this._instant;
    }

    get translation() {
        return this._translation;
    }

    get rotations() {
        return this._rotations;
    }

    get scale() {
        return this._scale;
    }
}