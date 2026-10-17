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
-- Safety rules followed (per the EVRIMA community modding
-- reference): no FindAllOf on players/pawns, no UObject
-- cached across ticks, every engine read pcall-wrapped,
-- presence-registry enumeration by steam id.
-- ============================================================

local MOD_NAME = "HavenPosition"
local INTERVAL_MS = 5000
local EVENTS_FILE = "Mods/HavenPosition/Saved/events.ndjson"

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

-- ---- JSON write helpers (no require, no external library) ------

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

-- ---- presence registry (production-safe player enumeration) ----
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

-- ---- boot wiring -------------------------------------------------

log("Mod loaded")
ensureSavedDir()
presenceRegisterHook()
presenceStartRefreshTick()
if LoopInGameThreadWithDelay ~= nil then
    LoopInGameThreadWithDelay(INTERVAL_MS, snapshotOnce)
    log("Snapshot tick started (" .. INTERVAL_MS .. "ms interval)")
else
    log("LoopInGameThreadWithDelay unavailable — mod cannot run")
end
