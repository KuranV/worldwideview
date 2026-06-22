/**
 * @file meta.ts
 * @description Display metadata: substance/crop colours, the toggleable layer registry,
 * and the street-price choropleth colour ramp.
 */

import type { Crop, LayerId, Substance } from "./types";

export interface SubstanceMeta {
    id: Substance;
    label: string;
    hex: string;
    rgba: [number, number, number, number];
    /** Illustrative global retail market value (USD), for the stats bar / deep dive. */
    marketValueUsd: number;
    /** Relative annual seizure trend (last ~8 years) for sparklines. */
    trend: number[];
}

export const SUBSTANCES: SubstanceMeta[] = [
    { id: "cocaine", label: "Cocaine", hex: "#f8fafc", rgba: [0.97, 0.98, 0.99, 1], marketValueUsd: 120e9, trend: [9, 11, 12, 14, 15, 18, 20, 24] },
    { id: "heroin", label: "Heroin", hex: "#b07d4f", rgba: [0.69, 0.49, 0.31, 1], marketValueUsd: 55e9, trend: [12, 11, 13, 10, 9, 8, 7, 6] },
    { id: "methamphetamine", label: "Methamphetamine", hex: "#3b82f6", rgba: [0.23, 0.51, 0.96, 1], marketValueUsd: 45e9, trend: [4, 6, 9, 12, 16, 21, 27, 33] },
    { id: "fentanyl", label: "Fentanyl precursors", hex: "#f97316", rgba: [0.98, 0.45, 0.09, 1], marketValueUsd: 30e9, trend: [1, 2, 4, 7, 12, 19, 28, 40] },
];

export const SUBSTANCE_BY_ID = Object.fromEntries(
    SUBSTANCES.map((s) => [s.id, s]),
) as Record<Substance, SubstanceMeta>;

export interface CropMeta { id: Crop; label: string; hex: string; rgba: [number, number, number, number]; }

export const CROPS: CropMeta[] = [
    { id: "coca", label: "Coca", hex: "#22c55e", rgba: [0.13, 0.77, 0.37, 0.45] },
    { id: "poppy", label: "Opium poppy", hex: "#ec4899", rgba: [0.93, 0.28, 0.6, 0.45] },
    { id: "cannabis", label: "Cannabis", hex: "#84cc16", rgba: [0.52, 0.8, 0.09, 0.45] },
];

export const CROP_BY_ID = Object.fromEntries(CROPS.map((c) => [c.id, c])) as Record<Crop, CropMeta>;

/** Precursor chemical routes use a distinct magenta, separate from drug substances. */
export const PRECURSOR_RGBA: [number, number, number, number] = [0.85, 0.2, 0.85, 1];

export interface LayerMeta {
    id: LayerId;
    label: string;
    kind: "route" | "polygon" | "point" | "choropleth";
    defaultOn: boolean;
}

export const LAYERS: LayerMeta[] = [
    { id: "drug-routes", label: "Drug routes", kind: "route", defaultOn: true },
    { id: "precursor-routes", label: "Precursor routes", kind: "route", defaultOn: false },
    { id: "air-corridors", label: "Air corridors", kind: "route", defaultOn: false },
    { id: "maritime-corridors", label: "Maritime go-fast", kind: "route", defaultOn: false },
    { id: "territories", label: "Cartel territories", kind: "polygon", defaultOn: true },
    { id: "cultivation", label: "Cultivation zones", kind: "polygon", defaultOn: false },
    { id: "prices", label: "Street-price index", kind: "choropleth", defaultOn: false },
    { id: "labs", label: "Lab clusters", kind: "point", defaultOn: false },
    { id: "ports", label: "Port hotspots", kind: "point", defaultOn: false },
    { id: "interdictions", label: "Interdictions", kind: "point", defaultOn: false },
    { id: "seizures", label: "Major seizures", kind: "point", defaultOn: true },
    { id: "dea-live", label: "DEA live feed", kind: "point", defaultOn: false },
];

/** Sequential green→amber→red ramp for the price choropleth (t in 0..1). */
export function priceColor(t: number): [number, number, number, number] {
    const x = Math.max(0, Math.min(1, t));
    const r = x < 0.5 ? x * 2 : 1;
    const g = x < 0.5 ? 1 : 1 - (x - 0.5) * 2;
    return [0.2 + r * 0.75, 0.25 + g * 0.6, 0.2, 0.5];
}
