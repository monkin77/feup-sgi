export const euclideanDistance = (x1, y1, z1, x2, y2, z2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;
    return Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
};
