import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { authConfig } from '@/auth.config';
import sql from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) return null;

        const rows = await sql`
          SELECT id, name, email, password, is_admin
          FROM users
          WHERE email = ${email.toLowerCase().trim()}
          LIMIT 1
        `;

        const user = rows[0];
        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.password as string);
        if (!passwordMatch) return null;

        return {
          id: String(user.id),
          name: user.name as string,
          email: user.email as string,
          isAdmin: user.is_admin as boolean,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // Fresh sign-in: copy fields from the authorize() return value into the token.
        token.id = user.id;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin === true;
      }
      // Ensure isAdmin is always a boolean, never undefined (handles old tokens)
      if (typeof token.isAdmin !== 'boolean') {
        token.isAdmin = false;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      session.user.isAdmin = token.isAdmin === true;
      return session;
    },
  },
  session: { strategy: 'jwt' },
});
