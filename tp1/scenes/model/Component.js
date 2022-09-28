export class Component {
    /**
     * Constructor for the Component object.
     * @param {id}
     * @param {transformation} reference to this component's transformation. If declared inline,
     * the parser is responsible for creating the transformation object and adding it to the exiting ones
     * @param {materials}
     * @param {texture}
     * @param {children}
     */
    constructor(id, transformation, materials, texture, children) {
        this._id = id;
        this._transformation = transformation;
        this._materials = materials;
        this._texture = texture;
        this._children = children;
    }

    get id() {
        return this._id;
    }
    get transformation() {
        return this._transformation;
    }
    get materials() {
        return this._materials;
    }
    get texture() {
        return this._texture;
    }
    get children() {
        return this._children;
    }
}