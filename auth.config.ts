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
      const isProtected = nextUrl.pathname.startsWith('/books/add');
      if (isProtected) {
        return isLoggedIn;
      }
      return true;
    },
  },
};
