import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the user is authenticated
  const protectedRoutes = ["/assessment", "/report", "/jobs", "/externship"]
  const currentPath = req.nextUrl.pathname

  if (!session) {
    // Redirect unauthenticated users to login
    if (protectedRoutes.includes(currentPath)) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  } else {
    // For authenticated users, check payment status
    const { data: profile } = await supabase
      .from("profiles")
      .select("atp_done, payment_done")
      .eq("id", session.user.id)
      .single()

    if (profile?.atp_done && !profile?.payment_done && currentPath !== "/payments") {
      // If ATP is done but payment is not, redirect to payments page
      return NextResponse.redirect(new URL("/payments", req.url))
    }

    if (!profile?.atp_done && currentPath !== "/app-to-tap") {
      // If ATP is not done, redirect to app-to-tap page
      return NextResponse.redirect(new URL("/app-to-tap", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

