export class Highlighted {
    constructor(red, green, blue, scale) {
        this._red = red;
        this._green = green;
        this._blue = blue;
        this._scale = scale;
    }

    get red() {
        return this._red;
    }

    get green() {
        return this._green;
    }

    get blue() {
        return this._blue;
    }

    get scale() {
        return this._scale;
    }
}