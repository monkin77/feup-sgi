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
    constructor(xmlReader, componentsNode, transformations) {
        super();
        this._components = {};
        this._transformations = transformations;

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
        // handle materials

        let textureNode = componentNode.getElementsByTagName("texture");
        if (textureNode.length != 1)
            return `<texture> must be defined inside the component with id = ${componentId}`;
        textureNode = textureNode[0];
        // handle texture

        let childrenNode = componentNode.getElementsByTagName("children");
        if (childrenNode.length != 1)
            return `<children> must be defined inside the component with id = ${componentId}`;
        childrenNode = childrenNode[0];
        // handle children
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

            const transfId = xmlReader.getString(transfRefNode, "id", false);
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

    get components() {
        return this._components;
    }
}

const parserId = "Components Parser";