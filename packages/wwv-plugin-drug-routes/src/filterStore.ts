/**
 * @file filterStore.ts
 * @description Shared observable view-state for the plugin: which substances and which
 * layers are visible, the seasonal month filter, and whether suspected routes are shown.
 * The UI panel mutates it; the globe layer subscribes and re-applies filters. A module
 * singleton is fine — the bundle is one instance and this is local view state.
 */

import { LAYERS, SUBSTANCES } from "./meta";
import type { LayerId, Substance } from "./types";

export interface FilterState {
    substances: Set<Substance>;
    layers: Set<LayerId>;
    /** 0 = whole year; 1–12 = only corridors active in that month. */
    season: number;
    /** When false, suspected (lower-confidence) routes are hidden. */
    showSuspected: boolean;
    /** Substance the street-price choropleth is keyed to. */
    choroplethSubstance: Substance;
}

const state: FilterState = {
    substances: new Set(SUBSTANCES.map((s) => s.id)),
    layers: new Set(LAYERS.filter((l) => l.defaultOn).map((l) => l.id)),
    season: 0,
    showSuspected: true,
    choroplethSubstance: "cocaine",
};

type Listener = (s: FilterState) => void;
const listeners = new Set<Listener>();

function snapshot(): FilterState {
    return {
        substances: new Set(state.substances),
        layers: new Set(state.layers),
        season: state.season,
        showSuspected: state.showSuspected,
        choroplethSubstance: state.choroplethSubstance,
    };
}

function emit(): void {
    const s = snapshot();
    for (const fn of listeners) fn(s);
}

export const filterStore = {
    getState: snapshot,
    isSubstance: (id: Substance) => state.substances.has(id),
    isLayer: (id: LayerId) => state.layers.has(id),
    toggleSubstance(id: Substance) {
        if (state.substances.has(id)) state.substances.delete(id);
        else state.substances.add(id);
        emit();
    },
    toggleLayer(id: LayerId) {
        if (state.layers.has(id)) state.layers.delete(id);
        else state.layers.add(id);
        emit();
    },
    setSeason(month: number) { state.season = month; emit(); },
    setShowSuspected(v: boolean) { state.showSuspected = v; emit(); },
    setChoroplethSubstance(s: Substance) { state.choroplethSubstance = s; emit(); },
    subscribe(fn: Listener): () => void {
        listeners.add(fn);
        return () => listeners.delete(fn);
    },
};
