import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  db,
  accounts,
  sessions,
  users,
  verificationTokens,
  userRoleDetails,
} from "../db";
import { verify } from "argon2";
import { eq } from "drizzle-orm";
import { r2Public } from "@/config";

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
      phone: users.phoneNumber,
      image: users.image,
      upgradeStatus: userRoleDetails.status,
      newRole: userRoleDetails.newRole,
    })
    .from(users)
    .innerJoin(userRoleDetails, eq(userRoleDetails.userId, users.id))
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
    phone: user.phone,
    image: user.image ? `${r2Public}/${user.image}` : null,
    upgradeStatus:
      user.upgradeStatus && user.newRole
        ? `${user.upgradeStatus}_${user.newRole}`
        : null,
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
  trustHost: true,
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.emailVerified = user.emailVerified;
        token.phone = user.phone;
        token.image = user.image;
      }
      if (trigger === "update") {
        if (session?.emailVerified !== undefined) {
          token.emailVerified = session.emailVerified;
        }
        if (session?.name !== undefined) {
          token.name = session.name;
        }
        if (session?.email !== undefined) {
          token.email = session.email;
        }
        if (session?.phone !== undefined) {
          token.phone = session.phone;
        }
        if (session?.image !== undefined) {
          token.image = session.image;
        }
      }
      return token;
    },
    session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        emailVerified: token.emailVerified as Date | null,
        phone: token.phone as string | null,
        image: token.image as string | null,
      };
      return session;
    },
  },
});
