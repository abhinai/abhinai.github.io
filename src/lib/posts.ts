import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

export const PHOTO_CATEGORY = 'Photos';

/** Published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Display order for listings: higher weight first, then newest first. */
export function byWeight(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.data.weight - a.data.weight || b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getWriting(): Promise<Post[]> {
  return (await getPosts()).filter((p) => p.data.category !== PHOTO_CATEGORY);
}

export async function getPhotos(): Promise<Post[]> {
  return (await getPosts()).filter((p) => p.data.category === PHOTO_CATEGORY && p.data.cover);
}

/** Format a YYYY-MM-DD calendar day (post.data.day), e.g. "March 16, 2024" or with month: 'short' "Mar 16, 2024". */
export function formatDate(day: string, month: 'long' | 'short' = 'long'): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month, day: 'numeric', timeZone: 'UTC' });
}

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const postUrl = (post: Post) => `/writing/${post.id}/`;
export const categoryUrl = (category: string) => `/category/${slugify(category)}/`;
