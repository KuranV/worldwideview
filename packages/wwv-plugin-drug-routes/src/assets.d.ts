/** Vite `?inline` CSS imports resolve to the raw stylesheet text. */
declare module "*.css?inline" {
    const css: string;
    export default css;
}

/** Vite `?raw` imports resolve to the file's contents as a string (used for GeoJSON). */
declare module "*.geojson?raw" {
    const text: string;
    export default text;
}
