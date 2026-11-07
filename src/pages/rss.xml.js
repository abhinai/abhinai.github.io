import rss from '@astrojs/rss';
import { getPosts } from '../lib/posts';

export async function GET(context) {
  const posts = await getPosts();
  return rss({
    title: 'Abhinai',
    description: 'A personal collection of thoughts, experiments, and observations.',
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
