import { Parser } from "./Parser.js";
import {
    onXMLMinorError,
    parseCoordinates3D,
    DEGREE_TO_RAD,
    axisToVec,
} from "./utils.js";

export class ComponentsParser extends Parser {
    /**
     * Constructor for the ComponentsParser object.
     * @param {CGF xml Reader} xmlReader
     * @param {components block element} componentsNode
     */
    constructor(xmlReader, componentsNode) {
        super();
        this._components = {};

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

        if (Object.keys(this._components).length == 0) {
            this.addReport(
                parserId,
                "There needs to be at least one component"
            );
            return;
        }

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
        // Handle transformation

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

    get components() {
        return this._components;
    }
}

const parserId = "Components Parser";