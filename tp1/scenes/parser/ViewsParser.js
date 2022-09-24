import { CGFcamera, CGFcameraOrtho } from "../../../lib/CGF.js";
import { DEGREE_TO_RAD, onXMLMinorError, parseCoordinates3D } from "./utils.js";

/**
 * TODO: Add cameras to the scene in the onGraphLoaded method of XMLScene
 * TODO: Extract common code of the Parsers to a parent parser class
 */
export class ViewsParser {
    /**
     * Constructor for the ViewsParser object.
     * @param {CGF xml Reader} xmlReader
     * @param {view block element} viewsNode
     */
    constructor(xmlReader, viewsNode) {
        this.views = {};
        this.reports = []; // Keeps track of parsing errors  TODO: USE THIS

        this.parse(xmlReader, viewsNode);
    }

    /**
     * Parses the <views> block.
     * @param {CGF xml Reader} xmlReader
     * @param {view block element} viewsNode
     */
    parse(xmlReader, viewsNode) {
        this.defaultViewId = xmlReader.getString(viewsNode, "default");
        if (this.defaultViewId == null) {
            this.addReport("<views> block is missing the 'default' property");
            return;
        }

        const children = viewsNode.children;

        this.ambient = [];
        this.background = [];

        let err;
        for (const child of children) {
            switch (child.nodeName) {
                case "perspective":
                    if (
                        (err = this.parsePerspective(xmlReader, child)) != null
                    ) {
                        this.addReport(err);
                        return;
                    }
                    break;
                case "ortho":
                    if ((err = this.parseOrtho(xmlReader, child)) != null) {
                        this.addReport(err);
                        return;
                    }
                    break;
                default:
                    onXMLMinorError(
                        `Invalid type of View: ${child.nodeName}. Valid types are: perspective and ortho. Ignoring...`
                    );
            }
        }

        if (Object.keys(this.views).length == 0) {
            this.addReport(
                "There needs to be at least one view (perspective or ortho)"
            );
            return;
        }

        return null;
    }

    /**
     *
     * @param {*} xmlReader
     * @param {*} perspectiveNode
     * @returns {null | string } null if successful, an error string otherwise
     */
    parsePerspective = (xmlReader, perspectiveNode) => {
        const camId = xmlReader.getString(perspectiveNode, "id");
        if (camId == null) return "no 'id' defined for perspective";

        const near = xmlReader.getFloat(perspectiveNode, "near");
        if (near == null) return "no 'near' defined for perspective";

        const far = xmlReader.getFloat(perspectiveNode, "far");
        if (far == null) return "no 'far' defined for perspective";

        const angle = xmlReader.getFloat(perspectiveNode, "angle");
        if (angle == null) return "no 'angle' defined for perspective";

        let from = perspectiveNode.getElementsByTagName("from");
        let to = perspectiveNode.getElementsByTagName("to");

        if (from.length != 1) return "no 'from' child defined for perspective";
        if (to.length != 1) return "no 'to' child defined for perspective";

        from = from[0];
        to = to[0];

        const fromCoords = parseCoordinates3D(
            xmlReader,
            from,
            `'from' child of the Perspective with id: ${camId}`
        );
        if (!Array.isArray(fromCoords)) return fromCoords;

        const toCoords = parseCoordinates3D(
            xmlReader,
            to,
            `'to' child of the Perspective with id: ${camId}`
        );
        if (!Array.isArray(toCoords)) return toCoords;

        this.views[camId] = new CGFcamera(
            angle * DEGREE_TO_RAD,
            near,
            far,
            fromCoords,
            toCoords
        );

        return null;
    };

    /**
     *
     * @param {*} xmlReader
     * @param {*} orthoNode
     * @returns {null | string } null if successful, an error string otherwise
     */
    parseOrtho = (xmlReader, orthoNode) => {
        const camId = xmlReader.getString(orthoNode, "id");
        if (camId == null) return "no 'id' defined for ortho";

        const near = xmlReader.getFloat(orthoNode, "near");
        if (near == null) return "no 'near' defined for ortho";

        const far = xmlReader.getFloat(orthoNode, "far");
        if (far == null) return "no 'far' defined for ortho";

        const left = xmlReader.getFloat(orthoNode, "left");
        if (left == null) return "no 'left' defined for ortho";

        const right = xmlReader.getFloat(orthoNode, "right");
        if (right == null) return "no 'right' defined for ortho";

        const top = xmlReader.getFloat(orthoNode, "top");
        if (top == null) return "no 'top' defined for ortho";

        const bottom = xmlReader.getFloat(orthoNode, "bottom");
        if (bottom == null) return "no 'bottom' defined for ortho";

        let from = orthoNode.getElementsByTagName("from");
        let to = orthoNode.getElementsByTagName("to");
        let up = orthoNode.getElementsByTagName("up");

        if (from.length != 1) return "no 'from' child defined for ortho";
        if (to.length != 1) return "no 'to' child defined for ortho";

        from = from[0];
        to = to[0];

        const fromCoords = parseCoordinates3D(
            xmlReader,
            from,
            `'from' child of the ortho with id: ${camId}`
        );
        if (!Array.isArray(fromCoords)) return fromCoords;

        const toCoords = parseCoordinates3D(
            xmlReader,
            to,
            `'to' child of the ortho with id: ${camId}`
        );
        if (!Array.isArray(toCoords)) return toCoords;

        const upCoords =
            up.length != 1 ?
            defaultOrthoUp :
            parseCoordinates3D(
                xmlReader,
                up,
                `'up' child of the ortho with id: ${camId}`
            );

        this.views[camId] = new CGFcameraOrtho(
            left,
            right,
            bottom,
            top,
            near,
            far,
            fromCoords,
            toCoords,
            upCoords
        );
        return null;
    };

    addReport = (text) => {
        this.reports.push(`[${parserId}] ${text}`);
    };

    /**
     *
     * @returns true if the parser has reports, false otherwise
     */
    hasReports = () => this.reports.length > 0;
}

const defaultOrthoUp = [0, 1, 0];
const parserId = "Views Parser";