/**
 * @file pointRenderer.ts
 * @description Renders point layers: lab clusters, port hotspots (sized by severity),
 * major seizures, live DEA seizures, and interdiction "clash" markers (billboards). Each
 * primitive is tagged `{ _wwvEntity }` for host selection and tracked for filtering.
 */

import Cesium from "cesium";
import type { GeoEntity } from "@worldwideview/wwv-plugin-sdk";
import { SUBSTANCE_BY_ID } from "./meta";
import type { FilterState } from "./filterStore";
import type { LayerId, Substance } from "./types";

const CLASH_ICON = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"><circle cx="11" cy="11" r="9" fill="none" stroke="#ffd0d0" stroke-width="1.5"/><g stroke="#ff5252" stroke-width="3" stroke-linecap="round"><line x1="5" y1="5" x2="17" y2="17"/><line x1="17" y1="5" x2="5" y2="17"/></g></svg>',
)}`;

const c = (r: number, g: number, b: number, a = 1) => new Cesium.Color(r, g, b, a);
const subColor = (s: Substance) => { const x = SUBSTANCE_BY_ID[s].rgba; return c(x[0], x[1], x[2]); };
const severityColor = (sev: number) => { const t = Math.max(0, Math.min(1, (sev - 1) / 4)); return c(0.95, 0.85 - t * 0.65, 0.2); };

export class PointRenderer {
    private readonly points: Cesium.PointPrimitiveCollection;
    private readonly billboards: Cesium.BillboardCollection;
    private tracked: { layer: LayerId; substance?: Substance; setShow: (v: boolean) => void }[] = [];

    constructor(private readonly viewer: Cesium.Viewer) {
        const { primitives } = viewer.scene;
        this.points = primitives.add(new Cesium.PointPrimitiveCollection());
        this.billboards = primitives.add(new Cesium.BillboardCollection());
    }

    private point(e: GeoEntity, fill: Cesium.Color, size: number): Cesium.PointPrimitive {
        return this.points.add({
            position: Cesium.Cartesian3.fromDegrees(e.longitude, e.latitude),
            pixelSize: size, color: fill, outlineColor: c(0, 0, 0, 0.6), outlineWidth: 1.5,
            disableDepthTestDistance: Number.POSITIVE_INFINITY, id: { _wwvEntity: e },
        });
    }

    add(e: GeoEntity): void {
        const kind = e.properties.kind;
        const sub = e.properties.substance as Substance | undefined;
        if (kind === "interdiction") {
            const b = this.billboards.add({
                position: Cesium.Cartesian3.fromDegrees(e.longitude, e.latitude), image: CLASH_ICON,
                scale: 0.9, disableDepthTestDistance: Number.POSITIVE_INFINITY, id: { _wwvEntity: e },
            });
            this.tracked.push({ layer: "interdictions", substance: sub, setShow: (v) => { b.show = v; } });
            return;
        }
        let fill = c(0.8, 0.8, 0.85);
        let size = 11;
        let layer: LayerId = "labs";
        if (kind === "lab") { fill = subColor(sub!); size = 11; layer = "labs"; }
        else if (kind === "port") { fill = severityColor(e.properties.severity as number); size = 9 + (e.properties.severity as number) * 2; layer = "ports"; }
        else if (kind === "seizure") { fill = subColor(sub!); size = 12; layer = (e.properties.layer as LayerId) ?? "seizures"; }
        const pt = this.point(e, fill, size);
        this.tracked.push({ layer, substance: sub, setShow: (v) => { pt.show = v; } });
    }

    /** Add a live DEA seizure marker (distinct cyan, larger). */
    addLive(e: GeoEntity): void {
        const pt = this.point(e, c(0.3, 0.95, 0.95), 13);
        this.tracked.push({ layer: "dea-live", substance: e.properties.substance as Substance | undefined, setShow: (v) => { pt.show = v; } });
        this.viewer.scene.requestRender();
    }

    applyFilter(s: FilterState): void {
        for (const t of this.tracked) {
            const subOn = !t.substance || s.substances.has(t.substance);
            t.setShow(s.layers.has(t.layer) && subOn);
        }
    }

    dispose(): void {
        if (!this.viewer.isDestroyed()) {
            this.viewer.scene.primitives.remove(this.points);
            this.viewer.scene.primitives.remove(this.billboards);
        }
        this.tracked = [];
    }
}
