import { CGFtexture } from "../../../lib/CGF.js";
import { Parser } from "./Parser.js";
import { onXMLMinorError, parseColor } from "./utils.js";

export class TexturesParser extends Parser {
    /**
     * Constructor for the TexturesParser object.
     * @param {CGF xml Reader} xmlReader
     * @param {textures block element} texturesNode
     */
    constructor(scene, xmlReader, texturesNode) {
        super();
        this._scene = scene;
        this._textures = {};

        this.parse(xmlReader, texturesNode);
    }

    /**
     * Parses the <textures> block.
     * @param {CGF xml Reader} xmlReader
     * @param {textures block element} texturesNode
     */
    parse(xmlReader, texturesNode) {
        const children = texturesNode.children;

        let err;
        for (const child of children) {
            if (child.nodeName != "texture") {
                onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            if ((err = this.parseTexture(xmlReader, child)) != null) {
                this.addReport(parserId, err);
                return;
            }
        }

        if (Object.keys(this._textures).length == 0) {
            this.addReport(parserId, "There needs to be at least one texture");
            return;
        }

        return null;
    }

    /**
     *
     * @param {*} xmlReader
     * @param {} textureNode
     * @returns {null | string } null if successful, an error string otherwise
     */
    parseTexture = (xmlReader, textureNode) => {
        const textureId = xmlReader.getString(textureNode, "id", false);
        if (textureId == null) return "no 'id' defined for texture";
        if (textureId in this._textures)
            return `ID must be unique for each texture (conflict: ID = ${textureId})`;

        const filePath = xmlReader.getString(textureNode, "file", false);
        if (filePath == null)
            return `no 'file' defined for texture ${textureId}`;

        const texture = new CGFtexture(this._scene, filePath);
        this._textures[textureId] = texture;
        return null;
    };

    get textures() {
        return this._textures;
    }
}

const parserId = "Textures Parser";