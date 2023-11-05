import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "lib/mongodb";
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import type { NextAuthOptions as NextAuthConfig } from "next-auth";
import { getServerSession } from "next-auth";
import argon2 from "argon2";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import Credentials from "next-auth/providers/credentials";

interface BaseAttributes {
  userId?: string;
  role?: string;
  location?: string;
  verifyStatus?: string;
  alertsEnabled?: false;
  provider?: string;
}

declare module "next-auth" {
  interface User extends BaseAttributes {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userRole?: string;
  }
}

export const config = {
  secret: process.env.NEXT_AUTH_SECRET,
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
  },
  providers: [
    Facebook({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    Twitter({
      clientId: process.env.TWITTER_ID,
      clientSecret: process.env.TWITTER_SECRET,
      version: "2.0",
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Credentials are missing.");
        }
        try {
          console.log("Starting authorization...");
          const client = await clientPromise;
          console.log("Connected to MongoDB");
          const db = client.db();
          const email = credentials?.email.toLowerCase();
          const user = await db.collection("users").findOne({ email });
          console.log("Fetched user:", user);
          if (!user) {
            throw { error: "email", message: "No user found with this email." };
          }

          const isValid = await argon2.verify(
            user.password,
            credentials.password
          );
          if (!isValid) {
            throw { error: "password", message: "Incorrect password." };
          }

          return {
            id: user._id.toString(),
            ...user,
          };
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (!user.role) {
        user.role = "user";
        user.location = "";
        user.verifyStatus = "none";
        user.alertsEnabled = false;
        user.provider = account?.provider;
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token = {
          ...token,
          ...user,
        };
      }
      return token;
    },
    async session({ session, user, token }) {
      if (token) {
        session.user = {
          ...session.user,
          ...token,
        };
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

// Helper function to get session without passing config every time
// https://next-auth.js.org/configuration/nextjs#getserversession
export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, config);
}
