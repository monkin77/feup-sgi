export const DEGREE_TO_RAD = Math.PI / 180;

/**
 * Callback to be executed on any minor error, showing a warning on the console.
 * @param {string} message
 */
export const onXMLMinorError = (message) => {
    console.warn("[Warning]: " + message);
};

/*
 * Callback to be executed on any read error, showing an error on the console.
 * @param {string} message
 */
export const onXMLError = (message) => {
    console.error("XML Loading Error: " + message);
}

/**
 * Callback to be executed on any message.
 * @param {string} message
 */
export const log = (message) => {
    console.log("[Log] " + message);
};

/**
 * 
 * @param {*} val 
 * @returns true if received value is NOT a valid float
 */
export const invalidNumber = (val) => {
    return (val == null) || isNaN(val);
}

/**
 * Parse the coordinates from a node with ID = id
 * @param {CGF xml Reader} xmlReader
 * @param {block element} node
 * @param {message to be displayed in case of error} messageError
 * @Returns {array} coordinates if successful, an error string otherwise
 */
export const parseCoordinates3D = (xmlReader, node, messageError) => {
    var position = [];

    // x
    var x = xmlReader.getFloat(node, "x", false);
    if (invalidNumber(x))
        return "unable to parse x-coordinate of the " + messageError;

    // y
    var y = xmlReader.getFloat(node, "y", false);
    if (invalidNumber(y))
        return "unable to parse y-coordinate of the " + messageError;

    // z
    var z = xmlReader.getFloat(node, "z", false);
    if (invalidNumber(z))
        return "unable to parse z-coordinate of the " + messageError;

    position.push(...[x, y, z]);

    return position;
};

/**
 * Parse the coordinates from a node with ID = id
 * @param {CGF xml Reader} xmlReader
 * @param {block element} node
 * @param {message to be displayed in case of error} messageError
 */
export const parseCoordinates4D = (xmlReader, node, messageError) => {
    var position = [];

    //Get x, y, z
    position = parseCoordinates3D(xmlReader, node, messageError);

    if (!Array.isArray(position)) return position;

    // w
    var w = xmlReader.getFloat(node, "w", false);
    if (invalidNumber(w))
        return "unable to parse w-coordinate of the " + messageError;

    position.push(w);

    return position;
}

/**
 * Converts an axis name to vec3 representation
 * @param {*} axis
 * @returns {int[] | null} array representing the axis if valid. Null otherwise
 */
export const axisToVec = (axis) => {
    switch (axis) {
        case "x":
            return [1, 0, 0];
        case "y":
            return [0, 1, 0];
        case "z":
            return [0, 0, 1];
        default:
            return null;
    }
};

export const parseRotation = (xmlReader, node, messageError) => {
    let axis = xmlReader.getString(node, "axis", false);
    if (axis == null)
        return {
            error: `no 'axis' defined for rotation in ${messageError}`,
        };
    axis = axisToVec(axis);

    if (!axis) return {
        error: `Invalid 'axis' value provided for rotation in ${messageError}`,
    };

    const angle = xmlReader.getFloat(node, "angle", false);
    if (invalidNumber(angle))
        return {
            error: `no 'angle' defined for rotation in ${messageError}`,
        };
    return {axis, angle};
}

/**
 *
 * @param {*} xmlReader
 * @param {*} transformationNode
 * @param {*} transformationId
 * @return { {matrix: mat4, counter: number} | {error: string} } object with the transformation matrix and the number of transformations applied,
 * or an object with an error string
 */
export const calculateTransformationMatrix = (
    xmlReader,
    transformationNode,
    transformationId
) => {
    let transfMatrix = mat4.create();

    let coordinates;
    let transfCounter = 0;
    for (const child of transformationNode.children) {
        switch (child.nodeName) {
            case "translate":
                coordinates = parseCoordinates3D(
                    xmlReader,
                    child,
                    `translate transformation with ID = ${transformationId}`
                );
                if (!Array.isArray(coordinates)) return { error: coordinates };

                transfMatrix = mat4.translate(
                    transfMatrix,
                    transfMatrix,
                    coordinates
                );
                transfCounter++;
                break;
            case "rotate":
                const {axis, angle, error} = parseRotation(xmlReader, child, `rotate transformation with ID = ${transformationId}`);
                if (error) return {error};

                transfMatrix = mat4.rotate(
                    transfMatrix,
                    transfMatrix,
                    angle * DEGREE_TO_RAD,
                    axis
                );
                transfCounter++;
                break;
            case "scale":
                coordinates = parseCoordinates3D(
                    xmlReader,
                    child,
                    `scale transformation with ID = ${transformationId}`
                );
                if (!Array.isArray(coordinates)) return { error: coordinates };

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

    return { matrix: transfMatrix, counter: transfCounter };
};

export const buildComponentTransfID = (componentID) => `${componentID}-transf`;

/**
 * Parse the color components from a node
 * @param {CGF xml Reader} xmlReader
 * @param {block element} node
 * @param {message to be displayed in case of error} messageError
 * @return {array} color components if successful, an error string otherwise
 */
export const parseColor = (xmlReader, node, messageError) => {
    var color = [];

    // R
    var r = xmlReader.getFloat(node, "r", false);
    if (!isValidColor(r))
        return "unable to parse R component of the " + messageError;

    // G
    var g = xmlReader.getFloat(node, "g", false);
    if (!isValidColor(g))
        return "unable to parse G component of the " + messageError;

    // B
    var b = xmlReader.getFloat(node, "b", false);
    if (!isValidColor(b))
        return "unable to parse B component of the " + messageError;

    // A
    var a = xmlReader.getFloat(node, "a", false);
    if (!isValidColor(a))
        return "unable to parse A component of the " + messageError;

    color.push(...[r, g, b, a]);

    return color;
};

/**
 * Verifies if a given value corresponds to a valid color value bettwen 0 and 1
 * @param {*} colorVal 
 * @returns true if valid, false otherwise
 */
export const isValidColor = (colorVal) => {
    return (colorVal != null && !isNaN(colorVal) && colorVal >= 0 && colorVal <= 1)
}

/**
 * 
 * @param {float[]} src Source point
 * @param {float[]} target Target Point
 * @returns 3D array representing vector
 */
export const calcVector = (src, target) => {
    return [target[0] - src[0], target[1] - src[1], target[2] - src[2]];
}

/**
 * @param cgfLight {CGFlight}
 * @param properties {properties} Storing light information [sceneIdx, enabled, type, location, ambient, diffuse, specular, attenuation, angle, exponent, target]
        // Note that the last 3 elements are only defined for spotlights, while the 4th last is optional
 */
export const updateLight = (cgfLight, properties) => {
    // console.log("Updating light: ", cgfLight, " with properties: ", properties);

    cgfLight.setVisible(true);

    if (properties[1] == true) cgfLight.enable();
    else cgfLight.disable();

    cgfLight.setPosition(...properties[3]);
    cgfLight.setAmbient(...properties[4]);
    cgfLight.setDiffuse(...properties[5]);
    cgfLight.setSpecular(...properties[6]);

    let attenOffset = 0;
    if (properties.length >= 8 && Array.isArray(properties[7])) {
        attenOffset = 1;
        if (properties[7][0] == 1) {
            cgfLight.setConstantAttenuation(1);
            cgfLight.setLinearAttenuation(0);
            cgfLight.setQuadraticAttenuation(0);
        } else if (properties[7][1] == 1) {
            cgfLight.setLinearAttenuation(1);
            cgfLight.setConstantAttenuation(0);
            cgfLight.setQuadraticAttenuation(0);
        } else {
            cgfLight.setQuadraticAttenuation(1);
            cgfLight.setConstantAttenuation(0);
            cgfLight.setLinearAttenuation(0);
        }
    }

    if (properties[2] == "spot") {
        cgfLight.setSpotCutOff(properties[7 + attenOffset]);
        cgfLight.setSpotExponent(properties[8 + attenOffset]);
        cgfLight.setSpotDirection(calcVector(properties[3], properties[9 + attenOffset]));
    }

    cgfLight.update();
}

