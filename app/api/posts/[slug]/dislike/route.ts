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
  const userId = user.userId;

  try {
    const post = await Post.findOne({ slug });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const index = post.dislikedBy.findIndex(
      (id: any) => id.toString() === userId
    );

    if (index === -1) {
      post.dislikedBy.push(userId);
    } else {
      post.dislikedBy.splice(index, 1);
    }

    post.dislikes = post.dislikedBy.length;
    await post.save();

    return NextResponse.json({
      message: index === -1 ? "Disliked" : "Undisliked",
      dislikes: post.dislikes,
      disliked: index === -1,
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

    const dislikedPosts = await Post.find({
      dislikedBy: userId,
      status: "published",
    })
      .populate("author", "username")
      .populate("category", "name subcategories")
      .sort({ createdAt: -1 })
      .lean();

    const postsWithSub = dislikedPosts.map((post) => {
      const sub = post?.category?.subcategories?.find(
        (s: any) => s._id.toString() === post.subcategory?.toString()
      );
      return {
        ...post,
        disliked: true,
        subcategoryName: sub?.name || null,
      };
    });

    return NextResponse.json({ posts: postsWithSub });
  } catch (err) {
    console.error("GET /api/posts/disliked error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
