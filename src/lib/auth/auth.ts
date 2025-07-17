import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db, accounts, sessions, users, verificationTokens } from "../db";
import { verify } from "argon2";
import { eq } from "drizzle-orm";

class CustomError extends CredentialsSignin {
  code = "credential_not_match";
}

export async function authorizeWithCredentials(
  email: string,
  password: string
) {
  const [user] = await db
    .select({
      id: users.id,
      password: users.password,
      email: users.email,
      emailVerified: users.emailVerified,
      role: users.role,
      name: users.name,
    })
    .from(users)
    .where(eq(users.email, email));

  if (!user) return null;
  if (!user.password) return null;

  const isValid = await verify(user.password, password);

  if (!isValid) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
  };
}

export const { handlers, auth, unstable_update } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const user = await authorizeWithCredentials(
            credentials.email as string,
            credentials.password as string
          );

          if (!user) {
            throw new CustomError();
          }

          return user;
        } catch (error) {
          console.log("CREDENTIALS", error);
          throw new CustomError();
        }
      },
    }),
  ],
  pages: {
    error: "/sign-in",
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }
      if (trigger === "update" && session?.emailVerified !== undefined) {
        token.emailVerified = session.emailVerified;
      }
      if (trigger === "update" && session?.role !== undefined) {
        token.role = session.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role as "BASIC" | "PETSHOP" | "VETERINARIAN" | "ADMIN",
        emailVerified: token.emailVerified as Date | null,
      };
      return session;
    },
  },
});
