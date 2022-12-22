export default class MyTile {
    constructor(id, isWhite = true) {
        this._id = id;
        this._isWhite = isWhite;
    }

    get id() {
        return this._id;
    }

    get isWhite() {
        return this._isWhite;
    }
}