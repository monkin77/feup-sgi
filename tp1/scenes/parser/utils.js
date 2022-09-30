export const DEGREE_TO_RAD = Math.PI / 180;

/**
 * Callback to be executed on any minor error, showing a warning on the console.
 * @param {string} message
 */
export const onXMLMinorError = (message) => {
    console.warn("[Warning]: " + message);
};

/**
 * Callback to be executed on any message.
 * @param {string} message
 */
export const log = (message) => {
    console.log("[Log] " + message);
};

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
    if (!(x != null && !isNaN(x)))
        return "unable to parse x-coordinate of the " + messageError;

    // y
    var y = xmlReader.getFloat(node, "y", false);
    if (!(y != null && !isNaN(y)))
        return "unable to parse y-coordinate of the " + messageError;

    // z
    var z = xmlReader.getFloat(node, "z", false);
    if (!(z != null && !isNaN(z)))
        return "unable to parse z-coordinate of the " + messageError;

    position.push(...[x, y, z]);

    return position;
};

/**
 * Converts an axis name to vec3 representation
 * @param {*} axis
 * @returns array representing the axis
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
            return [0, 0, 0];
    }
};

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
                let axis = xmlReader.getString(child, "axis", false);
                if (axis == null)
                    return {
                        error: `no 'axis' defined for rotation in transformation ${transformationId}`,
                    };
                axis = axisToVec(axis);

                const angle = xmlReader.getFloat(child, "angle", false);
                if (angle == null)
                    return {
                        error: `no 'angle' defined for rotation in transformation ${transformationId}`,
                    };

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
    if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
        return "unable to parse R component of the " + messageError;

    // G
    var g = xmlReader.getFloat(node, "g", false);
    if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
        return "unable to parse G component of the " + messageError;

    // B
    var b = xmlReader.getFloat(node, "b", false);
    if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
        return "unable to parse B component of the " + messageError;

    // A
    var a = xmlReader.getFloat(node, "a", false);
    if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
        return "unable to parse A component of the " + messageError;

    color.push(...[r, g, b, a]);

    return color;
};