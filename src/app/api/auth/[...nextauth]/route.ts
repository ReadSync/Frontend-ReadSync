import React from 'react'
import NextAuth from "next-auth";
import { getUserByEmail } from "../../../lib/action";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';

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

          if (!user) throw new Error("Email tidak ditemukan");

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) throw new Error("Password salah");

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            nisn: user.nisn,
            role: user.role,
            class_id: user.class_id,
            major_id: user.major_id,
            class_name: user.class_name,
            major_name: user.major_name,
          };
        } catch (error) {
          console.error("Auth error:", error);
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
        token.nisn = user.nisn;
        token.class_id = user.class_id;
        token.major_id = user.major_id;
        token.class_name = user.class_name;
        token.major_name = user.major_name;
      }
      return token;
    },

    async session({ session, token }: any) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.email = token.email;
      session.user.nisn = token.nisn;
      session.user.class_id = token.class_id;
      session.user.major_id = token.major_id;
      session.user.class_name = token.class_name;
      session.user.major_name = token.major_name;
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET || "fallback-secret",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
