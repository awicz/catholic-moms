'use server';

import { auth } from '@/lib/auth';
import sql from '@/lib/db';
import { bookSchema } from '@/lib/validations/book';
import type { BooksByCategory } from '@/types';

export async function getCategories() {
  const rows = await sql`
    SELECT id, name, slug FROM categories ORDER BY name
  `;
  return rows as { id: number; name: string; slug: string }[];
}

export async function getBooks(): Promise<BooksByCategory[]> {
  const rows = await sql`
    SELECT
      b.id,
      b.title,
      b.author,
      b.purchase_url,
      b.why_helpful,
      b.cover_image_url,
      b.added_by_id,
      b.added_by_name,
      b.created_at,
      c.id   AS category_id,
      c.name AS category_name,
      c.slug AS category_slug
    FROM books b
    JOIN book_categories bc ON bc.book_id = b.id
    JOIN categories c ON c.id = bc.category_id
    ORDER BY c.name, b.title
  `;

  const categoryMap = new Map<
    number,
    {
      category: { id: number; name: string; slug: string };
      books: Map<number, {
        id: number; title: string; author: string;
        purchaseUrl: string | null; whyHelpful: string | null;
        coverImageUrl: string | null; addedById: number | null;
        addedByName: string; createdAt: string;
        categories: { id: number; name: string; slug: string }[];
      }>;
    }
  >();

  for (const row of rows) {
    const catId = row.category_id as number;
    if (!categoryMap.has(catId)) {
      categoryMap.set(catId, {
        category: { id: catId, name: row.category_name as string, slug: row.category_slug as string },
        books: new Map(),
      });
    }

    const catEntry = categoryMap.get(catId)!;
    const bookId = row.id as number;

    if (!catEntry.books.has(bookId)) {
      catEntry.books.set(bookId, {
        id: bookId,
        title: row.title as string,
        author: row.author as string,
        purchaseUrl: row.purchase_url as string | null,
        whyHelpful: row.why_helpful as string | null,
        coverImageUrl: row.cover_image_url as string | null,
        addedById: row.added_by_id as number | null,
        addedByName: row.added_by_name as string,
        createdAt: String(row.created_at),
        categories: [],
      });
    }

    const book = catEntry.books.get(bookId)!;
    book.categories.push({ id: catId, name: row.category_name as string, slug: row.category_slug as string });
  }

  return Array.from(categoryMap.values()).map(({ category, books }) => ({
    category,
    books: Array.from(books.values()),
  }));
}

export async function getBookById(id: number) {
  const rows = await sql`
    SELECT
      b.id,
      b.title,
      b.author,
      b.purchase_url,
      b.why_helpful,
      b.cover_image_url,
      b.added_by_id,
      b.added_by_name,
      ARRAY_AGG(bc.category_id) FILTER (WHERE bc.category_id IS NOT NULL) AS category_ids
    FROM books b
    LEFT JOIN book_categories bc ON bc.book_id = b.id
    WHERE b.id = ${id}
    GROUP BY b.id
    LIMIT 1
  `;

  if (!rows[0]) return null;
  const row = rows[0];

  return {
    id: row.id as number,
    title: row.title as string,
    author: row.author as string,
    purchaseUrl: row.purchase_url as string | null,
    whyHelpful: row.why_helpful as string | null,
    coverImageUrl: row.cover_image_url as string | null,
    addedById: row.added_by_id as number | null,
    addedByName: row.added_by_name as string,
    categoryIds: (row.category_ids as number[] | null) ?? [],
  };
}

export async function addBook(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'You must be signed in to add a book.' };
  }

  const categoryIds = formData.getAll('categoryIds').map((v) => Number(v));

  const raw = {
    title: formData.get('title') as string,
    author: formData.get('author') as string,
    purchaseUrl: formData.get('purchaseUrl') as string,
    whyHelpful: formData.get('whyHelpful') as string,
    coverImageUrl: formData.get('coverImageUrl') as string,
    categoryIds,
  };

  const parsed = bookSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { title, author, purchaseUrl, whyHelpful, coverImageUrl } = parsed.data;
  const userId = Number(session.user.id);
  const userName = session.user.name ?? 'A group member';

  const [newBook] = await sql`
    INSERT INTO books (title, author, purchase_url, why_helpful, cover_image_url, added_by_id, added_by_name)
    VALUES (
      ${title.trim()},
      ${author.trim()},
      ${purchaseUrl || null},
      ${whyHelpful || null},
      ${coverImageUrl || null},
      ${userId},
      ${userName}
    )
    RETURNING id
  `;

  const bookId = newBook.id as number;

  for (const catId of parsed.data.categoryIds) {
    await sql`
      INSERT INTO book_categories (book_id, category_id)
      VALUES (${bookId}, ${catId})
      ON CONFLICT DO NOTHING
    `;
  }

  return { success: true };
}

export async function updateBook(bookId: number, formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'You must be signed in.' };
  }

  const existing = await getBookById(bookId);
  if (!existing) return { success: false, error: 'Book not found.' };

  const isOwner = existing.addedById === Number(session.user.id);
  const isAdmin = session.user.isAdmin === true;
  if (!isOwner && !isAdmin) {
    return { success: false, error: 'You can only edit your own books.' };
  }

  const categoryIds = formData.getAll('categoryIds').map((v) => Number(v));

  const raw = {
    title: formData.get('title') as string,
    author: formData.get('author') as string,
    purchaseUrl: formData.get('purchaseUrl') as string,
    whyHelpful: formData.get('whyHelpful') as string,
    coverImageUrl: formData.get('coverImageUrl') as string,
    categoryIds,
  };

  const parsed = bookSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { title, author, purchaseUrl, whyHelpful, coverImageUrl } = parsed.data;

  await sql`
    UPDATE books SET
      title           = ${title.trim()},
      author          = ${author.trim()},
      purchase_url    = ${purchaseUrl || null},
      why_helpful     = ${whyHelpful || null},
      cover_image_url = ${coverImageUrl || null}
    WHERE id = ${bookId}
  `;

  // Replace category associations
  await sql`DELETE FROM book_categories WHERE book_id = ${bookId}`;
  for (const catId of parsed.data.categoryIds) {
    await sql`
      INSERT INTO book_categories (book_id, category_id)
      VALUES (${bookId}, ${catId})
      ON CONFLICT DO NOTHING
    `;
  }

  return { success: true };
}

export async function deleteBook(bookId: number) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'You must be signed in.' };
  }

  const existing = await getBookById(bookId);
  if (!existing) return { success: false, error: 'Book not found.' };

  const isOwner = existing.addedById === Number(session.user.id);
  const isAdmin = session.user.isAdmin === true;
  if (!isOwner && !isAdmin) {
    return { success: false, error: 'You can only delete your own books.' };
  }

  // book_categories rows are cascade-deleted via FK constraint
  await sql`DELETE FROM books WHERE id = ${bookId}`;

  return { success: true };
}
