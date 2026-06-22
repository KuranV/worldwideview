/**
 * @file polygonRenderer.ts
 * @description Renders polygon layers via a CustomDataSource: cartel territories (outlined +
 * labelled), cultivation zones (filled by crop), and the street-price choropleth (countries
 * filled by price for the selected substance). Each entity carries `_wwvEntity` for selection.
 */

import Cesium from "cesium";
import type { GeoEntity } from "@worldwideview/wwv-plugin-sdk";
import { flatten } from "./geo";
import { CROP_BY_ID, priceColor } from "./meta";
import { priceFor, priceRange } from "./datasets";
import type { FilterState } from "./filterStore";
import type { Crop, LayerId, Substance } from "./types";

const color = (c: [number, number, number, number]) => new Cesium.Color(c[0], c[1], c[2], c[3]);
type Tagged = Cesium.Entity & { _wwvEntity: GeoEntity };

export class PolygonRenderer {
    private readonly ds = new Cesium.CustomDataSource("wwv-drug-polygons");
    private tracked: { layer: LayerId; ent: Cesium.Entity }[] = [];
    private countries: { iso: string; ent: Cesium.Entity }[] = [];

    constructor(private readonly viewer: Cesium.Viewer) {
        viewer.dataSources.add(this.ds);
    }

    private poly(e: GeoEntity, fill: Cesium.Color, outline: Cesium.Color, label?: string): Cesium.Entity {
        const r = e.properties.ring as [number, number][];
        const ent = this.ds.entities.add({
            polygon: { hierarchy: Cesium.Cartesian3.fromDegreesArray(flatten(r)), material: fill, outline: true, outlineColor: outline, height: 0 },
            position: Cesium.Cartesian3.fromDegrees(e.longitude, e.latitude),
            label: label ? {
                text: label, font: "12px sans-serif", fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK, outlineWidth: 3, style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                scale: 0.85, disableDepthTestDistance: Number.POSITIVE_INFINITY,
            } : undefined,
        });
        (ent as Tagged)._wwvEntity = e;
        return ent;
    }

    addTerritory(e: GeoEntity): void {
        this.tracked.push({ layer: "territories", ent: this.poly(e, color([0.85, 0.15, 0.25, 0.18]), color([0.95, 0.3, 0.35, 0.9]), e.properties.name as string) });
    }

    addCultivation(e: GeoEntity): void {
        const m = CROP_BY_ID[e.properties.crop as Crop];
        this.tracked.push({ layer: "cultivation", ent: this.poly(e, color(m.rgba), color([m.rgba[0], m.rgba[1], m.rgba[2], 0.9])) });
    }

    addCountry(e: GeoEntity, sub: Substance): void {
        const iso = e.properties.iso as string;
        const ent = this.poly(e, this.fillFor(iso, sub), color([1, 1, 1, 0.25]));
        this.countries.push({ iso, ent });
        this.tracked.push({ layer: "prices", ent });
    }

    private fillFor(iso: string, sub: Substance): Cesium.Color {
        const v = priceFor(iso, sub);
        if (v == null) return color([0.3, 0.3, 0.34, 0.22]);
        const [min, max] = priceRange(sub);
        return color(priceColor(max > min ? (v - min) / (max - min) : 0.5));
    }

    recolorChoropleth(sub: Substance): void {
        for (const c of this.countries) c.ent.polygon!.material = new Cesium.ColorMaterialProperty(this.fillFor(c.iso, sub));
    }

    /** Brighten territories whose properties match — used by the conflict-zone cross-hook. */
    highlightTerritories(test: (props: Record<string, unknown>) => boolean): void {
        for (const t of this.tracked) {
            if (t.layer !== "territories") continue;
            const on = test((t.ent as Tagged)._wwvEntity.properties);
            t.ent.polygon!.material = new Cesium.ColorMaterialProperty(color(on ? [1, 0.85, 0.2, 0.42] : [0.85, 0.15, 0.25, 0.18]));
        }
    }

    applyFilter(s: FilterState): void {
        for (const t of this.tracked) t.ent.show = s.layers.has(t.layer);
    }

    dispose(): void {
        if (!this.viewer.isDestroyed()) this.viewer.dataSources.remove(this.ds, true);
        this.tracked = [];
        this.countries = [];
    }
}
