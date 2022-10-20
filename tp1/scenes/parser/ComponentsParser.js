import { Component } from "../model/Component.js";
import { Texture } from "../model/Texture.js";
import { Parser } from "./Parser.js";
import {
    onXMLMinorError,
    calculateTransformationMatrix,
    buildComponentTransfID,
} from "./utils.js";

export class ComponentsParser extends Parser {
    /**
     * Constructor for the ComponentsParser object.
     * @param {CGF xml Reader} xmlReader
     * @param {components block element} componentsNode
     */
    constructor(
        xmlReader,
        componentsNode,
        transformations,
        materials,
        textures,
        primitives
    ) {
        super();
        this._components = {};
        this._transformations = transformations;
        this._materials = materials;
        this._textures = textures;
        this._primitives = primitives;

        this.parse(xmlReader, componentsNode);
    }

    /**
     * Parses the <components> block.
     * @param {CGF xml Reader} xmlReader
     * @param {components block element} componentsNode
     */
    parse(xmlReader, componentsNode) {
        const children = componentsNode.children;

        let err;
        for (const child of children) {
            if (child.nodeName != "component") {
                onXMLMinorError(
                    "unknown tag <" +
                    children[i].nodeName +
                    "> inside <components>"
                );
                continue;
            }

            if ((err = this.parseComponent(xmlReader, child)) != null) {
                this.addReport(parserId, err);
                return;
            }
        }

        /* if (Object.keys(this._components).length == 0) {
            this.addReport(
                parserId,
                "There needs to be at least one component"
            );
            return;
        } */

        return null;
    }

    /**
     *
     * @param {*} xmlReader
     * @param {} componentNode
     * @returns {null | string } null if successful, an error string otherwise
     */
    parseComponent = (xmlReader, componentNode) => {
        const componentId = xmlReader.getString(componentNode, "id", false);
        if (componentId == null) return "no 'id' defined for component";
        if (componentId in this._components)
            return `ID must be unique for each component (conflict: ID = ${componentId})`;

        let transformationNode =
            componentNode.getElementsByTagName("transformation");
        if (transformationNode.length != 1)
            return `<transformation> must be defined inside the component with id = ${componentId}`;
        transformationNode = transformationNode[0];
        const { error: transfErr, value: transfID } = this.handleTransformation(
            xmlReader,
            transformationNode,
            componentId
        );
        if (transfErr) return transfErr;

        let materialsNode = componentNode.getElementsByTagName("materials");
        if (materialsNode.length != 1)
            return `<materials> must be defined inside the component with id = ${componentId}`;
        materialsNode = materialsNode[0];
        const { error: materialsErr, value: materialsList } =
        this.handleMaterials(xmlReader, materialsNode, componentId);
        if (materialsErr) return materialsErr;

        let textureNode = componentNode.getElementsByTagName("texture");
        if (textureNode.length != 1)
            return `<texture> must be defined inside the component with id = ${componentId}`;
        textureNode = textureNode[0];
        const { error: textureErr, value: textureValue } = this.handleTexture(
            xmlReader,
            textureNode,
            componentId
        );
        if (textureErr) return textureErr;
        const texture = new Texture(
            textureValue.id,
            textureValue.lengthS,
            textureValue.lengthT
        );

        let childrenNode = componentNode.getElementsByTagName("children");
        if (childrenNode.length != 1)
            return `<children> must be defined inside the component with id = ${componentId}`;
        childrenNode = childrenNode[0];
        const { error: childrenErr, value: childrenValue } =
        this.handleChildren(xmlReader, childrenNode, componentId);
        if (childrenErr) return childrenErr;

        this._components[componentId] = new Component(
            componentId,
            transfID,
            materialsList,
            texture,
            childrenValue
        );

        return null;
    };

    /**
     *
     * @param {*} xmlReader
     * @param {*} transformationNode
     * @param {string} componentId
     * @return {{value: string} | {error: string}} {value: <transformationID | "">} if successful, {error: <error string>} otherwise.
     *  If the component does not contain transformations, an empty string will be returned in the value property
     */
    handleTransformation = (xmlReader, transformationNode, componentId) => {
        const children = transformationNode.children;

        // Handle <tranformationref> case
        let transfRefNode =
            transformationNode.getElementsByTagName("transformationref");
        if (transfRefNode.length > 1) {
            return {
                error: `There can only be one <transformationref> inside <transformation>`,
            };
        } else if (transfRefNode.length == 1) {
            if (children.length > 1)
                return {
                    error: `<tranformationref> cannot be coupled with other transformations in component with ID = ${componentId}`,
                };

            const transfId = xmlReader.getString(transfRefNode[0], "id", false);
            if (transfId == null)
                return { error: "no 'id' defined for <transformationref>" };
            if (!(transfId in this._transformations))
                return {
                    error: `{<transformationref> contains an invalid id (ID = ${transfId})}`,
                };

            return { value: transfId };
        }

        const {
            matrix: transfMatrix,
            counter: transfCounter,
            error,
        } = calculateTransformationMatrix(
            xmlReader,
            transformationNode,
            componentId
        );
        if (error != null) return { error: error };
        if (transfCounter == 0) return { value: "" };

        // Add the inline matrix to the existing object of transformations and return the id of the new matrix
        const componentTransfId = buildComponentTransfID(componentId);
        this._transformations[componentTransfId] = transfMatrix;

        return { value: componentTransfId };
    };

    /**
     *
     * @param {*} xmlReader
     * @param {*} materialsNode
     * @param {*} componentId
     * @returns {{value: string[]} | {error: string}} {value: <materialIDs>} if successful, {error: <error string>} otherwise.
     */
    handleMaterials = (xmlReader, materialsNode, componentId) => {
        const children = materialsNode.children;

        let materials = [];
        for (const child of children) {
            if (child.nodeName != "material") {
                onXMLMinorError(
                    `Unknown tag <${child.nodeName}> inside <materials> of component with ID = ${componentId}`
                );
                continue;
            }

            const materialId = xmlReader.getString(child, "id", false);
            if (materialId == null)
                return {
                    error: `no 'id' defined for <material> inside <materials> of component with ID = ${componentId}`,
                };
            if (!(materialId in this._materials) && materialId != "inherit")
                return {
                    error: `<material> contains an invalid id (ID = ${materialId}) inside <materials> of component with ID = ${componentId}`,
                };

            materials.push(materialId);
        }
        if (materials.length == 0)
            return {
                error: `There must be at least one material defined inside <materials> of component with ID = ${componentId}`,
            };

        return { value: materials };
    };

    /**
     *
     * @param {*} xmlReader
     * @param {*} textureNode
     * @param {*} componentId
     * @returns { {value: {textureId: string, lengthS: number, lengthT: number}} | {error: string} } {value: {<textureId, lengthS, lengthT>}} if successful, {error: <error string>} otherwise.
     */
    handleTexture = (xmlReader, textureNode, componentId) => {
        const textureId = xmlReader.getString(textureNode, "id", false);
        if (textureId == null)
            return {
                error: `no 'id' defined for <texture> inside <components> of component with ID = ${componentId}`,
            };
        const isCustomTexture = textureId != "inherit" && textureId != "none";
        if (!(textureId in this._textures) && isCustomTexture)
            return {
                error: `<texture> contains an invalid id (ID = ${textureId}) inside <components> of component with ID = ${componentId}`,
            };

        let lengthS = xmlReader.getFloat(textureNode, "length_s", false);
        let lengthT = xmlReader.getFloat(textureNode, "length_t", false);

        if (!isCustomTexture && (lengthS != null || lengthT != null)) {
            return {
                error: `length_s and length_t must not be defined if the texture is inherit or none. Component ID = ${componentId}`,
            };
        }

        if (!lengthS) lengthS = 1;
        if (!lengthT) lengthT = 1;

        return { value: { id: textureId, lengthS, lengthT } };
    };

    /**
     *
     * @param {*} xmlReader
     * @param {*} childrenNode
     * @param {*} componentId
     * @returns {{value: {components: string[], primitives: string[]}} | {error: string}} {value: {<components, primitives>}} if successful, {error: <error string>} otherwise.
     */
    handleChildren = (xmlReader, childrenNode, componentId) => {
        const children = childrenNode.children;

        const components = [];
        const primitives = [];
        for (const child of children) {
            switch (child.nodeName) {
                case "componentref":
                    const childComponentId = xmlReader.getString(
                        child,
                        "id",
                        false
                    );
                    if (childComponentId == null)
                        return {
                            error: `no 'id' defined for <componentref> inside <children> of component with ID = ${componentId}`,
                        };
                    if (!(childComponentId in this._components))
                        return {
                            error: `<componentref> contains an invalid id (ID = ${childComponentId}) inside <children> of component with ID = ${componentId}`,
                        };

                    components.push(childComponentId);
                    // TO DO: Should this be done?
                    // this._components[childComponentId].parent = componentId;
                    break;
                case "primitiveref":
                    const primitiveId = xmlReader.getString(child, "id", false);
                    if (primitiveId == null)
                        return {
                            error: `no 'id' defined for <primitiveref> inside <children> of component with ID = ${componentId}`,
                        };
                    if (!(primitiveId in this._primitives))
                        return {
                            error: `<primitiveref> contains an invalid id (ID = ${primitiveId}) inside <children> of component with ID = ${componentId}`,
                        };
                    primitives.push(primitiveId);
                    break;
                default:
                    onXMLMinorError(
                        `Unknown tag <${child.nodeName}> inside <children> of component with ID = ${componentId}`
                    );
            }
        }

        if (components.length == 0 && primitives.length == 0)
            return {
                error: `There must be at least one child defined inside <children> of component with ID = ${componentId}`,
            };

        return { value: { components, primitives } };
    };

    get components() {
        return this._components;
    }
}

const parserId = "Components Parser";