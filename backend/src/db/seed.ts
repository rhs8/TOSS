import { query } from "./index";

const CATEGORIES = [
  { name: "Tools", slug: "tools" },
  { name: "Kitchen", slug: "kitchen" },
  { name: "Furniture", slug: "furniture" },
  { name: "Electronics", slug: "electronics" },
  { name: "Sports", slug: "sports" },
  { name: "Books", slug: "books" },
  { name: "Other", slug: "other" },
];

export async function seedCategories(): Promise<void> {
  for (const c of CATEGORIES) {
    await query(
      `INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING`,
      [c.name, c.slug]
    );
  }
}
