export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  purchaseUrl?: string | null;
  whyHelpful?: string | null;
  coverImageUrl?: string | null;
  addedById?: number | null;
  addedByName: string;
  createdAt: string;
  categories: Category[];
}

export interface BooksByCategory {
  category: Category;
  books: Book[];
}
