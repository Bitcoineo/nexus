import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const [found] = await db
          .select()
          .from(user)
          .where(eq(user.email, email))
          .limit(1);

        if (!found || !found.password) return null;

        const isValid = await bcrypt.compare(password, found.password);
        if (!isValid) return null;

        return {
          id: found.id,
          name: found.name,
          email: found.email,
          image: found.image,
        };
      },
    }),
  ],
} satisfies NextAuthConfig;
