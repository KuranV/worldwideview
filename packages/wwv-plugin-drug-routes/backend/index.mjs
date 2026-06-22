/**
 * @file index.mjs
 * @description Optional near-real-time seeder for the Drug Trafficking Routes plugin. Polls the
 * public DEA press-release RSS feed, turns geolocatable seizure announcements into points, and
 * broadcasts them to the frontend as { type:"data", pluginId:"drug-routes", payload:[...] }.
 * This is the endpoint the plugin's `streamUrl` points at (the static layers work without it).
 */

import { WebSocketServer } from "ws";
import { fetchRss, parseSeizure } from "./dea-rss.mjs";
import { locate } from "./gazetteer.mjs";

const PORT = Number(process.env.DEA_SEEDER_PORT || 5006);
const RSS_URL = process.env.DEA_RSS_URL || "https://www.dea.gov/rss.xml";
const POLL_MS = Number(process.env.DEA_POLL_MS || 600000); // 10 min
const PLUGIN_ID = "drug-routes";
const MAX = 200;

const buffer = [];
const seen = new Set();

async function poll() {
    try {
        const items = await fetchRss(RSS_URL);
        const fresh = [];
        for (const it of items) {
            const key = it.link || it.title;
            if (!key || seen.has(key)) continue;
            seen.add(key);
            const seizure = parseSeizure(it, locate);
            if (seizure) { buffer.push(seizure); fresh.push(seizure); }
        }
        if (buffer.length > MAX) buffer.splice(0, buffer.length - MAX);
        if (fresh.length) broadcast(fresh);
        console.log(`[dea-seeder] polled ${items.length} items, ${fresh.length} new geolocated seizures`);
    } catch (err) {
        console.warn(`[dea-seeder] poll failed: ${err.message}`);
    }
}

const wss = new WebSocketServer({ port: PORT, path: "/stream" });
console.log(`[dea-seeder] listening on ws://localhost:${PORT}/stream → ${RSS_URL}`);

wss.on("connection", (socket) => {
    socket.send(JSON.stringify({ type: "welcome", plugins: [PLUGIN_ID] }));
    if (buffer.length) socket.send(JSON.stringify({ type: "data", pluginId: PLUGIN_ID, payload: buffer }));
    socket.on("message", () => {});
});

function broadcast(payload) {
    const msg = JSON.stringify({ type: "data", pluginId: PLUGIN_ID, payload });
    for (const client of wss.clients) {
        if (client.readyState === client.OPEN) client.send(msg);
    }
}

poll();
const timer = setInterval(poll, POLL_MS);

function shutdown() {
    clearInterval(timer);
    wss.close(() => process.exit(0));
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
