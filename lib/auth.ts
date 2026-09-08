const SESSION_COOKIE = "session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 días

export const sessionCookieName = SESSION_COOKIE;

function getSecret(): string | undefined {
  return process.env.AUTH_SECRET;
}

export function authConfigured(): boolean {
  return Boolean(process.env.APP_PASSWORD && getSecret());
}

async function hmac(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const buffer = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(): Promise<string> {
  const secret = getSecret();
  if (!secret) throw new Error("AUTH_SECRET no configurado");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const signature = await hmac(secret, String(expiresAt));
  return `${expiresAt}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  const secret = getSecret();
  if (!secret || !token) return false;
  const [expiresAtRaw, signature] = token.split(".");
  const expiresAt = Number(expiresAtRaw);
  if (!expiresAtRaw || !signature || Number.isNaN(expiresAt) || Date.now() > expiresAt) {
    return false;
  }
  const expected = await hmac(secret, expiresAtRaw);
  return expected === signature;
}
