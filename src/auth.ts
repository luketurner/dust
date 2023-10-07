import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"
// import type { NextAuthOptions as NextAuthConfig } from "next-auth"
import { getServerSession } from "next-auth/next"
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/db/client";
import { redirect } from "next/navigation"

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation
declare module "next-auth/jwt" {
  interface JWT {
    /** The user's role. */
    userRole?: "admin"
  }
}

export const config = {
  adapter: PrismaAdapter(prisma),
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    GitHub({ clientId: process.env.AUTH_GITHUB_ID, clientSecret: process.env.AUTH_GITHUB_SECRET }),
  ],
  callbacks: {
    async jwt({ token }: any) {
      token.userRole = "admin"
      return token
    },
  },
}; // satisfies NextAuthConfig

// Helper function to get session without passing config every time
// https://next-auth.js.org/configuration/nextjs#getserversession
export function auth(...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]] | [NextApiRequest, NextApiResponse] | []) {
  return getServerSession(...args, config)
}

export async function getServerUser() {
  const session = await auth();

  if (!(session as any)?.user?.email) {
    return { session };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: (session as any).user.email
    },
  });

  return { user, session }
}

export async function getServerUserOrThrow() {
  const { session, user } = await getServerUser();
  if (!user || !session) {
    throw new Error('Unauthorized')
  }

  return { session, user };
}

export async function getServerUserOrRedirect(url?: string) {
  const { session, user } = await getServerUser();
  if (!user || !session) {
    redirect(url ?? '/');
  }

  return { session, user };
}

// We recommend doing your own environment variable validation
declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      NEXTAUTH_SECRET: string

      AUTH_GITHUB_ID: string
      AUTH_GITHUB_SECRET: string
    }
  }
}
