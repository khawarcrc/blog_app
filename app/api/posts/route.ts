import dbConnect from "@/lib/dbConnect";
import Post from "@/models/Post";
import Category from "@/models/Category";
import { getUserFromRequest } from "@/middleware/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ✅ Handle GET requests to fetch all posts
export async function GET() {
  try {
    await dbConnect();

    const posts = await Post.find()
      .sort({ createdAt: -1 }) // newest first
      .populate("category", "name") // populate category name only
      .populate("author", "username"); // populate author username only if needed

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("GET /api/posts error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ✅ Your existing POST method remains unchanged
export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
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
