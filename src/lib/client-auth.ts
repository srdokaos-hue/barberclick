import crypto from "crypto"

const SECRET = process.env.NEXTAUTH_SECRET ?? "barberclick-secret"

export function signClientToken(payload: {
  clientId: string; name: string; phone: string; barbershopId: string; slug: string
}) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64")
  const sig  = crypto.createHmac("sha256", SECRET).update(data).digest("hex")
  return `${data}.${sig}`
}

export function verifyClientToken(token: string) {
  try {
    const [data, sig] = token.split(".")
    const expected = crypto.createHmac("sha256", SECRET).update(data).digest("hex")
    if (sig !== expected) return null
    return JSON.parse(Buffer.from(data, "base64").toString()) as {
      clientId: string; name: string; phone: string; barbershopId: string; slug: string
    }
  } catch { return null }
}
