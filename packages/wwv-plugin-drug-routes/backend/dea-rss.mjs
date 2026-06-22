/**
 * @file dea-rss.mjs
 * @description Fetches and parses the public DEA press-release RSS feed (lightweight regex
 * parsing — no XML dependency), then heuristically extracts a substance, quantity and location
 * to turn a release into a mappable seizure point.
 */

const stripCdata = (s) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
const stripTags = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#\d+;/g, " ").trim();

function tag(block, name) {
    const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
    return m ? stripCdata(m[1]) : "";
}

/** Fetch the feed and return raw items: { title, link, date, summary }. */
export async function fetchRss(url) {
    const res = await fetch(url, { headers: { "user-agent": "wwv-plugin-drug-routes-seeder" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const items = [];
    for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
        const b = m[1];
        items.push({
            title: stripTags(tag(b, "title")),
            link: tag(b, "link"),
            date: tag(b, "pubDate"),
            summary: stripTags(tag(b, "description")),
        });
    }
    return items;
}

const QUANTITY = /([\d,.]+)\s*(kilograms?|kg|pounds?|lbs?|grams?|tablets?|pills?|tons?)/i;

/** Turn a release into a seizure point, or null if no location can be resolved. */
export function parseSeizure(item, locate) {
    const text = `${item.title} ${item.summary}`;
    const loc = locate(text);
    if (!loc) return null;
    const substance = /fentanyl/i.test(text) ? "fentanyl"
        : /cocaine/i.test(text) ? "cocaine"
            : /heroin/i.test(text) ? "heroin"
                : /meth(amphetamine)?/i.test(text) ? "methamphetamine" : undefined;
    const q = text.match(QUANTITY);
    return {
        id: item.link || item.title,
        lon: loc[0], lat: loc[1],
        substance, title: item.title,
        quantity: q ? `${q[1]} ${q[2]}` : undefined,
        date: item.date ? new Date(item.date).toISOString() : undefined,
        url: item.link,
    };
}
