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