import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;

  // REDIRECT WITH CODE ONLY, do NOT call exchangeCodeForSession server-side
  if (code) {
    return NextResponse.redirect(`${origin}/dashboard?code=${code}`);
  }
  return NextResponse.redirect(`${origin}/dashboard?auth=error`);
}
