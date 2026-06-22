/**
 * @file stats.ts
 * @description Derives the global stats-bar figures from the bundled data: total estimated
 * market value, the biggest logged seizure, and the highest-tonnage corridor.
 */

import { allEntities } from "./datasets";
import { SUBSTANCES } from "./meta";

export interface GlobalStats {
    marketValue: string;
    biggestSeizure: string;
    mostActiveCorridor: string;
}

/** Leading numeric value in a quantity string like "≈116 t", or 0. */
function leadingNumber(s: string): number {
    const m = s.match(/[\d.]+/);
    return m ? parseFloat(m[0]) : 0;
}

export function globalStats(): GlobalStats {
    const total = SUBSTANCES.reduce((sum, m) => sum + m.marketValueUsd, 0);
    const entities = allEntities();

    const routes = entities.filter((e) => e.properties.kind === "route");
    const topRoute = routes.reduce((a, b) =>
        ((b.properties.tonnage as number) > (a.properties.tonnage as number) ? b : a), routes[0]);

    const seizures = entities.filter((e) => e.properties.kind === "seizure");
    const topSeizure = seizures.reduce((a, b) =>
        (leadingNumber(String(b.properties.quantity)) > leadingNumber(String(a.properties.quantity)) ? b : a), seizures[0]);

    return {
        marketValue: `$${Math.round(total / 1e9)}B/yr (est.)`,
        biggestSeizure: topSeizure ? `${topSeizure.properties.label} — ${topSeizure.properties.quantity}` : "—",
        mostActiveCorridor: topRoute
            ? `${topRoute.properties.source} → ${topRoute.properties.destinations}`
            : "—",
    };
}
