import { CGFappearance } from "../../../lib/CGF.js";
import { Parser } from "./Parser.js";
import { onXMLMinorError, parseColor } from "./utils.js";

export class MaterialsParser extends Parser {
    /**
     * Constructor for the MaterialsParser object.
     * @param {CGF xml Reader} xmlReader
     * @param {materials block element} materialsNode
     */
    constructor(scene, xmlReader, materialsNode) {
        super();
        this._scene = scene;
        this._materials = {};

        this.parse(xmlReader, materialsNode);
    }

    /**
     * Parses the <materials> block.
     * @param {CGF xml Reader} xmlReader
     * @param {materials block element} materialsNode
     */
    parse(xmlReader, materialsNode) {
        const children = materialsNode.children;

        let err;
        for (const child of children) {
            if (child.nodeName != "material") {
                onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            if ((err = this.parseMaterial(xmlReader, child)) != null) {
                this.addReport(parserId, err);
                return;
            }
        }

        if (Object.keys(this._materials).length == 0) {
            this.addReport(parserId, "There needs to be at least one material");
            return;
        }

        return null;
    }

    /**
     *
     * @param {*} xmlReader
     * @param {} materialNode
     * @returns {null | string } null if successful, an error string otherwise
     */
    parseMaterial = (xmlReader, materialNode) => {
        const materialId = xmlReader.getString(materialNode, "id", false);
        if (materialId == null) return "no 'id' defined for material";
        if (materialId in this._materials)
            return `ID must be unique for each material (conflict: ID = ${materialId})`;

        const shininess = xmlReader.getFloat(materialNode, "shininess", false);
        if (shininess == null)
            return `no 'shininess' defined for material ${materialId}`;

        let emission = materialNode.getElementsByTagName("emission");
        if (emission.length != 1)
            return `no emission child defined for material id ${materialId}`;

        let ambient = materialNode.getElementsByTagName("ambient");
        if (ambient.length != 1)
            return `no ambient child defined for material id ${materialId}`;

        let diffuse = materialNode.getElementsByTagName("diffuse");
        if (diffuse.length != 1)
            return `no diffuse child defined for material id ${materialId}`;

        let specular = materialNode.getElementsByTagName("specular");
        if (specular.length != 1)
            return `no specular child defined for material id ${materialId}`;

        emission = emission[0];
        ambient = ambient[0];
        diffuse = diffuse[0];
        specular = specular[0];

        const emissionColor = parseColor(
            xmlReader,
            emission,
            `<emission> of material ${materialId}`
        );
        if (!Array.isArray(emissionColor)) return color;

        const ambientColor = parseColor(
            xmlReader,
            ambient,
            `<ambient> of material ${materialId}`
        );
        if (!Array.isArray(ambientColor)) return color;

        const diffuseColor = parseColor(
            xmlReader,
            diffuse,
            `<diffuse> of material ${materialId}`
        );
        if (!Array.isArray(diffuseColor)) return color;

        const specularColor = parseColor(
            xmlReader,
            specular,
            `<specular> of material ${materialId}`
        );
        if (!Array.isArray(specularColor)) return color;

        const appearance = new CGFappearance(this._scene);
        appearance.setShininess(shininess);
        appearance.setEmission(...emissionColor);
        appearance.setAmbient(...ambientColor);
        appearance.setDiffuse(...diffuseColor);
        appearance.setSpecular(...specularColor);

        this._materials[materialId] = appearance;

        return null;
    };

    get materials() {
        return this._materials;
    }
}

const parserId = "Materials Parser";