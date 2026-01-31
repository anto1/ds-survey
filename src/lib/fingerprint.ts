import { headers } from "next/headers";
import crypto from "crypto";

export async function generateFingerprint(): Promise<string> {
  const headersList = await headers();

  // Get IP from various headers (Vercel/Cloudflare compatible)
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const vercelIp = headersList.get("x-vercel-forwarded-for");

  const ip = vercelIp || forwardedFor?.split(",")[0] || realIp || "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";
  const salt = process.env.FINGERPRINT_SALT || "default-salt-change-me";

  const data = `${ip}:${userAgent}:${salt}`;

  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function getUserAgent(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get("user-agent");
}
