import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { login } from "@/lib/auth";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

export const authConfig: NextAuthOptions = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        return await login({
          email: credentials.email,
          password: credentials.password
        });
      }
    })
  ],
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User & { role?: string } }) { // 添加 user 类型提示以包含 role
      if (user) {
        token.id = user.id;
        token.role = user.role; // 将用户的 role 添加到 token
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT & { role?: string } }) { // 添加 token 类型提示以包含 role
      if (session.user && token.id) {
        session.user.id = token.id as string;
        // 如果 token.role 未定义，则默认为 'USER'
        session.user.role = token.role ?? 'USER'; 
      }
      return session;
    }
  }
};
