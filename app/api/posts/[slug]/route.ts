// app/api/posts/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/Post";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await dbConnect();

    const post = await Post.findOne({ slug: params.slug })
      .populate("author", "username")
      .populate("category", "name");

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (err) {
    console.error("GET /api/posts/[slug] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
