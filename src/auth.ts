import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { login } from "@/lib/auth";

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        return await login(credentials);
      }
    })
  ],
  pages: {
    signIn: "/login"
  }
} satisfies NextAuthConfig;
