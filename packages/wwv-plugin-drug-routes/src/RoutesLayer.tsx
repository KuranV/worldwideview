/**
 * @file RoutesLayer.tsx
 * @description Globe overlay (`getGlobeComponent`). Distributes the bundled entities to the
 * route / polygon / point renderers, re-applies filters (substance, layer, season, confidence,
 * choropleth substance) on change, highlights cartel territories when a conflict region is
 * selected elsewhere, ingests the live DEA feed, and forces renders so flow lines animate.
 */

import { useEffect, useRef } from "react";
import type { Viewer } from "cesium";
import type { GeoEntity } from "@worldwideview/wwv-plugin-sdk";
import { allEntities } from "./datasets";
import { RouteRenderer } from "./routeRenderer";
import { PolygonRenderer } from "./polygonRenderer";
import { PointRenderer } from "./pointRenderer";
import { filterStore } from "./filterStore";
import type { FilterState } from "./filterStore";
import { onConflictRegion, onDeaSeizure } from "./bus";
import type { ConflictRegion } from "./bus";
import type { Substance } from "./types";

function territoryTest(r: ConflictRegion): (props: Record<string, unknown>) => boolean {
    const needles = [...(r.countries ?? []), ...(r.keywords ?? []), r.region ?? ""]
        .map((s) => s.toLowerCase()).filter(Boolean);
    return (props) => {
        if (!needles.length) return false;
        const hay = `${props.region ?? ""} ${props.name ?? ""} ${props.group ?? ""}`.toLowerCase();
        return needles.some((n) => hay.includes(n));
    };
}

interface Props { viewer: unknown; enabled: boolean; }

export function RoutesLayer({ viewer, enabled }: Props): null {
    const choro = useRef<Substance>(filterStore.getState().choroplethSubstance);

    useEffect(() => {
        if (!viewer || !enabled) return;
        const v = viewer as Viewer;
        const routes = new RouteRenderer(v);
        const polys = new PolygonRenderer(v);
        const points = new PointRenderer(v);

        for (const e of allEntities()) {
            const kind = e.properties.kind;
            if (kind === "route") routes.add(e);
            else if (kind === "territory") polys.addTerritory(e);
            else if (kind === "cultivation") polys.addCultivation(e);
            else if (kind === "country") polys.addCountry(e, choro.current);
            else points.add(e);
        }

        const apply = (s: FilterState) => { routes.applyFilter(s); polys.applyFilter(s); points.applyFilter(s); };
        apply(filterStore.getState());
        v.scene.requestRender();

        const unsubFilter = filterStore.subscribe((s) => {
            if (s.choroplethSubstance !== choro.current) {
                choro.current = s.choroplethSubstance;
                polys.recolorChoropleth(s.choroplethSubstance);
            }
            apply(s);
            if (!v.isDestroyed()) v.scene.requestRender();
        });

        const unsubConflict = onConflictRegion((r) => {
            polys.highlightTerritories(territoryTest(r));
            if (!v.isDestroyed()) v.scene.requestRender();
        });

        const unsubDea = onDeaSeizure((entity: GeoEntity) => {
            points.addLive(entity);
            points.applyFilter(filterStore.getState());
        });

        let raf = requestAnimationFrame(function loop() {
            if (!v.isDestroyed()) v.scene.requestRender();
            raf = requestAnimationFrame(loop);
        });

        return () => {
            cancelAnimationFrame(raf);
            unsubFilter(); unsubConflict(); unsubDea();
            routes.dispose(); polys.dispose(); points.dispose();
        };
    }, [viewer, enabled]);

    return null;
}
