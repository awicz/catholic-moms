/**
 * Client-safe Google Books utility.
 * No server directive — safe to import in client components.
 */

/**
 * Extracts an ISBN-10 / ISBN-13 / ASIN from an Amazon product URL.
 * Handles patterns:  /dp/XXXXXXXXXX  and  /gp/product/XXXXXXXXXX
 */
export function extractAsinOrIsbn(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('amazon')) return null;

    const dpMatch = parsed.pathname.match(/\/dp\/([A-Z0-9]{10})/i);
    if (dpMatch) return dpMatch[1];

    const gpMatch = parsed.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    if (gpMatch) return gpMatch[1];

    return null;
  } catch {
    return null;
  }
}

/** Returns true if the string looks like an ISBN-10 (digits only, or ending in X). */
export function isLikelyIsbn(asin: string): boolean {
  return /^[0-9]{9}[0-9X]$/i.test(asin);
}

export interface GoogleBooksResult {
  title: string;
  author: string;
  coverImageUrl: string | null;
}

/**
 * Looks up a book by ISBN or ASIN using the free Google Books API (no key required).
 * Returns null if not found or on network error.
 */
export async function lookupByIsbn(isbn: string): Promise<GoogleBooksResult | null> {
  const query = `isbn:${isbn}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.items?.length) return null;

    const info = data.items[0].volumeInfo;
    const thumbnail: string | undefined = info.imageLinks?.thumbnail;

    return {
      title: info.title ?? '',
      author: Array.isArray(info.authors) ? info.authors.join(', ') : '',
      // Upgrade http → https (Google Books returns mixed-protocol URLs)
      coverImageUrl: thumbnail ? thumbnail.replace('http://', 'https://') : null,
    };
  } catch {
    return null;
  }
}
