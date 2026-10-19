import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets, staticEgress } from 'base44:runtime';

// The Isle Evrima RCON is a custom binary TCP protocol (NOT Source RCON):
//   auth frame  = 0x01 + password bytes
//   exec frame  = 0x02 + command byte + comma-separated args
// The server sends exactly one plain-text response per frame.
const MSG_AUTH = 0x01;
const MSG_EXEC = 0x02;
const CMD_SERVER_DETAILS = 0x12; // read-only: server details
const CONNECT_TIMEOUT_MS = 8000;
const READ_TIMEOUT_MS = 8000;

// Parse the serverdetails response. Only safe, non-sensitive fields are
// returned — ServerPassword is deliberately never read or forwarded.
function parseServerDetails(raw) {
  let text = raw;
  // Responses are optionally prefixed with "[timestamp] " and a type name.
  if (text.startsWith('[')) {
    const end = text.indexOf(']');
    if (end !== -1) text = text.slice(end + 1);
  }
  text = text.replace(/^ServerDetails/, '');
  const pick = (key) => {
    const m = text.match(new RegExp(key + '\\s*:\\s*([^,]*)'));
    return m ? m[1].trim() : null;
  };
  const num = (key) => {
    const v = pick(key);
    return v === null || v === '' ? null : parseInt(v, 10);
  };
  const bool = (key) => pick(key) === 'true';
  return {
    name: pick('ServerName'),
    map: pick('ServerMap'),
    maxPlayers: num('ServerMaxPlayers'),
    currentPlayers: num('ServerCurrentPlayers'),
    dayLengthMinutes: num('ServerDayLengthMinutes'),
    nightLengthMinutes: num('ServerNightLengthMinutes'),
    enableMutations: bool('bEnableMutations'),
    enableHumans: bool('bEnableHumans'),
    queueEnabled: bool('bQueueEnabled'),
    whitelist: bool('bServerWhitelist'),
    spawnAI: bool('bSpawnAI'),
    enableGlobalChat: bool('bEnableGlobalChat'),
  };
}

// Read one response frame with a hard timeout. The protocol is strictly
// request-response, so a single read is enough per frame.
async function readOnce(reader, timeoutMs) {
  const readPromise = reader.read();
  readPromise.catch(() => {}); // timeout/close may orphan this read
  let timer = null;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error('Server did not respond in time.')),
      timeoutMs
    );
  });
  try {
    const result = await Promise.race([readPromise, timeoutPromise]);
    if (!result || result.done || !result.value) return '';
    return new TextDecoder().decode(result.value);
  } finally {
    clearTimeout(timer);
  }
}

export default async function (req) {
  try {
    // Members only: never an unauthenticated public endpoint.
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json(
        { success: false, error: 'Sign in to check the server status.' },
        { status: 401 }
      );
    }

    // Credentials come from backend secrets only — never logged or returned.
    // Accept a host that accidentally carries "host:port" or a scheme; the
    // port always comes from its own secret.
    const rawHost = secrets.get('EVRIMA_RCON_HOST') || '';
    const host = rawHost
      .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
      .replace(/:\d+$/, '')
      .trim();
    const port = Number((secrets.get('EVRIMA_RCON_PORT') || '').trim());
    const password = secrets.get('EVRIMA_RCON_PASSWORD');
    if (!host || !port || !password) {
      return Response.json({
        success: false,
        error: 'Server RCON credentials are not configured.',
      });
    }

    // Raw TCP through the platform's static-egress runtime.
    let socket;
    try {
      socket = await staticEgress.connect({ hostname: host, port });
    } catch (e) {
      const reason = e && e.message ? e.message : 'unknown error';
      return Response.json({
        success: false,
        error: `Could not reach the server over TCP: ${reason}`,
      });
    }

    const encoder = new TextEncoder();
    try {
      const reader = socket.readable.getReader();
      const writer = socket.writable.getWriter();

      // 1. Authenticate
      const authFrame = new Uint8Array(1 + password.length);
      authFrame[0] = MSG_AUTH;
      authFrame.set(encoder.encode(password), 1);
      await writer.write(authFrame);
      const authRes = await readOnce(reader, READ_TIMEOUT_MS);
      if (!authRes.includes('Password Accepted')) {
        return Response.json({
          success: false,
          error: 'Server rejected the RCON password.',
        });
      }

      // 2. Read-only serverdetails
      const cmd = new Uint8Array(2);
      cmd[0] = MSG_EXEC;
      cmd[1] = CMD_SERVER_DETAILS;
      await writer.write(cmd);
      const res = await readOnce(reader, READ_TIMEOUT_MS);
      if (!res) {
        return Response.json({
          success: false,
          error: 'Server closed the connection without a response.',
        });
      }
      return Response.json({
        success: true,
        serverDetails: parseServerDetails(res),
      });
    } catch (e) {
      const reason = e && e.message ? e.message : 'unknown error';
      return Response.json({
        success: false,
        error: `RCON request failed: ${reason}`,
      });
    } finally {
      // Always clean up the socket.
      try {
        await socket.close();
      } catch {
        // already closed
      }
    }
  } catch (error) {
    // Never log credentials or raw server payloads.
    console.error('evrimaServerStatus failed');
    return Response.json(
      { success: false, error: 'Internal error.' },
      { status: 500 }
    );
  }
}