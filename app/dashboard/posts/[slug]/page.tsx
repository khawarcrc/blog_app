// app/posts/[slug]/page.tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";
import PostDetailClient from "./PostDetailClient";

type PostPageProps = {
  params: { slug: string };
};

// SEO metadata
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  return {
    title: decodeURIComponent(params.slug.replace(/-/g, " ")),
  };
}

export default function PostDetailPage({ params }: PostPageProps) {
  return <PostDetailClient slug={params.slug} />;
}
