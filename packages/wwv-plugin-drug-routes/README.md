# wwv-plugin-drug-routes

Full global **drug supply-chain** visualization for WorldWideView (v2), curated from public
[UNODC](https://www.unodc.org/), [INCB](https://www.incb.org/),
[InSight Crime](https://insightcrime.org/) and [DEA](https://www.dea.gov/) sources.

| | |
|---|---|
| **id** | `drug-routes` |
| **category** | `intelligence` |
| **format** | `bundle` (static data inlined; optional DEA seeder for live feed) |

## Layers

**Routes & flows** (animated, dashed, source→destination flow):
- **Drug routes** — cocaine / heroin / meth corridors (UNODC). Line width scales with estimated annual tonnage.
- **Precursor routes** — INCB chemical flows, in a distinct magenta.
- **Air corridors** — drawn as great-circle arcs that bow over the globe.
- **Maritime go-fast** — coastal corridor clusters.
- Confidence is shown by opacity + dash: confirmed = solid/opaque, suspected = 40% / dotted.

**Static areas & points:**
- **Cartel territories** — outlined, labelled influence polygons (InSight Crime).
- **Cultivation zones** — coca / poppy / cannabis polygons, colour-coded by crop (UNODC surveys).
- **Lab clusters** — aggregate, region-level eradication-density markers (UNODC) — *not* precise active-lab locations.
- **Port hotspots** — markers sized by a corruption-severity index.
- **Interdictions** — navy/coastguard interception "clash" markers.
- **Street-price choropleth** — countries filled by USD/gram, switchable per substance.

**Near-real-time:**
- **DEA live feed** — the optional [`backend/`](./backend/README.md) seeder scrapes the public
  DEA press-release RSS, geolocates seizures, and streams them as live point markers.

## UI panel

Layer toggles, per-substance filters (each with a **deep-dive** launcher → routes, cultivation,
labs, market value, seizure-trend sparkline), a **seasonal** month slider, suspected-route and
price-substance controls, and a **global stats bar** (total market value, biggest seizure, most
active corridor). Clicking any feature opens its dossier; clicking a country opens a profile
(transit role, production, consumption, corruption score, street price, trend).

## Cross-plugin hooks (DataBus)

- **Emits** `drugRoutes:countryProfile` when a country is selected — so conflict-zone, sanctions
  or vessel-tracking plugins can highlight related entities.
- **Consumes** `conflictZones:regionSelected` — auto-highlights cartel territories overlapping
  the selected conflict region.

## Building & running

```bash
pnpm install
pnpm --filter @worldwideview/wwv-plugin-drug-routes build      # → dist/frontend.mjs
pnpm --filter @worldwideview/wwv-plugin-drug-routes typecheck
# optional live feed:
node packages/wwv-plugin-drug-routes/backend/index.mjs         # ws://localhost:5006/stream
```

## Data & provenance

All datasets live in [`data/`](./data) and are inlined into the bundle. They are **macro,
region-to-region approximations for analysis/visualization** — coordinates are illustrative,
volumes/prices are rounded public figures, territory and cultivation polygons are coarse, and
lab markers are aggregate regional density (historical), not operational locations. Refresh by
editing the GeoJSON/JSON (UNODC/INCB also publish shapefiles convertible to GeoJSON). Keep the
source attributions intact.
