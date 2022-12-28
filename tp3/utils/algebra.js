export const vectorLength = (v) => {
    return Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
};

export const euclideanDistance = (x1, y1, z1, x2, y2, z2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;
    return vectorLength([dx, dy, dz]);
};

export const crossProduct = (v1, v2) => {
    return [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0]
    ];
};

export const crossProductNormalized = (v1, v2) => {
    const v = crossProduct(v1, v2);
    const length = vectorLength(v);
    return [
        v[0] / length,
        v[1] / length,
        v[2] / length
    ];
};

export const getTranslation = (matrix) => [matrix[12], matrix[13], matrix[14]];
