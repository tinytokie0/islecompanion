# HavenPosition — live position feed for The Haven

Two pieces work together to put live player markers on your website's live map:

1. **`Scripts/main.lua`** — a UE4SS Lua mod that runs on your The Isle Evrima game server. Every 5 seconds it records each online player's steam id, name, species, growth, vitals and position to `Mods/HavenPosition/Saved/events.ndjson` on the server.
2. **`haven-bridge.mjs`** — a small Node.js script (Node 18+) that tails that file and forwards the snapshots to your app's feed endpoint, which feeds the live map, quests and playtime rewards.

## 1. Install the UE4SS mod on the game server

1. Install UE4SS on your Evrima dedicated server (the standard gamehostbros guide covers it).
2. Copy the `HavenPosition` folder (containing `Scripts/main.lua`) into UE4SS's `Mods/` folder, so you have:

   ```
   Mods\
     HavenPosition\
       Scripts\
         main.lua
   ```

3. Enable it in `Mods/mods.txt` by adding a line:

   ```
   HavenPosition : 1
   ```

4. Restart the server. `UE4SS.log` should show:

   ```
   [HavenPosition] Mod loaded
   [HavenPosition] Presence heartbeat hook registered (SetAdminCred)
   [HavenPosition] Presence refresh tick started (15s interval)
   [HavenPosition] Snapshot tick started (5000ms interval)
   ```

## 2. Run the bridge

The bridge can run on any machine that can read the server's files — the game server host itself is simplest.

1. Publish the app, then find the feed endpoint URL in the app dashboard under **Code → Functions → dinoFeedIngest** (it is your app's URL plus `/functions/dinoFeedIngest`).
2. Copy the `ARKANIS_FEED_SECRET` value from the app dashboard **Secrets** page.
3. Fill in the config at the top of `haven-bridge.mjs` (or use `ENDPOINT` / `SECRET` environment variables), then run it from the game server root directory:

   ```
   node haven-bridge.mjs
   ```

Within about a minute the live map starts showing player markers, positions update every 5 seconds, and plugin-fed players count toward quests and playtime rewards.

## Notes

- The app's map interprets engine coordinates the same way the game HUD does (Y as latitude, X as longitude) — no manual conversion needed.
- `events.ndjson` grows about 600 bytes per online player per 5 seconds. If it becomes large, stop the server, delete the file, and restart; the mod starts a fresh one.
- Positions only exist while the mod and bridge are running; when a player's feed goes stale the map keeps their last known spot until the app marks them offline.
