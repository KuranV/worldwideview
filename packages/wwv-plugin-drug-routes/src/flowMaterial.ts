/**
 * @file flowMaterial.ts
 * @description Scrolling dashed Cesium polyline material — dashes flow source → destination.
 * Confidence is conveyed by the colour alpha (suspected routes are passed a lower alpha)
 * and by the dash ratio (suspected routes use a shorter, dottier `dashLength`). Animation
 * is driven by `czm_frameNumber`; the layer forces renders while enabled.
 */

import Cesium from "cesium";

const FABRIC_SOURCE = `
czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material m = czm_getDefaultMaterial(materialInput);
    float s = materialInput.s;
    float scroll = czm_frameNumber * speed;
    float pattern = fract(s * repeat - scroll);
    float on = step(pattern, dashLength);
    m.diffuse = color.rgb;
    m.emission = color.rgb * 0.4;
    m.alpha = color.a * mix(0.12, 1.0, on);
    return m;
}`;

/**
 * @param rgba    Base colour; pass a reduced alpha for suspected routes.
 * @param repeat  Dashes per line (derive from length for even spacing).
 * @param dashLength  Dash/gap ratio (≈0.55 confirmed, ≈0.25 suspected = dottier).
 */
export function createFlowMaterial(
    rgba: [number, number, number, number],
    repeat: number,
    dashLength = 0.55,
): Cesium.Material {
    return new Cesium.Material({
        translucent: true,
        fabric: {
            type: "WwvDrugFlow",
            uniforms: {
                color: new Cesium.Color(rgba[0], rgba[1], rgba[2], rgba[3]),
                repeat,
                dashLength,
                speed: 0.0016,
            },
            source: FABRIC_SOURCE,
        },
    });
}
