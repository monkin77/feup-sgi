export class Component {
    /**
     * Constructor for the Component object.
     * @param {id}
     * @param {transformation} reference. If declared inline, the parser is responsible for creating the 
     * transformation object and adding it to the existing ones
     * @param {materials}
     * @param {texture: Texture}
     * @param { { components: string[], primitives: string[] } }
     * @param {highlighted: Highlighted}
     */
    constructor(id, transformation, materials, texture, animation, children, highlighted = null) {
        this._id = id;
        this._transformation = transformation;
        this._materials = materials;
        this._texture = texture;
        this._animation = animation;
        this._primitives = children.primitives;
        this._components = children.components;
        this._currMaterial = 0;
        this._highlighted = highlighted;

        this._pickingId = -1;
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

    get highlighted() {
        return this._highlighted;
    }

    get pickingId() {
        return this._pickingId;
    }

    nextMaterial() {
        this._currMaterial = (this._currMaterial + 1) % this.materials.length;
    }

    hasTransformation = () => this._transformation != "";
    hasAnimation = () => !!this._animation;

    isHighlighted = () => this._highlighted != null && this._highlighted.active;

    isSelectable = () => this._pickingId != -1;

    resetPickId = () => this._pickingId = -1;

    setPickId = (pickId) => {
        this._pickingId = pickId
    };
}