// ============================================================
// HavenBridge — forwards The Isle server snapshots to the Haven app.
//
// Tails the NDJSON file the HavenPosition UE4SS mod writes
// (Mods/HavenPosition/Saved/events.ndjson) and POSTs the latest
// snapshot per player to the app's feed endpoint every 5 seconds.
//
// Run it on any machine that can read the game server's files
// (the server host itself is simplest). Node.js 18+ required.
//
// Usage:
//   1. Set ENDPOINT and SECRET below (or env vars ENDPOINT / SECRET).
//      - ENDPOINT: your app's URL + /functions/dinoFeedIngest
//      - SECRET: the ARKANIS_FEED_SECRET value from the app dashboard
//   2. Run from the game server root (or point EVENTS_FILE at the file):
//      node haven-bridge.mjs
// ============================================================

import fs from "node:fs";

const ENDPOINT = process.env.ENDPOINT || "https://REPLACE-WITH-YOUR-APP-URL/functions/dinoFeedIngest";
const SECRET = process.env.SECRET || "REPLACE-WITH-YOUR-FEED-SECRET";
const EVENTS_FILE = process.env.EVENTS_FILE || "Mods/HavenPosition/Saved/events.ndjson";
const SERVER_NAME = process.env.SERVER_NAME || "The Haven";
const POST_EVERY_MS = 5000;

// Species class path ("/Game/.../BP_Tyrannosaurus.BP_Tyrannosaurus_C")
// to a readable name ("Tyrannosaurus"), matching the app's feed parser.
function speciesFromPath(path) {
  const m = /BP_([A-Za-z]+)\.BP_[A-Za-z]+_C/.exec(path || "");
  if (!m) return "Unknown";
  return m[1].replace(/([a-z])([A-Z])/g, "$1 $2");
}

// GetGrowth() is a 0..1 fraction; the app stores a percentage.
function growthPercent(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return n <= 1.5 ? Math.round(n * 1000) / 10 : Math.round(n * 10) / 10;
}

let byteOffset = 0;
const pending = new Map(); // steam_id -> latest snapshot row

function readNewLines() {
  let stat;
  try {
    stat = fs.statSync(EVENTS_FILE);
  } catch {
    return; // no file yet; the mod creates it on first snapshot
  }
  // The mod rotates the file when it grows large: if the size went
  // DOWN between reads, restart from the beginning.
  if (stat.size < byteOffset) byteOffset = 0;
  if (stat.size <= byteOffset) return;

  const fh = fs.openSync(EVENTS_FILE, "r");
  try {
    const len = stat.size - byteOffset;
    const buf = Buffer.alloc(len);
    fs.readSync(fh, buf, 0, len, byteOffset);
    byteOffset = stat.size;
    for (const line of buf.toString("utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let row;
      try {
        row = JSON.parse(trimmed);
      } catch {
        continue; // partial line; the next read picks the full one up
      }
      if (row && row.steam) pending.set(String(row.steam), row);
    }
  } finally {
    fs.closeSync(fh);
  }
}

function toPlayerRecord(row) {
  const pos = row.pos || {};
  return {
    steam_id: String(row.steam),
    name: row.name || "",
    species: speciesFromPath(row.species),
    growth: growthPercent(row.growth),
    health: Number(row.hp) || null,
    stamina: Number(row.stamina) || null,
    hunger: Number(row.hunger) || null,
    thirst: Number(row.thirst) || null,
    position: { x: pos.x, y: pos.y, z: pos.z },
  };
}

async function post() {
  if (pending.size === 0) return;
  const players = [...pending.values()].slice(0, 200).map(toPlayerRecord);
  pending.clear();
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-feed-secret": SECRET },
      body: JSON.stringify({ server_name: SERVER_NAME, players }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log(`[HavenBridge] forwarded ${players.length} player(s)`);
    } else {
      console.error(`[HavenBridge] endpoint returned ${res.status}: ${JSON.stringify(body)}`);
    }
  } catch (err) {
    console.error(`[HavenBridge] request failed: ${err.message}`);
  }
}

console.log(`[HavenBridge] tailing ${EVENTS_FILE}`);
readNewLines();
setInterval(() => {
  try {
    readNewLines();
  } catch (err) {
    console.error(`[HavenBridge] read failed: ${err.message}`);
  }
}, 1000);
setInterval(post, POST_EVERY_MS);
