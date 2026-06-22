# wwv-plugin-drug-routes-backend

Optional near-real-time seeder for the [`wwv-plugin-drug-routes`](../README.md) layer. It
polls the **public DEA press-release RSS feed**, heuristically extracts a substance, quantity
and location from each release, and broadcasts geolocatable seizures to the frontend.

The plugin's static layers work without this; the seeder only powers the **DEA live feed** layer.

## Behaviour

- Polls `DEA_RSS_URL` every `DEA_POLL_MS` (default 10 min).
- Regex-parses the RSS (no XML dependency), then per item:
  - matches a substance keyword (cocaine / heroin / meth / fentanyl),
  - extracts a quantity (`kg`, `lbs`, `tablets`, …),
  - resolves a location against a DEA field-division city gazetteer (`gazetteer.mjs`).
- Releases that can't be geolocated are skipped. New, geolocated seizures are broadcast as
  `{ type: "data", pluginId: "drug-routes", payload: [{ id, lat, lon, substance, title, quantity, date, url }] }`.

> Location is approximate (derived from the field-division city named in the release), and the
> feed only covers DEA (US) announcements — this is a best-effort OSINT aggregation of already-
> public post-enforcement press releases.

## Run

```bash
node index.mjs
# or
pnpm --filter @worldwideview/wwv-plugin-drug-routes-backend start
```

| Env var | Default | Purpose |
|---|---|---|
| `DEA_SEEDER_PORT` | `5006` | Port for the downstream `/stream` endpoint |
| `DEA_RSS_URL` | `https://www.dea.gov/rss.xml` | Source RSS feed |
| `DEA_POLL_MS` | `600000` | Poll interval (ms) |

Point the frontend at it with `NEXT_PUBLIC_WWV_PLUGIN_DEA_STREAM_URL` (exposed as
`ctx.env.DEA_STREAM_URL`). Use `wss://` in production.
