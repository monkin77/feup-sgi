export class ViewsParser {
    /**
     * Constructor for the ViewsParser object.
     * @param {CGF xml Reader} xmlReader
     * @param {view block element} viewsNode
     */
    constructor(xmlReader, viewsNode) {
        this.parse(xmlReader, viewsNode);

        this.views = [];
    }

    /**
     * Parses the <views> block.
     * @param {CGF xml Reader} xmlReader
     * @param {view block element} viewsNode
     */
    parse(xmlReader, viewsNode) {
        // TODO: GET DEFAULT VIEW

        const children = viewsNode.children;

        this.ambient = [];
        this.background = [];

        let nodeNames = [];

        for (const child of children) {
            switch (child.nodeName) {
                case "perspective":
                    this.parsePerspective(xmlReader, child);
                    break;
                case "ortho":
                    this.parseOrtho(xmlReader, child);
                    break;
                default:
                    return `Invalid type of View: ${child.nodeName}. Valid types are: perspective and ortho`;
            }
        }

        /* var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color)) return color;
        else this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color)) return color;
        else this.background = color;

        this.log("Parsed ambient"); */

        return null;
    }

    parsePerspective = (xmlReader, perspectiveNode) => {
        const camId = xmlReader.getString(perspectiveNode, "id");
        if (camId == null) return "no 'id' defined for perspective";

        const near = xmlReader.getFloat(perspectiveNode, "near");
        if (near == null) return "no 'near' defined for perspective";

        const far = xmlReader.getFloat(perspectiveNode, "far");
        if (far == null) return "no 'far' defined for perspective";

        const angle = xmlReader.getInteger(perspectiveNode, "angle");
        if (angle == null) return "no 'angle' defined for perspective";

        const from = perspectiveNode.getElementsByTagName("from");
        const to = perspectiveNode.getElementsByTagName("to");

        console.log("from ->", from[0]);
        console.log("to -> ", to[0]);
    };
}