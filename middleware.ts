import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only log API calls to LinkedIn fetch endpoint
  if (request.nextUrl.pathname === '/api/linkedin/fetch') {
    console.log('LinkedIn Fetch Request:', {
      headers: Object.fromEntries(request.headers),
      url: request.url,
    })
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/api/linkedin/fetch',
}
