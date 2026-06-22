/**
 * @file CountryProfile.tsx
 * @description Country dossier shown when a choropleth country is selected: transit role,
 * production status, consumption, corruption score, current street price and a seizure-trend
 * sparkline. Emits `drugRoutes:countryProfile` so other plugins can react to the selection.
 */

import { useEffect } from "react";
import type { GeoEntity } from "@worldwideview/wwv-plugin-sdk";
import { priceFor, profileFor } from "./datasets";
import { filterStore } from "./filterStore";
import { SUBSTANCE_BY_ID } from "./meta";
import { emitCountryProfile } from "./bus";
import { ensureStyles } from "./styles";
import { Row } from "./Row";
import { Sparkline } from "./Sparkline";

export function CountryProfile({ entity }: { entity: GeoEntity }) {
    const iso = String(entity.properties.iso);
    const name = String(entity.properties.name);
    const profile = profileFor(iso);

    useEffect(() => {
        ensureStyles();
        emitCountryProfile({ iso, country: name, ...(profile ?? {}) });
    }, [iso, name, profile]);

    const sub = filterStore.getState().choroplethSubstance;
    const price = priceFor(iso, sub);

    return (
        <div className="wwv-drug-detail">
            <span className="wwv-drug-badge" style={{ borderColor: "#6ea8fe", color: "#6ea8fe" }}>{name}</span>
            {profile ? (
                <>
                    <Row label="Transit role" value={profile.transit} />
                    <Row label="Production" value={profile.production} />
                    <Row label="Consumption" value={profile.consumption} />
                    <Row label="Corruption score (CPI)" value={`${profile.corruption}/100`} />
                    <Row label={`${SUBSTANCE_BY_ID[sub].label} street price`} value={price != null ? `$${price}/g` : "n/a"} />
                    <div className="wwv-drug-row">
                        <span className="wwv-drug-row-label">Seizure trend</span>
                        <Sparkline data={profile.trend} />
                    </div>
                </>
            ) : (
                <div className="wwv-drug-note">No profile data for {name}.</div>
            )}
        </div>
    );
}
