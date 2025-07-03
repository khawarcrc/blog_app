import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/Post";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await dbConnect();

    const post = await Post.findOne({ slug: params.slug })
      .populate("author", "username")
      .populate("category", "name subcategories")
      .lean();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Extract subcategory name from nested structure
    const sub = post.category?.subcategories?.find(
      (s: any) => s._id.toString() === post.subcategory?.toString()
    );

    return NextResponse.json({
      post: {
        ...post,
        subcategoryName: sub?.name || null,
      },
    });
  } catch (err) {
    console.error("GET /api/posts/[slug] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
