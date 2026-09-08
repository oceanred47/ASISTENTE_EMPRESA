import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
  return NextResponse.redirect(new URL("/login", req.url));
}
