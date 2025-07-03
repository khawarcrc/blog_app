export async function getPostBySlug(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts?slug=${slug}`, {
      cache: "no-store",
      credentials: "include", // ✅ Important if you're using auth cookies
    });

    if (!res.ok) {
      console.error("❌ getPostBySlug failed with status:", res.status);
      return null;
    }

    const data = await res.json();
    if (!data?.post) {
      console.error("❌ No post in API response");
      return null;
    }

    return data.post;
  } catch (error) {
    console.error("❌ getPostBySlug error:", error);
    return null;
  }
}
