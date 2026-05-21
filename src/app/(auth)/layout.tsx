export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
                  background:"#f9fafb", padding:"16px" }}>
      {children}
    </div>
  )
}
