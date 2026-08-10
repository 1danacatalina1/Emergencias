import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }
  return { session, error: null };
}

export function requireRole(role: string, roles: string[]) {
  return roles.includes(role);
}
