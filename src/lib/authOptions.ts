import NextAuth, { type NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("邮箱和密码不能为空")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error("用户不存在")
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isValid) {
          throw new Error("密码错误")
        }

        return user
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string | null | undefined
        session.user.role = token.role as 'ADMIN' | 'USER'
      }
      return session
    },
    async jwt({ token, user }) {
      const dbUser = await prisma.user.findFirst({
        where: { email: token.email as string }
      })
      
      if (!dbUser) {
        if (user) {
          token.id = user.id
        }
        return token
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        role: dbUser.role
      }
    }
  },
  pages: {
    signIn: "/login"
  },
  debug: process.env.NODE_ENV === "development"
}
