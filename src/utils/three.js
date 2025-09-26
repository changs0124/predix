export const labelPosFromBboxTop = (bbox, scale) => {
    if (!bbox) {
        return [0, 0, 0];
    };

    return [0, bbox.max.y * scale, 0];
}