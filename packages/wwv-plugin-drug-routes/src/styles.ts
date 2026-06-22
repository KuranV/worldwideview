/**
 * @file styles.ts
 * @description Injects the plugin stylesheet once, from inlined CSS strings. CSP-safe pattern
 * for single-file bundles (a separately-emitted .css would never be loaded by the host).
 * Classes are namespaced `wwv-drug-*` to avoid collisions. Split across two files to respect
 * the per-file line budget.
 */

import core from "./drug-routes.css?inline";
import detail from "./drug-detail.css?inline";

const STYLE_ID = "wwv-drug-routes-styles";

export function ensureStyles(): void {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `${core}\n${detail}`;
    document.head.appendChild(style);
}
