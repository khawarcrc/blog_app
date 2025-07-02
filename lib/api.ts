// lib/api.ts
export async function getPostBySlug(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts?slug=${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.post;
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return null;
  }
}
