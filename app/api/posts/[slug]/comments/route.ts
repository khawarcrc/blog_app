// app/api/posts/[slug]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/Post";
import { getUserFromRequest } from "@/middleware/auth";

// 🟢 GET: Fetch comments for a post
export async function GET(
  req: NextRequest,
  context: { params: { slug: string } }
) {
  await dbConnect();
  const { slug } = context.params;

  try {
    const post = await Post.findOne({ slug }).populate(
      "comments.userId",
      "username"
    );

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ comments: post.comments || [] });
  } catch (err) {
    console.error("GET /comments error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// 🟡 POST: Add a new comment
export async function POST(
  req: NextRequest,
  context: { params: { slug: string } }
) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { slug } = context.params;
  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json(
      { message: "Comment text is required" },
      { status: 400 }
    );
  }

  try {
    const post = await Post.findOne({ slug });
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    post.comments.push({
      userId: user.userId,
      text: text.trim(),
    });

    await post.save();
    return NextResponse.json({ message: "Comment added successfully" });
  } catch (err) {
    console.error("POST /comments error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// 🔵 PUT: Update a comment
export async function PUT(
  req: NextRequest,
  context: { params: { slug: string } }
) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { slug } = context.params;
  const { commentId, text } = await req.json();

  if (!commentId || !text?.trim()) {
    return NextResponse.json(
      { message: "Invalid comment update" },
      { status: 400 }
    );
  }

  try {
    const post = await Post.findOne({ slug });
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }

    if (comment.userId.toString() !== user.userId) {
      return NextResponse.json(
        { message: "Unauthorized to edit this comment" },
        { status: 403 }
      );
    }

    comment.text = text.trim();
    await post.save();

    return NextResponse.json({ message: "Comment updated" });
  } catch (err) {
    console.error("PUT /comments error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// 🔴 DELETE: Remove a comment
export async function DELETE(
  req: NextRequest,
  context: { params: { slug: string } }
) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { slug } = context.params;
  const { commentId } = await req.json();

  if (!commentId) {
    return NextResponse.json(
      { message: "Comment ID required" },
      { status: 400 }
    );
  }

  try {
    const post = await Post.findOne({ slug });
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }

    if (comment.userId.toString() !== user.userId) {
      return NextResponse.json(
        { message: "Unauthorized to delete this comment" },
        { status: 403 }
      );
    }

    comment.deleteOne();
    await post.save();

    return NextResponse.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("DELETE /comments error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
