import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE = "booking_admin";

function tokenFor(password: string) {
  const secret = process.env.ADMIN_PASSWORD || "";
  return crypto.createHmac("sha256", secret).update(password).digest("hex");
}

export async function isAdmin() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const c = (await cookies()).get(COOKIE)?.value;
  return c === tokenFor(password);
}

export function adminToken() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD is missing.");
  return tokenFor(password);
}

export const adminCookie = COOKIE;
