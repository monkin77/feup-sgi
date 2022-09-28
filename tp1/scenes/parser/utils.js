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
    var x = xmlReader.getFloat(node, "x");
    if (!(x != null && !isNaN(x)))
        return "unable to parse x-coordinate of the " + messageError;

    // y
    var y = xmlReader.getFloat(node, "y");
    if (!(y != null && !isNaN(y)))
        return "unable to parse y-coordinate of the " + messageError;

    // z
    var z = xmlReader.getFloat(node, "z");
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