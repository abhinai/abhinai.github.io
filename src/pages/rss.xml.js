import rss from '@astrojs/rss';
import { getPosts } from '../lib/posts';
import { SITE_DESCRIPTION, SITE_NAME } from '../lib/site';

export async function GET(context) {
  const posts = await getPosts();
  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      categories: [post.data.category],
      link: `/writing/${post.id}/`,
    })),
  });
}
