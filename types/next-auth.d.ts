// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    nisn: string;
    name: string;
    email: string;
    role: string;
    class?: string;
    major?: string;
    class_id?: number;
    major_id?: number;
  }

  interface Session {
    user: {
      id: string;
      nisn: string;
      name: string;
      email: string;
      role: string;
      class?: string;
      major?: string;
      class_id?: number;
      major_id?: number;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nisn: string;
    name: string;
    email: string;
    role: string;
    class?: string;
    major?: string;
    class_id?: number;
    major_id?: number;
  }
}
