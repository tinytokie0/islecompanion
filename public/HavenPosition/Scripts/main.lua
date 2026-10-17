-- ============================================================
-- HavenPosition
-- UE4SS Lua mod for The Isle Evrima (dedicated server).
--
-- Every 5 seconds it snapshots each online player's dino
-- (steam id, player name, species, growth, vitals and
-- engine-space position) and appends one JSON line per player
-- to:  Mods/HavenPosition/Saved/events.ndjson
--
-- The companion bridge script (haven-bridge.mjs) tails that
-- file and forwards the snapshots to the Haven web app feed
-- endpoint, which powers the live map, quests and rewards.
--
-- GARAGE (park / restore): the bridge writes one flat JSON
-- command per line into Mods/HavenPosition/Saved/commands.ndjson
--   {"cmd":"<id>","action":"park","steam":"<steamid>"}
--   {"cmd":"<id>","action":"restore","steam":"<steamid>"}
-- The mod executes each command once (park saves the dino's
-- stats into garage.ndjson and removes it from the world;
-- restore respawns the stored dino for that player), then
-- appends an ack line to Mods/HavenPosition/Saved/acks.ndjson,
-- which the bridge reports back to the app.
--
-- Safety rules followed (per the EVRIMA community modding
-- reference): no FindAllOf on players/pawns, no UObject
-- cached across ticks, every engine read pcall-wrapped,
-- presence-registry enumeration by steam id.
-- ============================================================

local MOD_NAME = "HavenPosition"
local INTERVAL_MS = 5000
local EVENTS_FILE = "Mods/HavenPosition/Saved/events.ndjson"
local CMDS_FILE = "Mods/HavenPosition/Saved/commands.ndjson"
local ACKS_FILE = "Mods/HavenPosition/Saved/acks.ndjson"
local GARAGE_FILE = "Mods/HavenPosition/Saved/garage.ndjson"

-- ---- logging --------------------------------------------------

local function log(msg)
    print(string.format("[%s] %s\n", MOD_NAME, tostring(msg)))
end

-- ---- engine helpers (verified Evrima patterns) -----------------

-- Find the server's game mode. The class name differs per mode,
-- so candidates are tried in order. pcall-wrapped because
-- FindFirstOf can crash for a class with no live instances.
local function findGameMode()
    local candidates = { "BP_SurvivalGameMode_C", "TISurvivalGameMode", "TIGameModeBase", "GameModeBase" }
    for _, name in ipairs(candidates) do
        local gm
        pcall(function() gm = FindFirstOf(name) end)
        if gm ~= nil then return gm end
    end
    return nil
end

-- tostring that also handles FString/FName userdata wrappers.
local function safeString(value)
    if value == nil then return "" end
    local ok, s = pcall(function() return tostring(value) end)
    if ok and type(s) == "string" and s ~= "" and not s:find("^UObject") then return s end
    local okT, t = pcall(function() return value:ToString() end)
    if okT and type(t) == "string" then return t end
    return ""
end

-- A controller's LIVE pawn, or nil. K2_GetPawn() returns a non-nil
-- wrapper around a null pawn when the player exists but has not
-- spawned a dino yet (spawn-zone select, mid-respawn); calling
-- methods on that wrapper crashes the server. GetAddress() ~= 0
-- separates a real pawn from a nullptr wrapper.
local function livePawnFromCtrl(ctrl)
    if ctrl == nil then return nil end
    local pawn
    pcall(function() pawn = ctrl:K2_GetPawn() end)
    if pawn == nil then return nil end
    local addr
    pcall(function() addr = pawn:GetAddress() end)
    if addr == nil or addr == 0 then return nil end
    return pawn
end

-- Steam id from a controller. Primary: GetSteamId() UFunction.
-- Fallback: SteamId field access (more stable on some wrappers).
local function getControllerSteamId(ctrl)
    if ctrl == nil then return "" end
    local sId
    pcall(function() sId = ctrl:GetSteamId() end)
    if sId ~= nil then
        local s = safeString(sId)
        if s ~= "" and not s:find("^UObject") then return s end
    end
    local field
    pcall(function() field = ctrl.SteamId end)
    if field ~= nil then
        local s = safeString(field)
        if s ~= "" then return s end
    end
    return ""
end

-- Class full names look like
-- "BlueprintGeneratedClass /Game/.../BP_Tyrannosaurus_C". Strip the
-- leading class-type word to get just the path.
local function stripClassPrefix(s)
    if s == nil then return "" end
    s = tostring(s)
    return string.match(s, "^%S+%s+(.+)$") or s
end

-- ---- JSON write helpers (no require, no external library)------

local function jsonEscape(s)
    if s == nil then return "" end
    s = tostring(s)
    s = s:gsub("\\", "\\\\")
    s = s:gsub('"', '\\"')
    s = s:gsub("\n", "\\n")
    s = s:gsub("\r", "\\r")
    s = s:gsub("\t", "\\t")
    return s
end

local function jsonNum(v)
    if v == nil or v ~= v then return "null" end -- nil or NaN
    return string.format("%.3f", v)
end

-- ---- presence registry (production-safe player enumeration)----
-- Players are enumerated ONLY through this registry, resolved by
-- steam id via GetControllerBySteamId. FindAllOf("TIPlayerController")
-- and AllPlayerCharacters retain stale entries that crash on access.

local presenceRegistry = {}
local PRESENCE_EXPIRY_SEC = 180

local function presenceUpdate(steam)
    if steam == nil or steam == "" then return end
    local s = tostring(steam)
    if not presenceRegistry[s] then
        presenceRegistry[s] = { firstSeen = os.time() }
    end
    presenceRegistry[s].lastSeen = os.time()
end

local function presenceRegisterHook()
    local ok, err = pcall(function()
        RegisterHook("/Script/TheIsle.TIPlayerController:SetAdminCred", function(ctrlParam, _bool)
            local self_
            pcall(function() self_ = ctrlParam:get() end)
            if self_ == nil then return end
            local steamStr = getControllerSteamId(self_)
            if steamStr ~= "" then
                presenceUpdate(steamStr)
            end
        end)
    end)
    if ok then
        log("Presence heartbeat hook registered (SetAdminCred)")
    else
        log("Presence heartbeat hook FAILED: " .. tostring(err))
    end
end

local function presenceStartRefreshTick()
    if LoopInGameThreadWithDelay == nil then return end
    LoopInGameThreadWithDelay(15000, function()
        local gm = findGameMode()
        if gm == nil then return end
        local now = os.time()
        for steam, entry in pairs(presenceRegistry) do
            local ctrl
            pcall(function() ctrl = gm:GetControllerBySteamId(steam) end)
            if ctrl == nil then
                presenceRegistry[steam] = nil
            else
                entry.lastSeen = now
            end
        end
    end)
    log("Presence refresh tick started (15s interval)")
end

local function enumerateOnlinePlayers()
    local results = {}
    local gm = findGameMode()
    if gm == nil then return results end
    local now = os.time()
    for steam, entry in pairs(presenceRegistry) do
        if (now - entry.lastSeen) > PRESENCE_EXPIRY_SEC then
            presenceRegistry[steam] = nil
        else
            local ctrl
            pcall(function() ctrl = gm:GetControllerBySteamId(steam) end)
            if ctrl == nil then
                presenceRegistry[steam] = nil
            else
                local pawn = livePawnFromCtrl(ctrl)
                results[#results + 1] = { controller = ctrl, pawn = pawn, steam = steam }
            end
        end
    end
    return results
end

-- ---- snapshot building -----------------------------------------

local function buildLine(p, ts)
    local pawn = p.pawn
    local ctrl = p.controller

    local species = ""
    pcall(function()
        local cls = pawn:GetClass():GetFullName()
        species = stripClassPrefix(cls)
    end)

    local growth = nil
    pcall(function() growth = pawn:GetGrowth() end)

    local loc = nil
    pcall(function() loc = pawn:K2_GetActorLocation() end)
    if loc == nil then return nil end -- no position: nothing this tick can use

    local hp, hpMax, hunger, hungerMax, thirst, thirstMax, stamina, staminaMax
    pcall(function() hp = pawn:GetHealth() end)
    pcall(function() hpMax = pawn:GetMaxHealth() end)
    pcall(function() hunger = pawn:GetHunger() end)
    pcall(function() hungerMax = pawn:GetMaxHunger() end)
    pcall(function() thirst = pawn:GetThirst() end)
    pcall(function() thirstMax = pawn:GetMaxThirst() end)
    pcall(function() stamina = pawn:GetStamina() end)
    pcall(function() staminaMax = pawn:GetMaxStamina() end)

    local name = ""
    pcall(function()
        local ps = ctrl.PlayerState
        if ps ~= nil then name = safeString(ps:GetPlayerName()) end
    end)

    return string.format(
        '{"ts":%d,"steam":"%s","name":"%s","species":"%s","growth":%s,' ..
        '"pos":{"x":%s,"y":%s,"z":%s},' ..
        '"hp":%s,"hpMax":%s,"hunger":%s,"hungerMax":%s,' ..
        '"thirst":%s,"thirstMax":%s,"stamina":%s,"staminaMax":%s}',
        ts,
        jsonEscape(p.steam),
        jsonEscape(name),
        jsonEscape(species),
        jsonNum(growth),
        jsonNum(loc.X), jsonNum(loc.Y), jsonNum(loc.Z),
        jsonNum(hp), jsonNum(hpMax),
        jsonNum(hunger), jsonNum(hungerMax),
        jsonNum(thirst), jsonNum(thirstMax),
        jsonNum(stamina), jsonNum(staminaMax)
    )
end

-- ---- file output ------------------------------------------------

local function appendLines(path, lines)
    if #lines == 0 then return end
    local f = io.open(path, "ab")
    if f == nil then
        log("Could not open " .. path)
        return
    end
    for _, line in ipairs(lines) do
        f:write(line)
        f:write("\n")
    end
    f:close()
end

-- Lua has no mkdir; create the Saved folder on first write failure.
local function ensureSavedDir()
    local f = io.open(EVENTS_FILE, "ab")
    if f ~= nil then f:close() return true end
    os.execute('mkdir "Mods\\HavenPosition\\Saved" 2>NUL')
    f = io.open(EVENTS_FILE, "ab")
    if f ~= nil then f:close() return true end
    return false
end

-- ---- snapshot loop ----------------------------------------------

local function snapshotOnce()
    local players = enumerateOnlinePlayers()
    local lines = {}
    local now = os.time()
    for _, p in ipairs(players) do
        if p.pawn ~= nil then -- skip players on the spawn-zone select screen
            local ok, line = pcall(buildLine, p, now)
            if ok and line ~= nil then
                lines[#lines + 1] = line
            end
        end
    end
    appendLines(EVENTS_FILE, lines)
end

-- ============================================================
-- GARAGE COMMANDS (park / restore)
-- ============================================================

-- Flat JSON field extractor for the known-shape command and
-- garage lines (no JSON library available in the mod).
local function flatGet(line, key)
    if line == nil then return nil end
    local v = line:match('"' .. key .. '"%s*:%s*"([^"]*)"')
    if v ~= nil then return v end
    return line:match('"' .. key .. '"%s*:%s*(-?[%d%.]+)')
end

local function flatNum(line, key)
    local v = flatGet(line, key)
    if v == nil then return nil end
    return tonumber(v)
end

-- Read pending commands and clear the inbox so each runs once.
local function readAndClearCommands()
    local f = io.open(CMDS_FILE, "rb")
    if f == nil then return {} end
    local content = f:read("*a")
    f:close()
    local c = io.open(CMDS_FILE, "wb")
    if c ~= nil then c:close() end
    local cmds = {}
    for line in string.gmatch(content or "", "[^\r\n]+") do
        local cmd = flatGet(line, "cmd")
        local action = flatGet(line, "action")
        local steam = flatGet(line, "steam")
        if cmd ~= nil and cmd ~= "" and action ~= nil and steam ~= nil and steam ~= "" then
            cmds[#cmds + 1] = { cmd = cmd, action = action, steam = steam }
        end
    end
    return cmds
end

local function ack(cmdId, ok, err)
    appendLines(ACKS_FILE, { string.format(
        '{"cmd":"%s","ok":%s,"error":"%s"}',
        jsonEscape(cmdId), ok and "true" or "false", jsonEscape(err or "")
    ) })
end

-- Controller + live pawn for a steam id, via the game mode.
local function findPlayer(steam)
    local gm = findGameMode()
    if gm == nil then return nil, nil, "game mode not found" end
    local ctrl
    pcall(function() ctrl = gm:GetControllerBySteamId(steam) end)
    if ctrl == nil then return nil, nil, "player not online" end
    local pawn = livePawnFromCtrl(ctrl)
    return ctrl, pawn, nil
end

-- PARK: save the dino's stats, then remove it from the world
-- (the player returns to the spawn menu).
local function executePark(cmd)
    local ctrl, pawn, err = findPlayer(cmd.steam)
    if pawn == nil then
        ack(cmd.cmd, false, err or "player has no live dino")
        return
    end

    local species = ""
    pcall(function() species = stripClassPrefix(pawn:GetClass():GetFullName()) end)
    local growth
    pcall(function() growth = pawn:GetGrowth() end)
    local loc
    pcall(function() loc = pawn:K2_GetActorLocation() end)
    local hp, hunger, thirst, stamina
    pcall(function() hp = pawn:GetHealth() end)
    pcall(function() hunger = pawn:GetHunger() end)
    pcall(function() thirst = pawn:GetThirst() end)
    pcall(function() stamina = pawn:GetStamina() end)

    -- stored growth is a percentage (GetGrowth is a 0..1 fraction)
    appendLines(GARAGE_FILE, { string.format(
        '{"ts":%d,"steam":"%s","species":"%s","growth":%s,' ..
        '"pos":{"x":%s,"y":%s,"z":%s},' ..
        '"hp":%s,"hunger":%s,"thirst":%s,"stamina":%s}',
        os.time(),
        jsonEscape(cmd.steam),
        jsonEscape(species),
        jsonNum(growth ~= nil and growth * 100 or nil),
        jsonNum(loc ~= nil and loc.X or nil),
        jsonNum(loc ~= nil and loc.Y or nil),
        jsonNum(loc ~= nil and loc.Z or nil),
        jsonNum(hp), jsonNum(hunger), jsonNum(thirst), jsonNum(stamina)
    ) })

    local destroyed = false
    pcall(function() pawn:K2_DestroyActor() destroyed = true end)
    if not destroyed then
        pcall(function() pawn:DestroyActor() destroyed = true end)
    end
    if destroyed then
        log("Parked dino for steam " .. cmd.steam)
        ack(cmd.cmd, true, "")
    else
        ack(cmd.cmd, false, "could not remove the dino from the world")
    end
end

-- RESTORE: respawn the player's most recently parked dino.
local function executeRestore(cmd)
    local ctrl, pawn = findPlayer(cmd.steam)
    if ctrl == nil then
        ack(cmd.cmd, false, "player not online")
        return
    end
    if pawn ~= nil then
        ack(cmd.cmd, false, "player already has a live dino")
        return
    end

    -- most recent stored dino for this steam id
    local row = nil
    local f = io.open(GARAGE_FILE, "rb")
    if f ~= nil then
        local content = f:read("*a")
        f:close()
        for line in string.gmatch(content or "", "[^\r\n]+") do
            if flatGet(line, "steam") == cmd.steam then row = line end
        end
    end
    if row == nil then
        ack(cmd.cmd, false, "no stored dino for this player")
        return
    end

    local species = flatGet(row, "species") or ""
    local growth = flatNum(row, "growth")
    local posX = tonumber(row:match('"pos"%s*:%s*{%s*"x"%s*:%s*(-?[%d%.]+)'))
    local posY = tonumber(row:match('"pos"%s*:%s*{.-"y"%s*:%s*(-?[%d%.]+)'))
    local posZ = tonumber(row:match('"pos"%s*:%s*{.-"z"%s*:%s*(-?[%d%.]+)'))
    local hp = flatNum(row, "hp")
    local hunger = flatNum(row, "hunger")
    local thirst = flatNum(row, "thirst")
    local stamina = flatNum(row, "stamina")

    local cls = nil
    pcall(function() cls = LoadAsset(species) end)
    if cls == nil then
        ack(cmd.cmd, false, "could not load the stored dino class")
        return
    end

    local newPawn = nil
    pcall(function() newPawn = SpawnObject(cls, ctrl) end)
    if newPawn == nil then
        ack(cmd.cmd, false, "could not spawn the stored dino")
        return
    end

    -- restore stats and place it back where it was parked
    pcall(function() if growth ~= nil then newPawn:SetGrowth(growth / 100) end end)
    pcall(function()
        if posX ~= nil and posY ~= nil and posZ ~= nil then
            newPawn:K2_SetActorLocation({ X = posX, Y = posY, Z = posZ })
        end
    end)
    pcall(function() if hp ~= nil then newPawn:SetHealth(hp) end end)
    pcall(function() if hunger ~= nil then newPawn:SetHunger(hunger) end end)
    pcall(function() if thirst ~= nil then newPawn:SetThirst(thirst) end end)
    pcall(function() if stamina ~= nil then newPawn:SetStamina(stamina) end end)
    pcall(function() ctrl:Possess(newPawn) end)

    log("Restored dino for steam " .. cmd.steam)
    ack(cmd.cmd, true, "")
end

local function processCommands()
    local cmds = readAndClearCommands()
    for _, cmd in ipairs(cmds) do
        if cmd.action == "park" then
            local ok, err = pcall(executePark, cmd)
            if not ok then ack(cmd.cmd, false, "park failed: " .. tostring(err)) end
        elseif cmd.action == "restore" then
            local ok, err = pcall(executeRestore, cmd)
            if not ok then ack(cmd.cmd, false, "restore failed: " .. tostring(err)) end
        else
            ack(cmd.cmd, false, "unknown action")
        end
    end
end

-- ---- boot wiring -------------------------------------------------

log("Mod loaded")
ensureSavedDir()
-- start acks clean so the bridge only tails fresh results
do
    local c = io.open(ACKS_FILE, "wb")
    if c ~= nil then c:close() end
end
presenceRegisterHook()
presenceStartRefreshTick()
if LoopInGameThreadWithDelay ~= nil then
    LoopInGameThreadWithDelay(INTERVAL_MS, snapshotOnce)
    log("Snapshot tick started (" .. INTERVAL_MS .. "ms interval)")
    LoopInGameThreadWithDelay(5000, processCommands)
    log("Garage command tick started (5s interval)")
else
    log("LoopInGameThreadWithDelay unavailable — mod cannot run")
end
