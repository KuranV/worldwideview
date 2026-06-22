/**
 * @file routeRenderer.ts
 * @description Renders all route layers (drug, precursor, air, maritime) as animated flow
 * lines in one PolylineCollection. Width scales with estimated tonnage; confidence sets the
 * opacity and dash pattern; air corridors are drawn as great-circle arcs. Each line is tagged
 * `{ _wwvEntity }` for host selection, and tracked so filters can toggle visibility.
 */

import Cesium from "cesium";
import type { GeoEntity } from "@worldwideview/wwv-plugin-sdk";
import { createFlowMaterial } from "./flowMaterial";
import { flatten, greatCircleArc, lengthKm } from "./geo";
import { PRECURSOR_RGBA, SUBSTANCE_BY_ID } from "./meta";
import type { FilterState } from "./filterStore";
import type { LayerId, RouteMode, Substance } from "./types";

interface Tracked {
    layer: LayerId;
    substance: Substance | "precursor";
    confidence: string;
    months: number[];
    setShow: (v: boolean) => void;
}

/** Line width from estimated annual tonnage (thicker = higher volume). */
function widthFor(tonnage: number): number {
    return Math.max(2, Math.min(9, 2 + Math.sqrt(tonnage) * 0.4));
}

export class RouteRenderer {
    private readonly lines: Cesium.PolylineCollection;
    private tracked: Tracked[] = [];

    constructor(private readonly viewer: Cesium.Viewer) {
        this.lines = viewer.scene.primitives.add(new Cesium.PolylineCollection());
    }

    add(entity: GeoEntity): void {
        const p = entity.properties;
        const path = p.path as [number, number][];
        const substance = p.substance as Substance | "precursor";
        const mode = p.mode as RouteMode;
        const confidence = p.confidence as string;
        const base = substance === "precursor" ? PRECURSOR_RGBA : SUBSTANCE_BY_ID[substance].rgba;
        const rgba: [number, number, number, number] = [base[0], base[1], base[2], confidence === "confirmed" ? 1 : 0.4];
        const dash = confidence === "confirmed" ? 0.55 : 0.25;
        const positions = mode === "air"
            ? Cesium.Cartesian3.fromDegreesArrayHeights(greatCircleArc(path[0], path[path.length - 1]))
            : Cesium.Cartesian3.fromDegreesArray(flatten(path));

        const line = this.lines.add({
            positions,
            width: widthFor(p.tonnage as number),
            material: createFlowMaterial(rgba, Math.max(8, Math.round(lengthKm(path) / 450)), dash),
            id: { _wwvEntity: entity },
        });
        this.tracked.push({
            layer: p.layer as LayerId, substance, confidence,
            months: p.months as number[], setShow: (v) => { line.show = v; },
        });
    }

    applyFilter(s: FilterState): void {
        for (const t of this.tracked) {
            const layerOn = s.layers.has(t.layer);
            const subOn = t.substance === "precursor" || s.substances.has(t.substance);
            const confOn = t.confidence === "confirmed" || s.showSuspected;
            const seasonOn = s.season === 0 || t.months.includes(s.season);
            t.setShow(layerOn && subOn && confOn && seasonOn);
        }
    }

    dispose(): void {
        if (!this.viewer.isDestroyed()) this.viewer.scene.primitives.remove(this.lines);
        this.tracked = [];
    }
}
