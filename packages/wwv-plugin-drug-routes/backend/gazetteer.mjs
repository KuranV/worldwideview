/**
 * @file gazetteer.mjs
 * @description Coarse city gazetteer (DEA field-division cities + a Caribbean division) used
 * to approximate a seizure location from free-text press releases. Returns [lon, lat] or null.
 */

export const GAZETTEER = {
    "atlanta": [-84.39, 33.75], "boston": [-71.06, 42.36], "chicago": [-87.63, 41.88],
    "dallas": [-96.80, 32.78], "denver": [-104.99, 39.74], "detroit": [-83.05, 42.33],
    "el paso": [-106.49, 31.76], "houston": [-95.37, 29.76], "los angeles": [-118.24, 34.05],
    "miami": [-80.19, 25.76], "new orleans": [-90.07, 29.95], "new york": [-74.01, 40.71],
    "philadelphia": [-75.16, 39.95], "phoenix": [-112.07, 33.45], "san diego": [-117.16, 32.72],
    "san francisco": [-122.42, 37.77], "seattle": [-122.33, 47.61], "st. louis": [-90.20, 38.63],
    "washington": [-77.04, 38.90], "newark": [-74.17, 40.74], "caribbean": [-66.10, 18.47],
    "san juan": [-66.11, 18.47], "phoenix field": [-112.07, 33.45], "louisville": [-85.76, 38.25],
};

/** First gazetteer entry whose key appears in the text (case-insensitive), else null. */
export function locate(text) {
    const t = String(text).toLowerCase();
    for (const [name, coord] of Object.entries(GAZETTEER)) {
        if (t.includes(name)) return coord;
    }
    return null;
}
