export class Texture {
    constructor(id, length_s, length_t) {
        this._id = id;
        this._length_s = length_s;
        this._length_t = length_t;
    }

    get id() {
        return this._id;
    }

    get length_s() {
        return this._length_s;
    }

    get length_t() {
        return this._length_t;
    }

    needsScaling = () => {
        return this._length_s != 1 || this._length_t != 1;
    };

    inheritTex = () => {
        return this._id == "inherit";
    };

    removeTex = () => {
        return this._id == "none";
    };
}