// types/next-auth.d.ts
import NextAuth, { User as DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      emailVerified: Date | null;
      phone: string | null;
      image: string | null;
    };
  }

  interface User extends DefaultUser {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    phone: string | null;
    image: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    phone: string | null;
    image: string | null;
  }
}
