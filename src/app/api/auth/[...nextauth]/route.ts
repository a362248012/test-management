import NextAuth, { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email?.trim() || !credentials?.password?.trim()) {
            throw new Error("邮箱和密码不能为空");
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toString().toLowerCase() },
            select: { id: true, email: true, password: true }
          });

          if (user) {
            const isValid = await bcrypt.compare(
              credentials.password.toString(),
              user.password!
            );
            if (!isValid) throw new Error("密码错误");
            return { id: user.id as string, email: user.email as string };
          }

          // 新用户注册
          const hashedPassword = await bcrypt.hash(credentials.password.toString(), 12);
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email.toString().toLowerCase(),
              password: hashedPassword,
              name: credentials.email.toString().split('@')[0],
              emailVerified: new Date()
            }
          });
          return { id: newUser.id, email: newUser.email };
          
        } catch (error) {
          console.error("认证错误:", error);
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "development" ? "localhost" : undefined
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30天
    updateAge: 24 * 60 * 60, // 每天更新的会话
  },
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: '/login',
    newUser: '/register'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          email: token.email as string
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 登录成功后跳转首页
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    }
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
