import type { NextAuthConfig } from 'next-auth';

// Edge-safe config — no Node.js APIs (no bcrypt, no DB calls).
// Used by middleware.ts which runs on the Edge runtime.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/signin',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = !!(auth?.user as { isAdmin?: boolean })?.isAdmin;

      if (nextUrl.pathname.startsWith('/admin')) {
        return isAdmin;
      }
      if (
        nextUrl.pathname.startsWith('/books/add') ||
        /^\/books\/\d+\/edit$/.test(nextUrl.pathname)
      ) {
        return isLoggedIn;
      }
      return true;
    },
  },
};
