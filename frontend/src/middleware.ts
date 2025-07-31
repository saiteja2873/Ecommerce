// src/middleware.ts
import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

// Optional: apply middleware only to routes (you can remove this if it's now a no-op)
export const config = {
  matcher: ["/auth/:path*", "/account/:path*", "/cart/:path*", "/checkout/:path*"],
};
