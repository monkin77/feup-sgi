export default class PickingInfo {
    constructor(pickingId, object) {
        this._id = pickingId;
        this._object = object;
    }

    get id() {
        return this._id;
    }

    get object() {
        return this._object;
    }
}