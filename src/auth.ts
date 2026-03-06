import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { user, account, session as sessionTable, verificationToken } from "@/db/schema";
import authConfig from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(
    db,
    // Our schema uses `id` PKs; adapter expects compound PKs — runtime works via $defaultFn
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { usersTable: user, accountsTable: account, sessionsTable: sessionTable, verificationTokensTable: verificationToken } as any
  ),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
