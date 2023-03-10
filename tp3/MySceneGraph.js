import { CGFXMLreader } from "../lib/CGF.js";
import { MyRectangle } from "./primitives/MyRectangle.js";
import { MyCylinder } from "./primitives/MyCylinder.js";
import { MyTriangle } from "./primitives/MyTriangle.js";
import { MySphere } from "./primitives/MySphere.js";
import { MyTorus } from "./primitives/MyTorus.js";
import { MyPatch } from "./primitives/MyPatch.js";
import { ComponentsParser } from "./scenes/parser/ComponentsParser.js";
import { TransformationsParser } from "./scenes/parser/TranformationsParser.js";
import { ViewsParser } from "./scenes/parser/ViewsParser.js";
import {
    invalidNumber,
    log,
    onXMLMinorError,
    parseColor,
    parseCoordinates3D,
    parseCoordinates4D,
} from "./scenes/parser/utils.js";
import { MaterialsParser } from "./scenes/parser/MaterialsParser.js";
import { Component } from "./scenes/model/Component.js";
import { TexturesParser } from "./scenes/parser/TexturesParser.js";
import { AnimationsParser } from "./scenes/parser/AnimationsParser.js";
import PickingInfo from "./scenes/model/PickingInfo.js";
import { BoardParser } from "./scenes/parser/BoardParser.js";
import { buildObjPath, CGFOBJModel } from "./primitives/3dModels/CGFOBJModel.js";

// Order of the groups in the XML document.
const SCENE_INDEX = 0;
const VIEWS_INDEX = 1;
const AMBIENT_INDEX = 2;
const LIGHTS_INDEX = 3;
const TEXTURES_INDEX = 4;
const MATERIALS_INDEX = 5;
const TRANSFORMATIONS_INDEX = 6;
const PRIMITIVES_INDEX = 7;
const ANIMATIONS_INDEX = 8;
const COMPONENTS_INDEX = 9;
const BOARD_INDEX = 10;

/**
 * MySceneGraph class, representing the scene graph.
 */
export class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        // Data Structures
        this.nodes = [];
        this.primitives = [];

        this.idRoot = null; // The id of the root element.

        this.axisCoords = [];
        this.axisCoords["x"] = [1, 0, 0];
        this.axisCoords["y"] = [0, 1, 0];
        this.axisCoords["z"] = [0, 0, 1];

        // File reading
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open("scenes/" + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "sxs") return "root tag <sxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null) return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null) return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null) return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null) return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <animations>
        if ((index = nodeNames.indexOf("animations")) == -1)
            return "tag <animations> missing";
        else {
            if (index != ANIMATIONS_INDEX)
                onXMLMinorError("tag <animations> out of order");

            //Parse animations block
            if ((error = this.parseAnimations(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }

        // <board>
        if ((index = nodeNames.indexOf("board")) == -1)
            return "tag <board> missing";
        else {
            if (index != BOARD_INDEX)
                onXMLMinorError("tag <board> out of order");

            //Parse components block
            if ((error = this.parseBoard(nodes[index])) != null)
                return error;
        }


        log("all parsed");
    }

    /**
     * Parses the <scene> block.
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {
        // Get root of the scene.
        var root = this.reader.getString(sceneNode, "root", false);
        if (root == null) return "no root defined for scene";

        this.idRoot = root;

        // Get axis length
        var axis_length = this.reader.getFloat(sceneNode, "axis_length", false);
        if (axis_length == null)
            onXMLMinorError(
                "no axis_length defined for scene; assuming 'length = 1'"
            );

        this.referenceLength = axis_length || 1;

        log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     * @returns null upon success, or an error message upon failure
     */
    parseView(viewsNode) {
        this.viewsParser = new ViewsParser(this.reader, viewsNode);
        if (this.viewsParser.hasReports()) return this.viewsParser.reports[0];

        log("Parsed Views");
        return null;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseAmbient(ambientsNode) {
        var children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = parseColor(this.reader, children[ambientIndex], "ambient");
        if (!Array.isArray(color)) return color;
        else this.ambient = color;

        color = parseColor(
            this.reader,
            children[backgroundIndex],
            "background"
        );
        if (!Array.isArray(color)) return color;
        else this.background = color;

        log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        let children = lightsNode.children;

        this.lights = {};
        let numLights = 0;

        let grandChildren = [];
        let nodeNames = [];

        // Any number of lights.
        for (let i = 0; i < children.length; i++) {
            if (numLights >= 7) {
                onXMLMinorError(
                    "too many lights defined; WebGL imposes a limit of 8 lights and 1 is already reserved. Only the first 7 lights will be used"
                );
                break; // Ignore additional lights if more than 7
            }

            // Storing light information [sceneIdx, enabled, type, location, ambient, diffuse, specular, attenuation, angle, exponent, target]
            // Note that the last 3 elements are only defined for spotlights, while the 4th last is optional
            let global = [numLights];

            let attributeNames = [];
            let attributeTypes = [];

            //Check type of light
            if (
                children[i].nodeName != "omni" &&
                children[i].nodeName != "spot"
            ) {
                onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            } else {
                attributeNames.push(
                    ...[
                        "location",
                        "ambient",
                        "diffuse",
                        "specular",
                        "attenuation",
                    ]
                );
                attributeTypes.push(
                    ...["position", "color", "color", "color", "attenuation"]
                );
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], "id", false);
            if (lightId == null) return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return (
                    "ID must be unique for each light (conflict: ID = " +
                    lightId +
                    ")"
                );

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], "enabled", false);
            if (aux == null) {
                onXMLMinorError(
                    "unable to parse value component of the 'enable light' field for ID = " +
                    lightId +
                    "; assuming 'value = 1'"
                );
                aux = true;
            }

            enableLight = aux;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        var aux = parseCoordinates4D(
                            this.reader,
                            grandChildren[attributeIndex],
                            "light position for ID" + lightId
                        );
                    else if (attributeTypes[j] == "attenuation") {
                        const attenuationNode = grandChildren[attributeIndex];
                        const constantAtten = this.reader.getFloat(
                            attenuationNode,
                            "constant",
                            false
                        );
                        const linearAtten = this.reader.getFloat(
                            attenuationNode,
                            "linear",
                            false
                        );
                        const quadraticAtten = this.reader.getFloat(
                            attenuationNode,
                            "quadratic",
                            false
                        );
                        if (
                            constantAtten == null ||
                            linearAtten == null ||
                            quadraticAtten == null
                        ) {
                            return (
                                "unable to parse attenuation values for ID = " +
                                lightId
                            );
                        }

                        // Verify that only 1 of the properties = 1
                        let attenCounter = 0;
                        if (constantAtten == 1) attenCounter++;
                        if (linearAtten == 1) attenCounter++;
                        if (quadraticAtten == 1) attenCounter++;
                        if (attenCounter != 1)
                            return `Only one of the attenuation values can be 1 for ID = ${lightId}`;

                        aux = [constantAtten, linearAtten, quadraticAtten];
                    } else
                        var aux = parseColor(
                            this.reader,
                            grandChildren[attributeIndex],
                            attributeNames[j] + " illumination for ID" + lightId
                        );

                    if (!Array.isArray(aux)) return aux;

                    global.push(aux);
                } else if (attributeNames[j] == "attenuation") {
                    onXMLMinorError(
                        `Attenuation attribute missing in Light: ${lightId}. Assuming Constant Attenuation`
                    );
                    // Adding constant attenuation to the array
                    global.push([1, 0, 0]);
                } else {
                    return (
                        "light " +
                        attributeNames[j] +
                        " undefined for ID = " +
                        lightId
                    );
                }
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], "angle", false);
                if (invalidNumber(angle))
                    return (
                        "unable to parse angle of the light for ID = " + lightId
                    );

                var exponent = this.reader.getFloat(
                    children[i],
                    "exponent",
                    false
                );
                if (invalidNumber(exponent))
                    return (
                        "unable to parse exponent of the light for ID = " +
                        lightId
                    );

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = parseCoordinates3D(
                        this.reader,
                        grandChildren[targetIndex],
                        "target light for ID " + lightId
                    );
                    if (!Array.isArray(aux)) return aux;

                    targetLight = aux;
                } else return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight]);
            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0) return "at least one light must be defined";

        log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block.
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        this.texturesParser = new TexturesParser(
            this.scene,
            this.reader,
            texturesNode
        );
        if (this.texturesParser.hasReports())
            return this.texturesParser.reports[0];

        log("Parsed Textures");
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        this.materialsParser = new MaterialsParser(
            this.scene,
            this.reader,
            materialsNode
        );
        if (this.materialsParser.hasReports())
            return this.materialsParser.reports[0];

        log("Parsed Materials");
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        this.transformationsParser = new TransformationsParser(
            this.reader,
            transformationsNode
        );
        if (this.transformationsParser.hasReports())
            return this.transformationsParser.reports[0];

        log("Parsed transformations");
        return null;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName != "primitive") {
                onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], "id", false);
            if (primitiveId == null) return "no ID defined for primitive";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return (
                    "ID must be unique for each primitive (conflict: ID = " +
                    primitiveId +
                    ")"
                );

            grandChildren = children[i].children;

            // Validate the primitive type
            if (
                grandChildren.length != 1 ||
                ![
                    "rectangle",
                    "triangle",
                    "cylinder",
                    "sphere",
                    "torus",
                    "patch",
                    "objfile"
                ].includes(grandChildren[0].nodeName)
            ) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere, torus or patch)";
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == "rectangle") {
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], "x1", false);
                if (invalidNumber(x1))
                    return (
                        "unable to parse x1 of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], "y1", false);
                if (invalidNumber(y1))
                    return (
                        "unable to parse y1 of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], "x2", false);
                if (!(x2 != null && !isNaN(x2) && x2 > x1))
                    return (
                        "unable to parse x2 of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], "y2", false);
                if (!(y2 != null && !isNaN(y2) && y2 > y1))
                    return (
                        "unable to parse y2 of the primitive coordinates for ID = " +
                        primitiveId
                    );

                var rect = new MyRectangle(
                    this.scene,
                    primitiveId,
                    x1,
                    x2,
                    y1,
                    y2
                );

                this.primitives[primitiveId] = rect;
            } else if (primitiveType == "cylinder") {
                // base
                var base = this.reader.getFloat(
                    grandChildren[0],
                    "base",
                    false
                );
                if (invalidNumber(base))
                    return (
                        "unable to parse base of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // top
                var top = this.reader.getFloat(grandChildren[0], "top", false);
                if (invalidNumber(top))
                    return (
                        "unable to parse top of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // height
                var height = this.reader.getFloat(
                    grandChildren[0],
                    "height",
                    false
                );
                if (invalidNumber(height))
                    return (
                        "unable to parse height of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // slices
                var slices = this.reader.getInteger(
                    grandChildren[0],
                    "slices",
                    false
                );
                if (invalidNumber(slices))
                    return (
                        "unable to parse slices of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // stacks
                var stacks = this.reader.getInteger(
                    grandChildren[0],
                    "stacks",
                    false
                );
                if (invalidNumber(stacks))
                    return (
                        "unable to parse stacks of the primitive coordinates for ID = " +
                        primitiveId
                    );

                var cyl = new MyCylinder(
                    this.scene,
                    primitiveId,
                    base,
                    top,
                    height,
                    slices,
                    stacks
                );

                this.primitives[primitiveId] = cyl;
            } else if (primitiveType == "triangle") {
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], "x1", false);
                if (invalidNumber(x1))
                    return (
                        "unable to parse x1 of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], "y1", false);
                if (invalidNumber(y1))
                    return (
                        "unable to parse y1 of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // z1
                var z1 = this.reader.getFloat(grandChildren[0], "z1", false);
                if (invalidNumber(z1))
                    return (
                        "unable to parse z1 of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], "x2", false);
                if (invalidNumber(x2))
                    return (
                        "unable to parse x2 of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], "y2", false);
                if (invalidNumber(y2))
                    return (
                        "unable to parse y2 of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // z2
                var z2 = this.reader.getFloat(grandChildren[0], "z2", false);
                if (invalidNumber(z2))
                    return (
                        "unable to parse z2 of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // x3
                var x3 = this.reader.getFloat(grandChildren[0], "x3", false);
                if (invalidNumber(x3))
                    return (
                        "unable to parse x3 of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // y3
                var y3 = this.reader.getFloat(grandChildren[0], "y3", false);
                if (invalidNumber(y3))
                    return (
                        "unable to parse y3 of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // z3
                var z3 = this.reader.getFloat(grandChildren[0], "z3", false);
                if (invalidNumber(z3))
                    return (
                        "unable to parse z3 of the primitive coordinates for ID = " +
                        primitiveId
                    );

                var tri = new MyTriangle(
                    this.scene,
                    primitiveId,
                    x1,
                    x2,
                    x3,
                    y1,
                    y2,
                    y3,
                    z1,
                    z2,
                    z3
                );

                this.primitives[primitiveId] = tri;
            } else if (primitiveType == "sphere") {
                // radius
                var radius = this.reader.getFloat(
                    grandChildren[0],
                    "radius",
                    false
                );
                if (invalidNumber(radius))
                    return (
                        "unable to parse radius of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // slices
                var slices = this.reader.getInteger(
                    grandChildren[0],
                    "slices",
                    false
                );
                if (invalidNumber(slices))
                    return (
                        "unable to parse slices of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // stacks
                var stacks = this.reader.getInteger(
                    grandChildren[0],
                    "stacks",
                    false
                );
                if (invalidNumber(stacks))
                    return (
                        "unable to parse stacks of the primitive coordinates for ID = " +
                        primitiveId
                    );

                var sph = new MySphere(
                    this.scene,
                    primitiveId,
                    radius,
                    slices,
                    stacks
                );

                this.primitives[primitiveId] = sph;
            } else if (primitiveType == "torus") {
                // inner
                var inner = this.reader.getFloat(
                    grandChildren[0],
                    "inner",
                    false
                );
                if (invalidNumber(inner))
                    return (
                        "unable to parse inner of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // outer
                var outer = this.reader.getFloat(
                    grandChildren[0],
                    "outer",
                    false
                );
                if (invalidNumber(outer))
                    return (
                        "unable to parse outer of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // slices
                var slices = this.reader.getInteger(
                    grandChildren[0],
                    "slices",
                    false
                );
                if (invalidNumber(slices))
                    return (
                        "unable to parse slices of the primitive coordinates for ID = " +
                        primitiveId
                    );

                // loops
                var loops = this.reader.getInteger(
                    grandChildren[0],
                    "loops",
                    false
                );
                if (invalidNumber(loops))
                    return (
                        "unable to parse loops of the primitive coordinates for ID = " +
                        primitiveId
                    );

                var tor = new MyTorus(
                    this.scene,
                    primitiveId,
                    inner,
                    outer,
                    slices,
                    loops
                );

                this.primitives[primitiveId] = tor;
            } else if (primitiveType == "patch") {
                const degree_u = this.reader.getInteger(
                    grandChildren[0],
                    "degree_u",
                    false
                );
                if (invalidNumber(degree_u))
                    return (
                        "unable to parse degree_u of the primitive coordinates for ID = " +
                        primitiveId
                    );

                const degree_v = this.reader.getInteger(
                    grandChildren[0],
                    "degree_v",
                    false
                );
                if (invalidNumber(degree_v))
                    return (
                        "unable to parse degree_v of the primivite coordinates for ID = " +
                        primitiveId
                    );

                const parts_u = this.reader.getInteger(
                    grandChildren[0],
                    "parts_u",
                    false
                );
                if (invalidNumber(parts_u))
                    return (
                        "unable to parse parts_u of the primitive coordinates for ID = " +
                        primitiveId
                    );

                const parts_v = this.reader.getInteger(
                    grandChildren[0],
                    "parts_v",
                    false
                );
                if (invalidNumber(parts_v))
                    return (
                        "unable to parse parts_v of the primitive coordinates for ID = " +
                        primitiveId
                    );

                const controlPoints = [];
                const controlPointNodes = grandChildren[0].children;
                if (
                    controlPointNodes.length !=
                    (degree_u + 1) * (degree_v + 1)
                ) {
                    return (
                        "unable to parse control points of the primitive coordinates for ID = " +
                        primitiveId +
                        ". Expected " +
                        (degree_u + 1) * (degree_v + 1) +
                        " control points, found " +
                        controlPointNodes.length
                    );
                }

                for (const controlNode of controlPointNodes) {
                    const control_x = this.reader.getFloat(
                        controlNode,
                        "x",
                        false
                    );
                    if (invalidNumber(control_x))
                        return (
                            "unable to parse x coordinate of the control point from primitive with ID = " +
                            primitiveId
                        );

                    const control_y = this.reader.getFloat(
                        controlNode,
                        "y",
                        false
                    );
                    if (invalidNumber(control_y))
                        return (
                            "unable to parse y coordinate of the control point from primitive with ID = " +
                            primitiveId
                        );

                    const control_z = this.reader.getFloat(
                        controlNode,
                        "z",
                        false
                    );
                    if (invalidNumber(control_z))
                        return (
                            "unable to parse z coordinate of the control point from primitive with ID = " +
                            primitiveId
                        );

                    const control_w = this.reader.getFloat(
                        controlNode,
                        "w",
                        false
                    );
                    if (control_w && isNaN(control_z))
                        return (
                            "unable to parse z coordinate of the control point from primitive with ID = " +
                            primitiveId
                        );

                    controlPoints.push([
                        control_x,
                        control_y,
                        control_z,
                        control_w ?? 1,
                    ]);
                }

                const currPatch = new MyPatch(
                    this.scene,
                    primitiveId,
                    degree_u,
                    degree_v,
                    parts_u,
                    parts_v,
                    controlPoints
                );
                this.primitives[primitiveId] = currPatch;
            } else if (primitiveType == "objfile") {
                const fileName = this.reader.getString(grandChildren[0], "file", false);
                if (fileName == null) {
                    return `unable to parse file name of the primitive with ID = ${primitiveId}`;
                }

                const new3dObj = new CGFOBJModel(this.scene, buildObjPath(fileName));
                this.primitives[primitiveId] = new3dObj;
            }
        }

        log("Parsed primitives");
        return null;
    }

    /**
     * Parses the <animations> block.
     * @param {animations block element} animationsNode
     */
    parseAnimations(animationsNode) {
        const animationsParser = new AnimationsParser(
            this.reader,
            animationsNode,
            this.scene
        );
        if (animationsParser.hasReports())
            return animationsParser.reports[0];
        this.animations = animationsParser.animations;

        log("Parsed animations");
        return null;
    }

    /**
     * Parses the <components> block.
     * @param {components block element} componentsNode
     */
    parseComponents(componentsNode) {
        this.componentsParser = new ComponentsParser(
            this.reader,
            componentsNode,
            this.transformationsParser.transformations,
            this.materialsParser.materials,
            this.texturesParser.textures,
            this.primitives,
            this.animations,
            this.idRoot
        );
        if (this.componentsParser.hasReports())
            return this.componentsParser.reports[0];

        if (!(this.idRoot in this.componentsParser.components)) {
            return `Root component(${this.idRoot}) referenced in the  <scene /> does not exist.`;
        }

        log("Parsed Components");
        return null;
    }

    /**
     * Parses the <board> block.
     * @param {board block element} boardNode
     */
    parseBoard(boardNode) {
        this.boardParser = new BoardParser(
            this.reader,
            boardNode,
        );

        if (this.boardParser.hasReports())
            return this.boardParser.reports[0];

        log("Parsed Board");
        return null;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        this.drawComponent(
            this.componentsParser.components[this.idRoot],
            null,
            null,
            null
        );
    }

    /**
     *
     * @param {Component} component
     * @param {string | null} prevAppearenceId
     * @param {Texture | null} prevTexture
     * @param {PickingInfo | null} pickingInfo - Optional pickingInfo to associate to all the primitives of the component and its children
     */
    drawComponent(component, prevAppearenceId = null, prevTexture = null, pickingInfo = null) {
        this.scene.pushMatrix();

        if (!component) return;
        if (component.hasTransformation()) {
            this.scene.multMatrix(
                this.transformationsParser.transformations[
                    component.transformation
                ]
            );
        }
        if (component.hasAnimation()) {
            if (!component.animation.hasStarted()) {
                this.scene.popMatrix();
                return;
            }
            component.animation.apply();
        }

        let appearenceId =
            component.materials.length > 0 ?
            component.materials[component.currMaterial] :
            prevAppearenceId;

        if (appearenceId == "inherit") {
            appearenceId = prevAppearenceId;
        }

        let texture = component.texture;
        if (texture.inheritTex()) texture = prevTexture;

        let appearance = null;
        if (appearenceId) {
            appearance = this.materialsParser.materials[appearenceId];

            // Apply texture
            if (texture != null) {
                if (texture.removeTex()) {
                    appearance.setTexture(null);
                } else {
                    const cgfTexture = this.texturesParser.textures[texture.id];
                    appearance.setTexture(cgfTexture);
                    appearance.setTextureWrap("REPEAT", "REPEAT");
                }
            }

            appearance.apply();
        }

        if (component.isHighlighted()) {
            this.scene.highlightShader.setUniformsValues({ highlightScale: component.highlighted.scale, highlightColor: component.highlighted.getColor() });
            this.scene.setActiveShader(this.scene.highlightShader);
        }

        for (const primitive of component.primitives) {
            let currPrimitive = this.primitives[primitive];

            if (pickingInfo != null) this.scene.registerForPick(pickingInfo.id, pickingInfo.object);

            if (texture && texture.needsScaling()) {
                currPrimitive.scaleTexCoords(
                    texture.length_s,
                    texture.length_t
                );
            }

            currPrimitive.display();
            // Reset texture coords scale
            currPrimitive.scaleTexCoords(1.0, 1.0);
        }

        if (component.isHighlighted())
            this.scene.setActiveShader(this.scene.defaultShader);

        // Clean the Appearance object that is being changed above
        if (appearance) appearance.setTexture(null);


        for (const childComponent of component.components) {
            this.drawComponent(
                this.componentsParser.components[childComponent],
                appearenceId,
                texture,
                pickingInfo
            );
        }

        this.scene.popMatrix();
    }
}
