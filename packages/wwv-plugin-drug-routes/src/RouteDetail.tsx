/**
 * @file RouteDetail.tsx
 * @description Detail panel (`getDetailComponent`) for any selected feature. Branches on the
 * entity `kind` to show the right fields; country selections delegate to CountryProfile.
 */

import { useEffect } from "react";
import type { GeoEntity } from "@worldwideview/wwv-plugin-sdk";
import { ensureStyles } from "./styles";
import { CROP_BY_ID, SUBSTANCE_BY_ID } from "./meta";
import { CountryProfile } from "./CountryProfile";
import { Row } from "./Row";
import type { Crop, Substance } from "./types";

type P = Record<string, unknown>;
const s = (v: unknown) => String(v ?? "—");

function fmtDate(iso: unknown): string {
    const d = new Date(String(iso));
    return Number.isNaN(d.getTime()) ? s(iso) : d.toLocaleDateString();
}

function rowsFor(kind: string, p: P): [string, string][] {
    switch (kind) {
        case "route": return [["Est. annual volume", s(p.volume)], ["Tonnage (est.)", `${s(p.tonnage)} t/yr`], ["Confidence", s(p.confidence)], ["Mode", s(p.mode)], ["Source", s(p.source)], ["Destinations", s(p.destinations)]];
        case "seizure": return [["Quantity", s(p.quantity)], ["Location", s(p.location)], ["Date", fmtDate(p.date)]];
        case "lab": return [["Region", s(p.region)], ["Note", s(p.note)]];
        case "port": return [["Country", s(p.country)], ["Severity", `${s(p.severity)}/5`], ["Note", s(p.note)]];
        case "interdiction": return [["Agency", s(p.agency)], ["Note", s(p.note)], ["Date", fmtDate(p.date)]];
        case "territory": return [["Group", s(p.group)], ["Region", s(p.region)], ["Substances", s(p.substances)]];
        case "cultivation": return [["Crop", CROP_BY_ID[p.crop as Crop]?.label ?? s(p.crop)], ["Country", s(p.country)], ["Area", s(p.area)]];
        default: return [];
    }
}

function badge(kind: string, p: P): string {
    if (kind === "territory") return s(p.name);
    if (kind === "cultivation") return CROP_BY_ID[p.crop as Crop]?.label ?? s(p.crop);
    if (kind === "port") return s(p.name);
    if (p.substance && p.substance !== "precursor") return SUBSTANCE_BY_ID[p.substance as Substance].label;
    return kind;
}

export function RouteDetail({ entity }: { entity: GeoEntity }) {
    useEffect(() => { ensureStyles(); }, []);
    const p = entity.properties as P;
    if (p.kind === "country") return <CountryProfile entity={entity} />;
    const kind = String(p.kind);

    return (
        <div className="wwv-drug-detail">
            <span className="wwv-drug-badge">{badge(kind, p)}</span>
            {rowsFor(kind, p).map(([l, v]) => <Row key={l} label={l} value={v} />)}
            {p.citationUrl ? (
                <a className="wwv-drug-cite" href={s(p.citationUrl)} target="_blank" rel="noreferrer">
                    Source — {s(p.reportYear) || "UNODC / INCB / InSight Crime"} ↗
                </a>
            ) : null}
        </div>
    );
}
