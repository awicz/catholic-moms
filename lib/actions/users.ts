'use server';

import bcrypt from 'bcryptjs';
import { signUpSchema } from '@/lib/validations/user';
import sql from '@/lib/db';

export async function registerUser(formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
    };
  }

  const { name, email, password } = parsed.data;

  // Check for existing account
  const existing = await sql`
    SELECT id FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1
  `;
  if (existing.length > 0) {
    return { success: false, error: 'An account with that email already exists.' };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await sql`
    INSERT INTO users (name, email, password)
    VALUES (${name.trim()}, ${email.toLowerCase().trim()}, ${hashedPassword})
  `;

  return { success: true };
}
