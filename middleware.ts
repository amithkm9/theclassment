import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Just get the session but don't redirect based on it
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Log the session for debugging (optional)
  console.log('Session:', session ? 'Authenticated' : 'Not authenticated')
  console.log('Current path:', req.nextUrl.pathname)

  // Always allow the request to proceed without any redirects
  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}