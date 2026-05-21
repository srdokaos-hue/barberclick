import Link from "next/link"

export default function SuccessPage({ params }: { params:{ slug:string } }) {
  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f9fafb" }}>
      <div style={{ textAlign:"center",padding:"40px 20px" }}>
        <div style={{ fontSize:48,marginBottom:16 }}>✅</div>
        <div style={{ fontSize:22,fontWeight:500,marginBottom:8 }}>Agendamento confirmado!</div>
        <div style={{ fontSize:14,color:"#6b7280",marginBottom:24 }}>
          Você receberá a confirmação no WhatsApp em breve.
        </div>
        <Link href={`/${params.slug}`} style={{
          display:"inline-block",padding:"12px 24px",borderRadius:10,
          background:"#111",color:"white",textDecoration:"none",fontSize:14,fontWeight:500,
        }}>
          Fazer outro agendamento
        </Link>
      </div>
    </div>
  )
}
