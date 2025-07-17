// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      role: "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN";
      emailVerified: Date | null;
    };
  }

  interface User {
    id: string;
    name: string | null;
    email: string | null;
    role: "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN";
    emailVerified: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string | null;
    email: string | null;
    role: "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN";
    emailVerified: Date | null;
  }
}
