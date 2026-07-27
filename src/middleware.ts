import { NextResponse, type NextRequest } from "next/server";

const HOSTINGER_CHALLENGE_PREFIX = "/.well-known/hostinger-challenge/";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith(HOSTINGER_CHALLENGE_PREFIX)) {
    return new NextResponse(null, {
      status: 404,
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/.well-known/hostinger-challenge/:path*"]
};
