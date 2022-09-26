import { CGFcamera, CGFcameraOrtho } from "../../../lib/CGF.js";
import { Parser } from "./Parser.js";
import { DEGREE_TO_RAD, onXMLMinorError, parseCoordinates3D } from "./utils.js";

/**
 * TODO: Extract common code of the Parsers to a parent parser class
 */
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

        let transfMatrix = mat4.create();

        let coordinates;
        let transfCounter = 0;
        for (const child of transformationNode.children) {
            switch (child.nodeName) {
                case "translate":
                    coordinates = parseCoordinates3D(
                        xmlReader,
                        child,
                        `translate transformation with ID = ${transfId}`
                    );
                    if (!Array.isArray(coordinates)) return coordinates;

                    transfMatrix = mat4.translate(
                        transfMatrix,
                        transfMatrix,
                        coordinates
                    );
                    transfCounter++;
                    break;
                case "rotate":
                    const axis = xmlReader.getString(child, "axis", false);
                    if (axis == null)
                        return `no 'axis' defined for rotation in transformation ${transfId}`;

                    const angle = xmlReader.getFloat(child, "angle", false);
                    if (angle == null)
                        return `no 'angle' defined for rotation in transformation ${transfId}`;

                    // TO DO: CHECK IF NEEDS TO EQUAL TO RETURN VALUE (1st arg should be out)
                    transfMatrix = mat4.rotate(
                        transfMatrix,
                        transfMatrix,
                        angle,
                        axis
                    );
                    transfCounter++;
                    break;
                case "scale":
                    coordinates = parseCoordinates3D(
                        xmlReader,
                        child,
                        `scale transformation with ID = ${transfId}`
                    );
                    if (!Array.isArray(coordinates)) return coordinates;

                    transfMatrix = mat4.scale(
                        transfMatrix,
                        transfMatrix,
                        coordinates
                    );
                    transfCounter++;
                    break;
                default:
                    onXMLMinorError(
                        `unknown transformation <${child.nodeName}>. Ignoring...`
                    );
            }
        }

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