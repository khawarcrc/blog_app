import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/Post";
import Category from "@/models/Category";
import { getUserFromRequest } from "@/middleware/auth";

export const dynamic = "force-dynamic";

// ✅ GET all posts
export async function GET() {
  try {
    await dbConnect();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("category", "name")
      .populate("author", "username");

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("GET /api/posts error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ✅ POST a new post
export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    console.log("👤 USER FROM REQUEST:", user);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, categoryId, newCategoryName } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Missing title or content" },
        { status: 400 }
      );
    }

    if (categoryId && newCategoryName) {
      return NextResponse.json(
        { error: "Choose either an existing category or create a new one" },
        { status: 400 }
      );
    }

    let category;

    if (categoryId) {
      category = await Category.findById(categoryId);
      if (!category) {
        return NextResponse.json(
          { error: "Invalid category selected" },
          { status: 400 }
        );
      }
    }

    if (newCategoryName) {
      const normalizedCategoryName = newCategoryName.trim().toLowerCase();
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${normalizedCategoryName}$`, "i") },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Category already exists" },
          { status: 400 }
        );
      }

      category = await Category.create({ name: normalizedCategoryName });
    }

    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    const post = await Post.create({
      title,
      content,
      category: category._id,
      author: user.userId,
    });

    return NextResponse.json(
      { message: "Post created", post },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/posts error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ✅ PUT (Update a post)
export async function PUT(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId, title, content, categoryId } = await req.json();

    if (!postId || !title || !content || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.author.toString() !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    post.title = title;
    post.content = content;
    post.category = categoryId;
    await post.save();

    return NextResponse.json({ message: "Post updated", post });
  } catch (err) {
    console.error("PUT /api/posts error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ✅ DELETE a post
export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.author.toString() !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Post.findByIdAndDelete(postId);

    return NextResponse.json({ message: "Post deleted" });
  } catch (err) {
    console.error("DELETE /api/posts error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
