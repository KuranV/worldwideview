/**
 * @file SubstanceDeepDive.tsx
 * @description Per-substance deep dive opened from the panel: estimated market value, a
 * seizure-trend sparkline, and lists of the related routes, cultivation zones and lab clusters.
 */

import { useEffect } from "react";
import { allEntities } from "./datasets";
import { SUBSTANCE_BY_ID } from "./meta";
import { ensureStyles } from "./styles";
import { Sparkline } from "./Sparkline";
import type { Crop, Substance } from "./types";

const SUBSTANCE_CROP: Partial<Record<Substance, Crop>> = { cocaine: "coca", heroin: "poppy" };

function DeepList({ title, items }: { title: string; items: string[] }) {
    if (!items.length) return null;
    return (
        <div className="wwv-drug-dive-sec">
            <div className="wwv-drug-row-label">{title}</div>
            <ul className="wwv-drug-list">{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
    );
}

export function SubstanceDeepDive({ substance, onBack }: { substance: Substance; onBack: () => void }) {
    useEffect(() => { ensureStyles(); }, []);
    const meta = SUBSTANCE_BY_ID[substance];
    const ents = allEntities();
    const routes = ents.filter((e) => e.properties.kind === "route" && e.properties.substance === substance);
    const labs = ents.filter((e) => e.properties.kind === "lab" && e.properties.substance === substance);
    const crop = SUBSTANCE_CROP[substance];
    const zones = ents.filter((e) => e.properties.kind === "cultivation" && e.properties.crop === crop);

    return (
        <div className="wwv-drug-dive">
            <button type="button" className="wwv-drug-back" onClick={onBack}>← All layers</button>
            <div className="wwv-drug-dive-head">
                <span className="wwv-drug-swatch" style={{ background: meta.hex }} />{meta.label}
            </div>
            <div className="wwv-drug-row">
                <span className="wwv-drug-row-label">Est. market value</span>
                <span className="wwv-drug-row-value">${Math.round(meta.marketValueUsd / 1e9)}B/yr (retail)</span>
            </div>
            <div className="wwv-drug-row">
                <span className="wwv-drug-row-label">Seizure trend</span>
                <Sparkline data={meta.trend} color={meta.hex} />
            </div>
            <DeepList title={`Routes (${routes.length})`} items={routes.map((r) => `${r.properties.source} → ${r.properties.destinations}`)} />
            <DeepList title={`Cultivation (${zones.length})`} items={zones.map((z) => `${z.properties.country} — ${z.properties.area}`)} />
            <DeepList title={`Lab clusters (${labs.length})`} items={labs.map((l) => String(l.properties.region))} />
        </div>
    );
}
