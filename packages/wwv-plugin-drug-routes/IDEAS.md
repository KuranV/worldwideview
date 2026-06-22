# Extension Ideas — `wwv-plugin-drug-routes`

Ten logical next steps, building on what v2 already does (drug/precursor/air/maritime corridors
with tonnage-scaled width and confidence styling; cartel territories; cultivation zones; lab
clusters; port hotspots; interdictions; per-substance street-price choropleth; live DEA RSS
feed; seasonal toggle; substance deep-dive; country profile; and the `drugRoutes:countryProfile`
/ `conflictZones:regionSelected` DataBus hooks).

Each idea notes the **data source**, **how it looks on the globe**, and **why it adds value not
already covered**.

---

### 1. Temporal timeline playback (multi-year supply chain)
- **Data source:** UNODC World Drug Report time-series + WCO/UNODC annual seizure datasets (cultivation hectares, seizure tonnage, route prominence per year).
- **On the globe:** Hook the host timeline so dragging the year scrubs every layer — cultivation polygons grow/shrink, route widths re-scale, seizures appear on their dates, the choropleth re-colours.
- **Why it's new:** v2 is a single snapshot (the only temporal hint is a static sparkline). This turns the dashboard into an animated history showing how corridors and crops *shifted* over a decade.

### 2. Wastewater drug-use index (objective consumption)
- **Data source:** SCORE / EMCDDA municipal wastewater analysis (per-capita residues by city).
- **On the globe:** City markers sized/colour-graded by measured per-capita consumption, with a small per-substance bar on click.
- **Why it's new:** v2 shows supply (routes/cultivation) and *price* as a demand proxy. Wastewater is the closest thing to a ground-truth consumption measure and reveals demand the price layer can't (e.g., high use where prices are low).

### 3. Overdose-mortality choropleth (the harm layer)
- **Data source:** CDC (US), EMCDDA (EU) and national vital-statistics overdose-death rates per 100k.
- **On the globe:** A second choropleth mode (toggle alongside the price one) shading countries/states by overdose mortality, with a fentanyl emphasis.
- **Why it's new:** The plugin currently maps the *trade*; it says nothing about human cost. Overlaying harm next to flows is exactly the supply→consequence story policymakers want and reuses the choropleth machinery already built.

### 4. Narco-submarine & semi-submersible events
- **Data source:** Public navy / JIATF-South reporting on low-profile-vessel (LPV) and narco-sub interdictions.
- **On the globe:** Distinct submarine icons along the Eastern Pacific and trans-Atlantic, with depth/range annotation, animated as periodic pings.
- **Why it's new:** Maritime go-fast corridors are modelled, but the fast-growing semi-submersible vector is its own modality with distinct geography and detection challenges — worth surfacing as a first-class marker type rather than folding into "sea".

### 5. Price-arbitrage flow arrows (derived, not curated)
- **Data source:** Derived purely from the existing `prices.json` (no new dataset) — compute price deltas between producer and consumer countries.
- **On the globe:** Auto-generated animated arrows from low-price to high-price markets, thickness ∝ price gradient, so the economic *pull* is visible.
- **Why it's new:** v2 shows prices statically per country; it never visualizes the incentive gradient that *drives* the trafficking. This makes the "why" of the corridors legible and is almost free (reuses the flow material + price data).

### 6. Sanctions & designations overlay
- **Data source:** OFAC SDN list and EU sanctions list (entities/individuals tied to trafficking organizations), geocoded to their groups.
- **On the globe:** Pulsing badges on cartel-territory polygons that contain sanctioned entities; click lists the designations + dates.
- **Why it's new:** v2 shows territories and substances but nothing about the *legal/financial* response. This connects the map to enforcement action and pairs naturally with a sanctions plugin via a new `drugRoutes:*` ↔ sanctions hook.

### 7. Dark-vessel AIS correlation (cross-plugin)
- **Data source:** Consume a vessel-tracking plugin's AIS stream over the DataBus (e.g. `vesselTracking:positions`); flag vessels whose AIS goes dark inside a maritime corridor.
- **On the globe:** Highlight the last-known position of "gone dark" vessels sitting on a go-fast corridor, linking live behaviour to the static corridor.
- **Why it's new:** v2's cross-plugin hooks only *emit* country profiles and *consume* conflict regions. Consuming live vessel data closes the loop between modelled corridors and real-time maritime behaviour — the highest-signal addition for maritime interdiction.

### 8. Precursor manufacturing-hub clusters (upstream of routes)
- **Data source:** INCB pre-export notifications / PEN Online and chemical-industry registries for major precursor producers.
- **On the globe:** Cluster markers at chemical-manufacturing hubs feeding the precursor routes, sized by export volume, linking to the precursor polylines they originate.
- **Why it's new:** v2 draws precursor *flows* but not their *origins*. Showing the industrial source nodes addresses the "where do precursors actually come from" question that diversion-control work centres on.

### 9. Eradication & enforcement-effort bubbles
- **Data source:** UNODC eradication statistics (hectares eradicated, labs dismantled) and national seizure-rate data.
- **On the globe:** Semi-transparent bubbles over cultivation/lab regions sized by counter-narcotics effort, optionally as a "supply vs. enforcement" ratio.
- **Why it's new:** Every v2 layer depicts the illicit side; none shows the *response*. An effort layer lets users compare production against suppression and spot where enforcement lags the trade.

### 10. Narco-conflict funding nexus
- **Data source:** Combine `conflictZones:regionSelected` (already consumed) with ACLED/InSight Crime reporting on armed-group drug financing.
- **On the globe:** When a conflict region is selected, draw funding-link lines from overlapping cultivation zones / routes to the armed actors they bankroll, with a funding-estimate label.
- **Why it's new:** v2 only *highlights* overlapping territories on a conflict event. Explicitly drawing the cultivation→armed-group funding linkage turns a passive highlight into an analytical "narco-conflict" graph — a distinct intelligence product.
