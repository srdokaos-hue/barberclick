import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/admin/Sidebar"
import VendaRapidaFloat from "@/components/admin/VendaRapidaFloat"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  if (session.user.role === "BARBER") redirect("/barber/dashboard")
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--bg)" }}>
      <Sidebar/>
      <main style={{ flex:1, overflow:"auto", background:"var(--bg)", minWidth:0 }}>
        {children}
      </main>
      <VendaRapidaFloat/>
    </div>
  )
}
