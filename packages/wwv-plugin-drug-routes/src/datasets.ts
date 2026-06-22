/**
 * @file datasets.ts
 * @description Loads every bundled dataset once and converts features into a single
 * GeoEntity[] (geometry rides along in `properties` so renderers, the detail panel and the
 * host store all read from one source). Also exposes price / country-profile lookups.
 */

import type { GeoEntity } from "@worldwideview/wwv-plugin-sdk";
import routesRaw from "../data/routes.geojson?raw";
import precursorRaw from "../data/precursor-routes.geojson?raw";
import airRaw from "../data/air-corridors.geojson?raw";
import maritimeRaw from "../data/maritime-corridors.geojson?raw";
import territoriesRaw from "../data/territories.geojson?raw";
import cultivationRaw from "../data/cultivation.geojson?raw";
import labsRaw from "../data/labs.geojson?raw";
import portsRaw from "../data/ports.geojson?raw";
import interdictionsRaw from "../data/interdictions.geojson?raw";
import countriesRaw from "../data/countries.geojson?raw";
import seizuresRaw from "../data/seizures.geojson?raw";
import pricesJson from "../data/prices.json";
import profilesJson from "../data/country-profiles.json";
import { lineCoords, parseFC, pointCoords, ring } from "./geojson";
import type { LineString, Point, Polygon } from "./geojson";
import { centroid, midpoint } from "./geo";
import { CROP_BY_ID, SUBSTANCE_BY_ID } from "./meta";
import { DRUG_ROUTES_PLUGIN_ID } from "./types";
import type {
    CountryProfile, CultivationProps, InterdictionProps, LabProps, PortProps,
    PriceRow, RouteProps, SeizureProps, Substance, TerritoryProps,
} from "./types";

type Props = Record<string, unknown>;

function entity(kind: string, p: Props, lat: number, lon: number, label: string, extra: Props = {}): GeoEntity {
    return {
        id: `${DRUG_ROUTES_PLUGIN_ID}-${String(p.id)}`,
        pluginId: DRUG_ROUTES_PLUGIN_ID,
        latitude: lat, longitude: lon, timestamp: new Date(),
        label,
        properties: { kind, ...p, ...extra },
    };
}

function routeEntities(raw: string): GeoEntity[] {
    return parseFC<RouteProps, LineString>(raw).map((f) => {
        const path = lineCoords(f);
        const [lon, lat] = midpoint(path);
        const sub = f.properties.substance === "precursor" ? "Precursor" : SUBSTANCE_BY_ID[f.properties.substance].label;
        return entity("route", f.properties as unknown as Props, lat, lon, `${sub}: ${f.properties.source}`, { path });
    });
}

function build(): GeoEntity[] {
    const out: GeoEntity[] = [
        ...routeEntities(routesRaw), ...routeEntities(precursorRaw),
        ...routeEntities(airRaw), ...routeEntities(maritimeRaw),
    ];
    for (const f of parseFC<TerritoryProps, Polygon>(territoriesRaw)) {
        const [lon, lat] = centroid(ring(f));
        out.push(entity("territory", f.properties as unknown as Props, lat, lon, f.properties.name, { ring: ring(f) }));
    }
    for (const f of parseFC<CultivationProps, Polygon>(cultivationRaw)) {
        const [lon, lat] = centroid(ring(f));
        out.push(entity("cultivation", f.properties as unknown as Props, lat, lon, `${CROP_BY_ID[f.properties.crop].label} — ${f.properties.country}`, { ring: ring(f) }));
    }
    for (const f of parseFC<{ iso: string; name: string; id?: string }, Polygon>(countriesRaw)) {
        const [lon, lat] = centroid(ring(f));
        out.push(entity("country", { id: f.properties.iso, ...f.properties }, lat, lon, f.properties.name, { ring: ring(f) }));
    }
    for (const f of parseFC<LabProps, Point>(labsRaw)) {
        const [lon, lat] = pointCoords(f);
        out.push(entity("lab", f.properties as unknown as Props, lat, lon, `${SUBSTANCE_BY_ID[f.properties.substance].label} labs — ${f.properties.region}`));
    }
    for (const f of parseFC<PortProps, Point>(portsRaw)) {
        const [lon, lat] = pointCoords(f);
        out.push(entity("port", f.properties as unknown as Props, lat, lon, `${f.properties.name} (port)`));
    }
    for (const f of parseFC<InterdictionProps, Point>(interdictionsRaw)) {
        const [lon, lat] = pointCoords(f);
        out.push(entity("interdiction", f.properties as unknown as Props, lat, lon, `Interdiction — ${f.properties.agency}`));
    }
    for (const f of parseFC<SeizureProps, Point>(seizuresRaw)) {
        const [lon, lat] = pointCoords(f);
        out.push(entity("seizure", { ...f.properties, layer: "seizures" } as unknown as Props, lat, lon, `${SUBSTANCE_BY_ID[f.properties.substance].label} seizure — ${f.properties.label}`));
    }
    return out;
}

const ENTITIES = build();
export const allEntities = (): GeoEntity[] => ENTITIES;

export const getPrices = (): PriceRow[] => (pricesJson as { rows: PriceRow[] }).rows;
export const getProfiles = (): CountryProfile[] => (profilesJson as { profiles: CountryProfile[] }).profiles;
export const priceFor = (iso: string, s: Substance): number | undefined => getPrices().find((r) => r.iso === iso)?.prices[s];
export const profileFor = (iso: string): CountryProfile | undefined => getProfiles().find((p) => p.iso === iso);

/** [min, max] of available prices for a substance, for choropleth normalization. */
export function priceRange(s: Substance): [number, number] {
    const vals = getPrices().map((r) => r.prices[s]).filter((v): v is number => v != null);
    return vals.length ? [Math.min(...vals), Math.max(...vals)] : [0, 1];
}
