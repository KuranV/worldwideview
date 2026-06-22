/**
 * @file types.ts
 * @description Core taxonomy and per-layer property shapes for the Drug Trafficking Routes
 * plugin (v2). Colour/registry metadata lives in `meta.ts`.
 */

export type Substance = "cocaine" | "heroin" | "methamphetamine" | "fentanyl";
export type Crop = "coca" | "poppy" | "cannabis";
export type Confidence = "confirmed" | "suspected";
export type RouteMode = "land" | "air" | "sea" | "precursor";

export type LayerId =
    | "drug-routes"
    | "precursor-routes"
    | "air-corridors"
    | "maritime-corridors"
    | "territories"
    | "cultivation"
    | "labs"
    | "ports"
    | "prices"
    | "interdictions"
    | "seizures"
    | "dea-live";

export const DRUG_ROUTES_PLUGIN_ID = "drug-routes";

/** DataBus events used for cross-plugin coordination. */
export const COUNTRY_PROFILE_EVENT = "drugRoutes:countryProfile" as const;
export const CONFLICT_REGION_EVENT = "conflictZones:regionSelected" as const;

export interface RouteProps {
    id: string;
    layer: LayerId;
    mode: RouteMode;
    substance: Substance | "precursor";
    /** Estimated annual tonnes — drives line width. */
    tonnage: number;
    confidence: Confidence;
    volume: string;
    source: string;
    destinations: string;
    /** Months (1–12) the corridor is most active, for the seasonal toggle. */
    months: number[];
    reportYear: string;
    citationUrl: string;
}

export interface TerritoryProps {
    id: string; name: string; group: string; region: string;
    substances: string; reportYear: string; citationUrl: string;
}

export interface CultivationProps {
    id: string; crop: Crop; country: string; area: string;
    reportYear: string; citationUrl: string;
}

export interface LabProps {
    id: string; substance: Substance; region: string; note: string;
    reportYear: string; citationUrl: string;
}

export interface PortProps {
    id: string; name: string; country: string; severity: number;
    note: string; reportYear: string; citationUrl: string;
}

export interface InterdictionProps {
    id: string; substance: Substance | "precursor"; agency: string;
    note: string; date: string; citationUrl: string;
}

export interface SeizureProps {
    id: string; substance: Substance; label: string; quantity: string;
    date: string; location: string; reportYear: string; citationUrl: string;
}

/** Per-country street-price index (USD/gram) keyed by substance. */
export interface PriceRow {
    country: string; iso: string; prices: Partial<Record<Substance, number>>;
}

export interface CountryProfile {
    country: string; iso: string; transit: string; production: string;
    consumption: string; corruption: number; trend: number[];
}
