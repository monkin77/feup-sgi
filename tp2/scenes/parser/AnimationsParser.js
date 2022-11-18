import { KeyFrame } from "../model/KeyFrame.js";
import { KeyFrameAnimation } from "../model/KeyFrameAnimation.js";
import { Parser } from "./Parser.js";
import { calculateTransformationMatrix, onXMLMinorError, parseCoordinates3D, parseRotation } from "./utils.js";

const parserId = "Animations Parser";

export class AnimationsParser extends Parser {
    /**
     * Constructor for the AnimationsParser class.
     * @param {CGF xml Reader} xmlReader
     * @param {animations block element} transformationsNode
     */
     constructor(xmlReader, transformationsNode, scene) {
        super();
        this._animations = {};
        this._scene = scene;

        this.parse(xmlReader, transformationsNode);
    }

    /**
     * Parses the <animations> block.
     * @param {CGF xml Reader} xmlReader
     * @param {animations block element} transformationsNode
     */
     parse(xmlReader, animationsNode) {
        const children = animationsNode.children;

        let err;
        for (const child of children) {
            if (child.nodeName != "keyframeanim") {
                onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            this.curInstance = null;
            if ((err = this.parseKeyFrameAnimation(xmlReader, child)) != null) {
                this.addReport(parserId, err);
                return;
            }
        }

        console.log("animations", this._animations);
    }

    /**
     * Parses a <keyframeanim> block.
     * @param {CGF xml Reader} xmlReader
     * @param {keyframeanim block element} node
     * @returns {null | string } null if successful, an error string otherwise
     */
    parseKeyFrameAnimation(xmlReader, node) {
        const id = xmlReader.getString(node, "id", false);
        if (id == null) return "no 'id' defined for keyframeanim";
        if (id in this._animations)
        return `ID must be unique for each keyframeanim (conflict: ID = ${id})`;

        let keyframes = [];
        for (const child of node.children) {
            if (child.nodeName != "keyframe") {
                onXMLMinorError(`unknown tag <${child.nodeName}> in animation with ID = ${id}`);
                continue;
            }

            const {keyframe, error} = this.parseKeyFrame(xmlReader, child, id);
            if (error != null) {
                this.addReport(parserId, error);
                return;
            }
            keyframes.push(keyframe);
        }

        if (!keyframes)
            return `The keyframeanim "${id}" must contain at least one valid keyframe`;

        this._animations[id] = new KeyFrameAnimation(this._scene, id, keyframes);

        return null;
    }

    /**
     * Parses a <keyframe> block.
     * @param {CGF xml Reader} xmlReader
     * @param {keyframe block element} node
     * @returns {{keyframes: KeyFrame[], error: null | string}} null if successful, an error string otherwise
     */
    parseKeyFrame(xmlReader, node, animId) {
        const instant = xmlReader.getFloat(node, "instant", false);
        if (instant == null) return `no 'instant' defined for keyframe in animation with ID = ${animId}`;
        if (instant < 0) return `the 'instant' attribute must be non-negative in animation with ID = ${animId}`;

        if (this.curInstance == null)
            this.curInstance = instant;
        else if (instant <= this.curInstance)
            return `the 'instant' attribute must be strictly increasing in animation with ID = ${animId}`;

        if (node.children.length != 5) {
            return {
                error: `Not all required transformations were found in the keyframe of instant = ${instant} in animation with ID = ${animId}`
            };
        }

        if (node.children[0].nodeName != "translation") {
            return {
                error: `The first transformation in the keyframe of instant = ${instant} in animation with ID = ${animId} must be a translation`
            };
        }
        const translationArr = parseCoordinates3D(xmlReader, node.children[0], `translation in keyframe of instant = ${instant} in animation with ID = ${animId}`);
        if (!Array.isArray(translationArr)) return { error: translationArr };
        const translationVec = vec3.fromValues(...translationArr);

        if (node.children[1].nodeName != "rotation") {
            return {
                error: `The second transformation in the keyframe of instant = ${instant} in animation with ID = ${animId} must be a rotation in Z axis`
            };
        }
        const rotationZ = parseRotation(xmlReader, node.children[1], `rotation (Z axis) in keyframe of instant = ${instant} in animation with ID = ${animId}`);

        if (node.children[2].nodeName != "rotation") {
            return {
                error: `The third transformation in the keyframe of instant = ${instant} in animation with ID = ${animId} must be a rotation in Y axis`
            };
        }
        const rotationY = parseRotation(xmlReader, node.children[2], `rotation (Y axis) in keyframe of instant = ${instant} in animation with ID = ${animId}`);

        if (node.children[3].nodeName != "rotation") {
            return {
                error: `The fourth transformation in the keyframe of instant = ${instant} in animation with ID = ${animId} must be a rotation in X axis`
            };
        }
        const rotationX = parseRotation(xmlReader, node.children[3], `rotation (X axis) in keyframe of instant = ${instant} in animation with ID = ${animId}`);

        if (node.children[4].nodeName != "scale") {
            return {
                error: `The fifth transformation in the keyframe of instant = ${instant} in animation with ID = ${animId} must be a scale`
            };
        }
        const scaleArr = parseCoordinates3D(xmlReader, node.children[4], `scale in keyframe of instant = ${instant} in animation with ID = ${animId}`);
        if (!Array.isArray(scaleArr)) return { error: scaleArr };
        const scaleVec = vec3.fromValues(...scaleArr)

        return {
            keyframe: new KeyFrame(instant, translationVec, [rotationZ, rotationY, rotationX], scaleVec),
            error: null
        };
    }

    get animations() {
        return this._animations;
    }
}