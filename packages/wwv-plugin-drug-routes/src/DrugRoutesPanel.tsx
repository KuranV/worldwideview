/**
 * @file DrugRoutesPanel.tsx
 * @description Bottom-panel UI (`getBottomPanelComponent`): layer toggles, per-substance
 * filters (with a deep-dive launcher), the seasonal slider, suspected-route and price-substance
 * controls, and the global stats bar. The deep dive replaces the panel body when opened.
 */

import { useEffect, useState } from "react";
import { filterStore } from "./filterStore";
import type { FilterState } from "./filterStore";
import { LAYERS, SUBSTANCES } from "./meta";
import { globalStats } from "./stats";
import { SubstanceDeepDive } from "./SubstanceDeepDive";
import { ensureStyles } from "./styles";
import type { Substance } from "./types";

const MONTHS = ["All year", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function DrugRoutesPanel() {
    const [fs, setFs] = useState<FilterState>(() => filterStore.getState());
    const [dive, setDive] = useState<Substance | null>(null);

    useEffect(() => {
        ensureStyles();
        return filterStore.subscribe(setFs);
    }, []);

    if (dive) return <SubstanceDeepDive substance={dive} onBack={() => setDive(null)} />;

    const stats = globalStats();
    const chip = (on: boolean) => (on ? "wwv-drug-chip" : "wwv-drug-chip wwv-drug-chip--off");

    return (
        <div className="wwv-drug-panel">
            <div className="wwv-drug-head">
                <span className="wwv-drug-title">Global drug supply chain</span>
                <span className="wwv-drug-sub">UNODC · INCB · InSight Crime · DEA</span>
            </div>

            <div className="wwv-drug-section-label">Layers</div>
            <div className="wwv-drug-chips">
                {LAYERS.map((l) => (
                    <button key={l.id} type="button" className={chip(fs.layers.has(l.id))} onClick={() => filterStore.toggleLayer(l.id)}>{l.label}</button>
                ))}
            </div>

            <div className="wwv-drug-section-label">Substances <span className="wwv-drug-hint">ⓘ = deep dive</span></div>
            <div className="wwv-drug-chips">
                {SUBSTANCES.map((sm) => (
                    <span key={sm.id} className="wwv-drug-subwrap">
                        <button type="button" className={chip(fs.substances.has(sm.id))} onClick={() => filterStore.toggleSubstance(sm.id)}>
                            <span className="wwv-drug-swatch" style={{ background: sm.hex }} />{sm.label}
                        </button>
                        <button type="button" className="wwv-drug-info" title={`${sm.label} deep dive`} onClick={() => setDive(sm.id)}>ⓘ</button>
                    </span>
                ))}
            </div>

            <div className="wwv-drug-controls">
                <label className="wwv-drug-control">
                    <span>Season — {MONTHS[fs.season]}</span>
                    <input type="range" min={0} max={12} step={1} value={fs.season} onChange={(e) => filterStore.setSeason(Number(e.target.value))} />
                </label>
                <label className="wwv-drug-control wwv-drug-check">
                    <input type="checkbox" checked={fs.showSuspected} onChange={(e) => filterStore.setShowSuspected(e.target.checked)} /> Show suspected routes
                </label>
                <label className="wwv-drug-control">
                    <span>Price layer</span>
                    <select value={fs.choroplethSubstance} onChange={(e) => filterStore.setChoroplethSubstance(e.target.value as Substance)}>
                        {SUBSTANCES.map((sm) => <option key={sm.id} value={sm.id}>{sm.label}</option>)}
                    </select>
                </label>
            </div>

            <div className="wwv-drug-stats">
                <div className="wwv-drug-stat"><span className="wwv-drug-row-label">Total market value</span><span className="wwv-drug-stat-v">{stats.marketValue}</span></div>
                <div className="wwv-drug-stat"><span className="wwv-drug-row-label">Biggest seizure</span><span className="wwv-drug-stat-v">{stats.biggestSeizure}</span></div>
                <div className="wwv-drug-stat"><span className="wwv-drug-row-label">Most active corridor</span><span className="wwv-drug-stat-v">{stats.mostActiveCorridor}</span></div>
            </div>
        </div>
    );
}
