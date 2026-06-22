/**
 * @file bus.ts
 * @description Cross-plugin DataBus wiring. Emits `drugRoutes:countryProfile` when a country
 * is selected here (so conflict/sanctions/vessel plugins can react), consumes
 * `conflictZones:regionSelected` to highlight overlapping cartel territories, and carries the
 * live DEA seizure feed from `mapWebsocketPayload` to the globe layer.
 */

import type { GeoEntity } from "@worldwideview/wwv-plugin-sdk";
import { dataBus } from "@/core/data/DataBus";
import { CONFLICT_REGION_EVENT, COUNTRY_PROFILE_EVENT } from "./types";
import type { CountryProfile } from "./types";

export const DEA_SEIZURE_EVENT = "drugRoutes:deaSeizure" as const;

/** Payload other plugins receive when a country is selected in this layer. */
export interface CountryProfilePayload extends Partial<CountryProfile> {
    iso: string;
    country: string;
}

export interface ConflictRegion {
    region?: string;
    countries?: string[];
    keywords?: string[];
}

export function emitCountryProfile(payload: CountryProfilePayload): void {
    dataBus.emit(COUNTRY_PROFILE_EVENT, payload);
}

export function onConflictRegion(fn: (r: ConflictRegion) => void): () => void {
    return dataBus.on(CONFLICT_REGION_EVENT, (d) => fn((d ?? {}) as ConflictRegion));
}

export function emitDeaSeizure(entity: GeoEntity): void {
    dataBus.emit(DEA_SEIZURE_EVENT, entity);
}

export function onDeaSeizure(fn: (entity: GeoEntity) => void): () => void {
    return dataBus.on(DEA_SEIZURE_EVENT, (d) => fn(d as GeoEntity));
}
