import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

function getAllowedDomains() {
  return (process.env.ALLOWED_EMAIL_DOMAIN || "")
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedEmail(email: string) {
  const domain = email.toLowerCase().split("@")[1];
  if (!domain) return false;

  return getAllowedDomains().includes(domain);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1日
  },

  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        return false;
      }

      const email =
        typeof profile?.email === "string" ? profile.email.toLowerCase() : "";

      const emailVerified =
        (profile as { email_verified?: boolean })?.email_verified === true;

      return emailVerified && isAllowedEmail(email);
    },

    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;

      if (pathname.startsWith("/auth")) {
        return true;
      }

      return !!auth;
    },
  },
});
