import { withAuth } from "next-auth/middleware"

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware
export default withAuth({
  pages: {
    signIn: "/",
    error: "/error",
  },
  secret: process.env.NEXT_AUTH_SECRET,
  callbacks: {
    authorized({ req, token }) {
      // `/admin` requires admin role
      if (req.nextUrl.pathname === "/admin") {
        return token?.role === "admin";
      }
      return !!token;
    },
  },
});

export const config = { matcher: ["/admin", "/preferences"] }
