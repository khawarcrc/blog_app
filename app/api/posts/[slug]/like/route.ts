// File: app/api/posts/[slug]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/Post";
import { getUserFromRequest } from "@/middleware/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
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
    const likedIndex = post.likedBy.findIndex(
      (id: any) => id.toString() === userId
    );

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
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const user = await getUserFromRequest(req);
    const userId = user?.userId;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find posts where userId is in likedBy array
    const likedPosts = await Post.find({ likedBy: userId, status: "published" })
      .populate("author", "username")
      .populate("category", "name subcategories")
      .sort({ createdAt: -1 })
      .lean();

    const postsWithSub = likedPosts.map((post) => {
      const sub = post?.category?.subcategories?.find(
        (s: any) => s._id.toString() === post.subcategory?.toString()
      );
      return {
        ...post,
        liked: true, // since user already liked these
        subcategoryName: sub?.name || null,
      };
    });

    return NextResponse.json({ posts: postsWithSub });
  } catch (err) {
    console.error("GET /api/posts/liked error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
