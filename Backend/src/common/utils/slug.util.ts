/**
 * Converts a string to a URL-safe slug.
 * Handles Unicode (e.g. Bengali) by transliterating or stripping non-ASCII.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // strip non-word chars
    .replace(/[\s_-]+/g, '-')   // spaces/underscores to hyphens
    .replace(/^-+|-+$/g, '');   // trim leading/trailing hyphens
}

/**
 * Generates a unique slug by appending a short numeric suffix if a slug exists.
 * @param base - base slug (from slugify)
 * @param existsFn - async function returning true if slug is taken
 */
export async function uniqueSlug(
  base: string,
  existsFn: (slug: string) => Promise<boolean>,
): Promise<string> {
  let slug = base;
  let counter = 1;
  while (await existsFn(slug)) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}
