/**
 * @file DrugRoutesPlugin.ts
 * @description WorldPlugin for the Drug Trafficking Routes layer (v2 — full supply chain).
 *
 * Hybrid data layer: bundled UNODC/INCB/InSight-Crime datasets are returned from `fetch()`
 * (so they populate search/intel), while an optional DEA RSS seeder streams near-real-time
 * seizures via `streamUrl`. The custom globe layer owns all rendering, so default rendering
 * is disabled. Live seizures are re-broadcast on the DataBus for the layer to draw.
 */

import type {
    CesiumEntityOptions, GeoEntity, LayerConfig, PluginContext, ServerPluginConfig, WorldPlugin,
} from "@worldwideview/wwv-plugin-sdk";
import type { ComponentType } from "react";
import { allEntities } from "./datasets";
import { RoutesLayer } from "./RoutesLayer";
import { DrugRoutesPanel } from "./DrugRoutesPanel";
import { RouteDetail } from "./RouteDetail";
import { emitDeaSeizure } from "./bus";
import { deaEntity } from "./live";
import type { DeaItem } from "./live";
import { DRUG_ROUTES_PLUGIN_ID } from "./types";

const STATIC_REFRESH_MS = 21_600_000; // 6h — bundled data; re-fetch is a no-op.
const DEFAULT_STREAM_URL = "ws://localhost:5006/stream";

export class DrugRoutesPlugin implements WorldPlugin {
    id = DRUG_ROUTES_PLUGIN_ID;
    name = "Drug Trafficking Routes";
    description = "Global drug supply chain — corridors, precursors, territories, cultivation, prices, seizures and a live DEA feed (UNODC, INCB, InSight Crime, DEA).";
    icon = "Route";
    category = "intelligence" as const;
    version = "2.0.0";

    private streamUrl = DEFAULT_STREAM_URL;

    async initialize(ctx: PluginContext): Promise<void> {
        this.streamUrl = ctx.env.DEA_STREAM_URL || DEFAULT_STREAM_URL;
    }

    destroy(): void {
        /* The globe layer cleans up its own primitives on unmount. */
    }

    async fetch(): Promise<GeoEntity[]> {
        return allEntities();
    }

    getPollingInterval(): number {
        return STATIC_REFRESH_MS;
    }

    getServerConfig(): ServerPluginConfig {
        return { apiBasePath: "", pollingIntervalMs: 0, streamUrl: this.streamUrl };
    }

    getLayerConfig(): LayerConfig {
        return { color: "#cbd5e1", clusterEnabled: false, clusterDistance: 0, disableDefaultRendering: true };
    }

    renderEntity(): CesiumEntityOptions {
        return { type: "polyline", color: "#cbd5e1" };
    }

    /** Live DEA seizures → re-broadcast each on the DataBus; store entities are left intact. */
    mapWebsocketPayload(payload: unknown, existing: GeoEntity[] = []): GeoEntity[] {
        const list = Array.isArray(payload) ? payload : (payload as { items?: unknown[] })?.items ?? [];
        for (const it of list as DeaItem[]) {
            if (!Number.isFinite(it?.lat) || !Number.isFinite(it?.lon)) continue;
            emitDeaSeizure(deaEntity(it));
        }
        return existing;
    }

    getGlobeComponent(): ComponentType<{ viewer: unknown; enabled: boolean }> {
        return RoutesLayer;
    }

    getBottomPanelComponent(): ComponentType<{ pluginId: string; enabled: boolean }> {
        return DrugRoutesPanel;
    }

    getDetailComponent(): ComponentType<{ entity: GeoEntity }> {
        return RouteDetail;
    }
}
