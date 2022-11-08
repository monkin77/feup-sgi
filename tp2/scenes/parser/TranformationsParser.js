import { Parser } from "./Parser.js";
import {
    onXMLMinorError,
    parseCoordinates3D,
    DEGREE_TO_RAD,
    axisToVec,
    calculateTransformationMatrix,
} from "./utils.js";

export class TransformationsParser extends Parser {
    /**
     * Constructor for the TransformationsParser object.
     * @param {CGF xml Reader} xmlReader
     * @param {transformations block element} transformationsNode
     */
    constructor(xmlReader, transformationsNode) {
        super();
        this._transformations = {};

        this.parse(xmlReader, transformationsNode);
    }

    /**
     * Parses the <transformations> block.
     * @param {CGF xml Reader} xmlReader
     * @param {transformations block element} transformationsNode
     */
    parse(xmlReader, transformationsNode) {
        const children = transformationsNode.children;

        let err;
        for (const child of children) {
            if (child.nodeName != "transformation") {
                onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            if ((err = this.parseTransformation(xmlReader, child)) != null) {
                this.addReport(parserId, err);
                return;
            }
        }

        if (Object.keys(this._transformations).length == 0) {
            this.addReport(
                parserId,
                "There needs to be at least one transformation"
            );
            return;
        }

        return null;
    }

    /**
     *
     * @param {*} xmlReader
     * @param {} transformationNode
     * @returns {null | string } null if successful, an error string otherwise
     */
    parseTransformation = (xmlReader, transformationNode) => {
        const transfId = xmlReader.getString(transformationNode, "id", false);
        if (transfId == null) return "no 'id' defined for transformation";
        if (transfId in this._transformations)
            return `ID must be unique for each transformation (conflict: ID = ${transfId})`;

        const {
            matrix: transfMatrix,
            counter: transfCounter,
            error,
        } = calculateTransformationMatrix(
            xmlReader,
            transformationNode,
            transfId
        );
        if (error != null) return error;

        if (transfCounter == 0)
            return `The transformation "${transfId}" must contain at least one valid transformation`;

        this._transformations[transfId] = transfMatrix;

        return null;
    };

    get transformations() {
        return this._transformations;
    }
}

const parserId = "Transformations Parser";