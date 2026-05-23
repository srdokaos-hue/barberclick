import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages:   { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: { email:{}, password:{} },
      async authorize(credentials) {
        if(!credentials?.email||!credentials?.password) return null
        const barber = await prisma.barber.findUnique({
          where:   { email: credentials.email },
          include: { barbershop:{ select:{ id:true, plan:true } } },
        })
        if(!barber||!barber.active) return null
        const valid = await bcrypt.compare(credentials.password, barber.passwordHash)
        if(!valid) return null
        return { id:barber.id, name:barber.name, email:barber.email,
          barbershopId:barber.barbershopId, role:barber.role, plan:barber.barbershop.plan } as any
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if(user) { token.barbershopId=(user as any).barbershopId; token.role=(user as any).role; token.plan=(user as any).plan }
      return token
    },
    session({ session, token }) {
      session.user.id=token.sub as string; session.user.barbershopId=token.barbershopId as string
      session.user.role=token.role as string; session.user.plan=token.plan as string
      return session
    },
  },
}
