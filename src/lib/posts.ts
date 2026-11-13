import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

export const PHOTO_CATEGORY = 'Photos';

// Private preview builds (SHOW_DRAFTS=true npm run build, used by the CMS) include drafts; the public build never does
const SHOW_DRAFTS = typeof process !== 'undefined' && process.env.SHOW_DRAFTS === 'true';

/** Published posts (plus drafts in preview builds), newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => SHOW_DRAFTS || !data.draft);
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

/** Alt text of a post's photo: the first image in its text (where the CMS keeps it), else the title. */
export function photoAlt(post: Post): string {
  return post.body?.match(/!\[([^\]]*)\]\(/)?.[1].trim() || post.data.title;
}

/** Format a YYYY-MM-DD calendar day (post.data.day), e.g. "March 16, 2024" or with month: 'short' "Mar 16, 2024". */
export function formatDate(day: string, month: 'long' | 'short' = 'long'): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month, day: 'numeric', timeZone: 'UTC' });
}

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const postUrl = (post: Post) => `/writing/${post.id}/`;
// Photos has its own gallery page instead of a category page
export const categoryUrl = (category: string) =>
  category === PHOTO_CATEGORY ? '/photos/' : `/category/${slugify(category)}/`;
