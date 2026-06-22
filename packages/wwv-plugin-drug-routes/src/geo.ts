/**
 * @file geo.ts
 * @description Geometry helpers: flatten paths for Cesium, approximate length (for dash
 * density), polygon centroids (for labels), and great-circle arc interpolation with a
 * parabolic altitude bulge so air corridors arc naturally over the globe.
 */

/** Flatten `[[lon,lat],…]` to `[lon,lat,…]` for `Cartesian3.fromDegreesArray`. */
export function flatten(coords: [number, number][]): number[] {
    const out: number[] = [];
    for (const [lon, lat] of coords) out.push(lon, lat);
    return out;
}

export function midpoint(coords: [number, number][]): [number, number] {
    return coords[Math.floor(coords.length / 2)];
}

/** Average of a polygon's outer ring vertices — good enough for a label anchor. */
export function centroid(ring: [number, number][]): [number, number] {
    let lon = 0, lat = 0;
    for (const [x, y] of ring) { lon += x; lat += y; }
    return [lon / ring.length, lat / ring.length];
}

const EARTH_RADIUS_KM = 6371;
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

export function lengthKm(coords: [number, number][]): number {
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
        const [lo1, la1] = coords[i - 1];
        const [lo2, la2] = coords[i];
        const dLat = toRad(la2 - la1), dLon = toRad(lo2 - lo1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(la1)) * Math.cos(toRad(la2)) * Math.sin(dLon / 2) ** 2;
        total += 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
    }
    return total;
}

/**
 * Great-circle arc between two lon/lat points as a flat `[lon,lat,height,…]` array for
 * `Cartesian3.fromDegreesArrayHeights`. Height follows a sine bulge peaking at `maxHeightM`.
 */
export function greatCircleArc(
    a: [number, number], b: [number, number], segments = 48, maxHeightM = 600000,
): number[] {
    const [lo1, la1] = [toRad(a[0]), toRad(a[1])];
    const [lo2, la2] = [toRad(b[0]), toRad(b[1])];
    const d = 2 * Math.asin(Math.sqrt(
        Math.sin((la2 - la1) / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin((lo2 - lo1) / 2) ** 2,
    ));
    const out: number[] = [];
    if (d === 0) return [a[0], a[1], 0];
    for (let i = 0; i <= segments; i++) {
        const f = i / segments;
        const A = Math.sin((1 - f) * d) / Math.sin(d);
        const B = Math.sin(f * d) / Math.sin(d);
        const x = A * Math.cos(la1) * Math.cos(lo1) + B * Math.cos(la2) * Math.cos(lo2);
        const y = A * Math.cos(la1) * Math.sin(lo1) + B * Math.cos(la2) * Math.sin(lo2);
        const z = A * Math.sin(la1) + B * Math.sin(la2);
        out.push(toDeg(Math.atan2(y, x)), toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), Math.sin(f * Math.PI) * maxHeightM);
    }
    return out;
}
