export class Component {
    /**
     * Constructor for the Component object.
     * @param {id}
     * @param {transformation} reference to this component's transformation. If declared inline,
     * the parser is responsible for creating the transformation object and adding it to the exiting ones
     * @param {materials}
     * @param {texture: Texture}
     * @param { { components: string[], primitives: string[] } }
     */
    constructor(id, transformation, materials, texture, children, animation) {
        this._id = id;
        this._transformation = transformation;
        this._materials = materials;
        this._texture = texture;
        this._primitives = children.primitives;
        this._components = children.components;
        this._currMaterial = 0;
        this._animation = animation;
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
    get primitives() {
        return this._primitives;
    }
    get components() {
        return this._components;
    }
    get currMaterial() {
        return this._currMaterial;
    }
    get animation() {
        return this._animation;
    }

    nextMaterial() {
        this._currMaterial = (this._currMaterial + 1) % this.materials.length;
    }

    hasTransformation = () => this._transformation != "";
}