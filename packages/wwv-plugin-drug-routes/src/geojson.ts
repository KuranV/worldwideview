/**
 * @file geojson.ts
 * @description Minimal typed GeoJSON parsing for the bundled datasets. Geometry is read
 * via small accessors so callers stay terse and type-safe.
 */

export interface LineString { type: "LineString"; coordinates: [number, number][]; }
export interface Point { type: "Point"; coordinates: [number, number]; }
export interface Polygon { type: "Polygon"; coordinates: [number, number][][]; }

export interface Feature<P, G> {
    properties: P;
    geometry: G;
}

/** Parse a FeatureCollection string into its feature array. */
export function parseFC<P, G>(raw: string): Feature<P, G>[] {
    const fc = JSON.parse(raw) as { features?: Feature<P, G>[] };
    return fc.features ?? [];
}

export const lineCoords = (f: Feature<unknown, LineString>) => f.geometry.coordinates;
export const pointCoords = (f: Feature<unknown, Point>) => f.geometry.coordinates;
export const ring = (f: Feature<unknown, Polygon>) => f.geometry.coordinates[0];
