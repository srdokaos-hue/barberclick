import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const ADMIN_ROUTES = ["/dashboard","/agendamentos","/produtos","/clientes","/equipe","/relatorios","/configuracoes","/assinatura"]
const BARBER_ROUTES = ["/barber"]

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const role  = (token?.role as string) || "ADMIN"
    const path  = req.nextUrl.pathname

    // Barbeiro tentando acessar área do admin → redireciona para o painel dele
    if(role==="BARBER" && ADMIN_ROUTES.some(r=>path.startsWith(r))) {
      return NextResponse.redirect(new URL("/barber/dashboard", req.url))
    }
    // Admin tentando acessar área do barbeiro → redireciona para admin
    if(role==="ADMIN" && path.startsWith("/barber")) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  },
  { callbacks: { authorized: ({ token }) => !!token } }
)

export const config = {
  matcher: [
    "/dashboard/:path*", "/agendamentos/:path*", "/produtos/:path*",
    "/clientes/:path*",  "/equipe/:path*",        "/relatorios/:path*",
    "/configuracoes/:path*", "/assinatura/:path*", "/barber/:path*",
  ],
}
