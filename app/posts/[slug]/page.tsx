// app/posts/[slug]/page.tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPostBySlug } from "@/lib/api";

type PostPageProps = {
  params: { slug: string };
};

// Metadata for SEO
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  return {
    title: decodeURIComponent(params.slug.replace(/-/g, " ")),
  };
}

// Main post page
export default async function PostDetailPage({ params }: PostPageProps) {
  const decodedSlug = decodeURIComponent(params.slug);

  const post = await getPostBySlug(decodedSlug); // This calls your backend to get post

  if (!post) return notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <article>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
          {post.title}
        </h1>

        <div className="text-sm text-gray-500 mb-6">
          By {post.author?.username || "Unknown"} ·{" "}
          <span className="italic">{post.category?.name || "Uncategorized"}</span> ·{" "}
          {new Date(post.createdAt).toLocaleDateString()}
        </div>

        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 🚧 Placeholder for future features */}
        <div className="mt-10 border-t pt-6 text-sm text-gray-500 space-y-1">
          <p>👁 Views: {post.views || 0}</p>
          <p>❤️ Likes: 0 (Coming soon)</p>
          <p>💬 Comments: Coming soon</p>
        </div>
      </article>
    </main>
  );
}
