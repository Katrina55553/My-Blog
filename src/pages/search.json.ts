import { getCollection } from 'astro:content';

export async function GET() {
  const posts = await getCollection('posts');
  const data = posts.map((post) => ({
    title: post.data.title,
    slug: post.slug,
    tags: post.data.tags,
    description: post.data.description,
  }));

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
