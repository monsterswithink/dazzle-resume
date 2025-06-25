import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;

  if (code) {
    // Redirect to a client-side page that handles the code
    return NextResponse.redirect(`${origin}/auth/handling?code=${code}`);
  }
  return NextResponse.redirect(`${origin}/dashboard?auth=error`);
}
