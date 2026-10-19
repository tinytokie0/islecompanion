// ============================================================
// HavenBridge — two-way link between The Isle server and the
// Haven app.
//
// OUTBOUND: tails the NDJSON file the HavenPosition UE4SS mod
// writes (Mods/HavenPosition/Saved/events.ndjson) and POSTs the
// latest snapshot per player to the app's feed endpoint every
// 5 seconds.
//
// INBOUND: polls the app's garage command endpoint every 5
// seconds for park/restore commands, writes each into
// Mods/HavenPosition/Saved/commands.ndjson (the mod's inbox),
// tails the mod's acks.ndjson and reports the results back.
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
const CMDS_FILE = process.env.CMDS_FILE || "Mods/HavenPosition/Saved/commands.ndjson";
const ACKS_FILE = process.env.ACKS_FILE || "Mods/HavenPosition/Saved/acks.ndjson";
const SERVER_NAME = process.env.SERVER_NAME || "The Haven";
const POST_EVERY_MS = 5000;

// The garage command endpoint sits next to the feed endpoint
function garageEndpointFrom(endpoint) {
  return endpoint.replace(/\/functions\/.*$/, "/functions/garageCommandSync");
}
const GARAGE_ENDPOINT = garageEndpointFrom(ENDPOINT);

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

// ============================================================
// Garage commands (park / restore): app -> bridge -> mod
// ============================================================

let acksOffset = 0;
const reportedAcks = new Set();
const deliveredTypes = new Map(); // cmd id -> "garage" | "skin"

function appendCommandFile(row) {
  fs.mkdirSync(CMDS_FILE.replace(/[/\\][^/\\]+$/, ""), { recursive: true });
  fs.appendFileSync(CMDS_FILE, JSON.stringify(row) + "\n");
}

async function pollGarageCommands() {
  try {
    const res = await fetch(GARAGE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-feed-secret": SECRET },
      body: JSON.stringify({ action: "poll" }),
    });
    const body = await res.json().catch(() => ({}));
    for (const cmd of body.commands || []) {
      // The mod reads a flat, known-shape line; only the fields the given
      // action needs go on the wire.
      const row =
        cmd.command === "skin"
          ? {
              cmd: String(cmd.id),
              action: "skin",
              steam: String(cmd.steam_id),
              pattern: String(cmd.pattern || "default"),
              color: String(cmd.color || "#ffffff"),
            }
          : {
              cmd: String(cmd.id),
              action: cmd.command === "restore" ? "restore" : "park",
              steam: String(cmd.steam_id),
            };
      appendCommandFile(row);
      deliveredTypes.set(String(cmd.id), cmd.command === "skin" ? "skin" : "garage");
      console.log(`[HavenBridge] delivered ${cmd.command} command to the mod (${cmd.steam_id})`);
    }
  } catch (err) {
    console.error(`[HavenBridge] garage poll failed: ${err.message}`);
  }
}

async function reportResult(row) {
  try {
    await fetch(GARAGE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-feed-secret": SECRET },
      body: JSON.stringify({
        action: "result",
        id: String(row.cmd),
        type: deliveredTypes.get(String(row.cmd)) || "garage",
        ok: row.ok === true,
        error: row.error || null,
      }),
    });
  } catch (err) {
    console.error(`[HavenBridge] result report failed: ${err.message}`);
  }
}

function readNewAcks() {
  let stat;
  try {
    stat = fs.statSync(ACKS_FILE);
  } catch {
    return;
  }
  if (stat.size < acksOffset) acksOffset = 0;
  if (stat.size <= acksOffset) return;

  const fh = fs.openSync(ACKS_FILE, "r");
  try {
    const len = stat.size - acksOffset;
    const buf = Buffer.alloc(len);
    fs.readSync(fh, buf, 0, len, acksOffset);
    acksOffset = stat.size;
    for (const line of buf.toString("utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let row;
      try {
        row = JSON.parse(trimmed);
      } catch {
        continue;
      }
      if (row && row.cmd && !reportedAcks.has(String(row.cmd))) {
        reportedAcks.add(String(row.cmd));
        console.log(`[HavenBridge] mod ack: ${row.cmd} ok=${row.ok}`);
        reportResult(row);
      }
    }
  } finally {
    fs.closeSync(fh);
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

// Garage command loop
readNewAcks();
setInterval(() => {
  try {
    readNewAcks();
  } catch (err) {
    console.error(`[HavenBridge] ack read failed: ${err.message}`);
  }
}, 1000);
setInterval(pollGarageCommands, POST_EVERY_MS);
