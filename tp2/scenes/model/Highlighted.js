export class Highlighted {
    constructor(red, green, blue, scale) {
        this._red = red;
        this._green = green;
        this._blue = blue;
        this._scale = scale;
        this._active = false;
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

    get active() {
        return this._active;
    }

    getColor() {
        return [this.red, this.green, this.blue, 1.0];
    }
}