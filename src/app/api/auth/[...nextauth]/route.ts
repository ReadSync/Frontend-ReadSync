import React from 'react'
import NextAuth from "next-auth";
import { getUserByEmail } from "../../../lib/action";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import { a } from 'framer-motion/client';

export const authOptions: any = {
  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    CredentialsProvider({
        name: "Credentials",
        credentials: {
            email: { label: "Email", type: "text", placeholder: "Enter your email" },
            password: { label: "Password", type: "password", placeholder: "Enter your password" }
        },
        async authorize(credentials) {
            try {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("All fields are required");
                }

                const user = await getUserByEmail(credentials.email);

                if (!user) {
                    throw new Error("Email tidak ditemukan");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Password salah");
                }

                return {
                    id: user.id.toString(),
                    name: user.name,
                    email: user.email,
                    nisn: user.nisn,
                    role: user.role,
                };
            } catch (error: any) {
                console.error("Auth error:");
                throw new Error("Authentication failed");
            }
        },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: any) {
        if (user) {
            token.id = user.id;
            token.role = user.role;
            token.email = user.email;
        }
        return token;
    },

    async session({ session, token }: any) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.nisn = token.nisn as string;
      return session;
    },
  },

  session: {
    strategy: "jwt" as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET || "fallback-secret",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
