import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { decode } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth(async (req: NextRequest & { auth: unknown }) => {
  const { nextUrl } = req;

  // Decode the JWT directly so we can read custom fields like isAdmin
  // that are stored in the token but not surfaced on the Edge session object.
  const cookieName =
    process.env.NODE_ENV === 'production'
      ? '__Secure-authjs.session-token'
      : 'authjs.session-token';
  const token = req.cookies.get(cookieName)?.value;

  let isLoggedIn = false;
  let isAdmin = false;

  if (token) {
    try {
      const decoded = await decode({
        token,
        secret: process.env.AUTH_SECRET!,
        salt: cookieName,
      });
      isLoggedIn = !!decoded;
      isAdmin = decoded?.isAdmin === true;
    } catch {
      // Invalid token — treat as logged out
    }
  }

  if (nextUrl.pathname.startsWith('/admin')) {
    if (!isAdmin) {
      const signInUrl = new URL('/auth/signin', nextUrl);
      signInUrl.searchParams.set('callbackUrl', nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  if (
    nextUrl.pathname.startsWith('/books/add') ||
    /^\/books\/\d+\/edit$/.test(nextUrl.pathname)
  ) {
    if (!isLoggedIn) {
      const signInUrl = new URL('/auth/signin', nextUrl);
      signInUrl.searchParams.set('callbackUrl', nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/books/add', '/books/:id/edit', '/admin', '/admin/:path*'],
};
