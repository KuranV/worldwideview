/**
 * @file live.ts
 * @description Converts a live DEA seizure item (from the seeder backend) into a GeoEntity
 * tagged as a `dea-live` seizure, so it renders through the same point pipeline as the
 * curated seizures and is clickable for its dossier.
 */

import type { GeoEntity } from "@worldwideview/wwv-plugin-sdk";
import { DRUG_ROUTES_PLUGIN_ID } from "./types";

export interface DeaItem {
    id: string;
    lat: number;
    lon: number;
    substance?: string;
    title: string;
    quantity?: string;
    date?: string;
    url?: string;
}

export function deaEntity(it: DeaItem): GeoEntity {
    return {
        id: `${DRUG_ROUTES_PLUGIN_ID}-dea-${it.id}`,
        pluginId: DRUG_ROUTES_PLUGIN_ID,
        latitude: it.lat,
        longitude: it.lon,
        timestamp: it.date ? new Date(it.date) : new Date(),
        label: it.title,
        properties: {
            kind: "seizure",
            layer: "dea-live",
            substance: it.substance ?? "cocaine",
            quantity: it.quantity ?? "see DEA release",
            location: it.title,
            date: it.date ?? "",
            citationUrl: it.url ?? "https://www.dea.gov/press-releases",
            reportYear: "DEA press release",
        },
    };
}
