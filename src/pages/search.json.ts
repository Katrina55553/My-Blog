import { getCollection } from 'astro:content';

export async function GET() {
  const posts = await getCollection('posts');
  const data = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime()).map((post) => ({
    title: post.data.title,
    slug: post.slug,
    tags: post.data.tags,
    description: post.data.description,
    date: post.data.date.toISOString().slice(0, 10),
  }));

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
