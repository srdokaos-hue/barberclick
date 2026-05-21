import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token    = req.nextauth.token
    const path     = req.nextUrl.pathname
    const isAdmin  = path.startsWith("/dashboard") || path.startsWith("/agendamentos") ||
                     path.startsWith("/produtos")   || path.startsWith("/clientes")    ||
                     path.startsWith("/equipe")     || path.startsWith("/relatorios")  ||
                     path.startsWith("/configuracoes") || path.startsWith("/assinatura")

    if (isAdmin && !token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pub = ["/api/slots", "/api/appointments", "/api/services", "/api/auth"]
        if (pub.some(p => req.nextUrl.pathname.startsWith(p))) return true
        if (req.nextUrl.pathname.startsWith("/api/")) return !!token
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
}
