import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import BarberSidebar from "@/components/barber/BarberSidebar"
import BarberVendaFloat from "@/components/barber/BarberVendaFloat"

export default async function BarberLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session)                    redirect("/login")
  if (session.user.role === "ADMIN") redirect("/dashboard")
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--bg)" }}>
      <BarberSidebar/>
      <main style={{ flex:1, overflow:"auto", background:"var(--bg)", minWidth:0 }}>
        {children}
      </main>
      <BarberVendaFloat barberId={session.user.id}/>
    </div>
  )
}
