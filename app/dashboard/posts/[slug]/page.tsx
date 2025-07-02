// app/dashboard/posts/[slug]/page.tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPostBySlug } from "@/lib/api"; // Adjust path if needed

type PostPageProps = {
  params: { slug: string };
};

// SEO metadata
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  return {
    title: decodeURIComponent(params.slug.replace(/-/g, " ")),
  };
}

export default async function DashboardPostDetail({ params }: PostPageProps) {
  const decodedSlug = decodeURIComponent(params.slug);
  const post = await getPostBySlug(decodedSlug); // Assumes your backend supports this

  if (!post) return notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <article className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
        <div className="text-sm text-gray-600">
          <span>Author: {post.author?.username || "Unknown"}</span> ·{" "}
          <span>Category: {post.category?.name || "Uncategorized"}</span> ·{" "}
          <span>Status: {post.status}</span> ·{" "}
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  );
}
