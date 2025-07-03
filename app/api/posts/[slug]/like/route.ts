// File: app/api/posts/[slug]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/Post";
import { getUserFromRequest } from "@/middleware/auth";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  await dbConnect();

  const user = await getUserFromRequest(req);
  if (!user || !user.userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { slug } = params;

  try {
    const post = await Post.findOne({ slug });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const userId = user.userId; // ✅ comes from JWT payload
    const likedIndex = post.likedBy.findIndex((id: any) => id.toString() === userId);

    if (likedIndex === -1) {
      post.likedBy.push(userId); // 👍 Like
    } else {
      post.likedBy.splice(likedIndex, 1); // 👎 Dislike (remove like)
    }

    post.likes = post.likedBy.length;
    await post.save();

    return NextResponse.json({
      message: likedIndex === -1 ? "Liked" : "Disliked",
      likes: post.likes,
      liked: likedIndex === -1,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
