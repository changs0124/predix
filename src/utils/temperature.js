export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const mapRange01 = (v, a, b) => (v - a) / (b - a);