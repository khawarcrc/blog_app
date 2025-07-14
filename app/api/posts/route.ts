// app/api/posts/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/Post";
import Category from "@/models/Category";
import { getUserFromRequest } from "@/middleware/auth";
import sanitizeHtml from "sanitize-html";
import slugify from "slugify";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Generate unique slug
function generateUniqueSlug(title: string): string {
  const base = slugify(title, { lower: true, strict: true, trim: true });
  const suffix = Date.now().toString(36);
  return `${base}-${suffix}`;
}

//  GET: Fetch posts
export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    const userId = user?.userId;

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const post = await Post.findOne({ slug, status: "published" })
        .populate("author", "username")
        .populate("category", "name subcategories")
        .lean();

      if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

      const subcategory =
        post?.category?.subcategories?.find(
          (sub: any) => sub._id.toString() === post.subcategory?.toString()
        ) || null;

      const liked = userId ? post.likedBy.map(String).includes(userId) : false;

      return NextResponse.json({
        post: { ...post, subcategoryName: subcategory?.name || null, liked },
      });
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const subcategory = searchParams.get("subcategory") || "";
    const author = searchParams.get("author") || "";
    const status = searchParams.get("status") || "published";

    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (author) query.author = author;
    if (status) query.status = status;

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("category", "name subcategories")
      .populate("author", "username")
      .lean();

    const total = await Post.countDocuments(query);

    const postsWithSub = posts.map((post) => {
      const sub = post?.category?.subcategories?.find(
        (s: any) => s._id.toString() === post.subcategory?.toString()
      );
      return {
        ...post,
        liked: userId ? post.likedBy.map(String).includes(userId) : false,
        subcategoryName: sub?.name || null,
      };
    });

    return NextResponse.json({
      posts: postsWithSub,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("GET /api/posts error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

//  POST: Create post
export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
      title,
      content,
      categoryId,
      subcategoryId,
      newCategoryName,
      status = "draft",
    } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Missing title or content" }, { status: 400 });
    }

    if (categoryId && newCategoryName) {
      return NextResponse.json(
        { error: "Choose either existing category or create a new one" },
        { status: 400 }
      );
    }

    let category;

    if (categoryId) {
      category = await Category.findById(categoryId);
      if (!category) return NextResponse.json({ error: "Invalid category" }, { status: 400 });

      if (subcategoryId) {
        const sub = category.subcategories.id(subcategoryId);
        if (!sub) {
          return NextResponse.json(
            { error: "Invalid subcategory for selected category" },
            { status: 400 }
          );
        }
      }
    }

    if (newCategoryName) {
      const normalized = newCategoryName.trim().toLowerCase();
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${normalized}$`, "i") },
      });
      if (existing)
        return NextResponse.json(
          { error: "Category already exists" },
          { status: 400 }
        );
      category = await Category.create({ name: normalized });
    }

    if (!category)
      return NextResponse.json({ error: "Category is required" }, { status: 400 });

    let slug = slugify(title, { lower: true, strict: true, trim: true });
    const duplicate = await Post.findOne({ slug });
    if (duplicate) {
      const randomStr = crypto.randomBytes(4).toString("hex");
      slug = `${slug}-${randomStr}`;
    }

    const sanitizedContent = sanitizeHtml(content);
    const post = await Post.create({
      title,
      slug,
      content: sanitizedContent,
      category: category._id,
      subcategory: subcategoryId || undefined,
      author: user.userId,
      status,
    });

    return NextResponse.json({ message: "Post created", post }, { status: 201 });
  } catch (err) {
    console.error("POST /api/posts error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

//  PUT: Update post
export async function PUT(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
      postId,
      title,
      content,
      categoryId,
      subcategoryId,
      status,
    } = await req.json();

    if (!postId || !title || !content || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const post = await Post.findById(postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.author.toString() !== user.userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const category = await Category.findById(categoryId);
    if (!category) return NextResponse.json({ error: "Invalid category" }, { status: 400 });

    if (subcategoryId) {
      const sub = category.subcategories.id(subcategoryId);
      if (!sub) {
        return NextResponse.json(
          { error: "Invalid subcategory for selected category" },
          { status: 400 }
        );
      }
    }

    if (title !== post.title) {
      let slug = slugify(title, { lower: true, strict: true, trim: true });
      const duplicate = await Post.findOne({ slug });
      if (duplicate && duplicate._id.toString() !== postId) {
        const randomStr = crypto.randomBytes(4).toString("hex");
        slug = `${slug}-${randomStr}`;
      }
      post.slug = slug;
    }

    const sanitizedContent = sanitizeHtml(content);

    post.title = title;
    post.content = sanitizedContent;
    post.category = category._id;
    post.subcategory = subcategoryId || undefined;
    post.status = status || post.status;

    await post.save();
    return NextResponse.json({ message: "Post updated", post });
  } catch (err) {
    console.error("PUT /api/posts error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

//  DELETE: Remove post
export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { postId } = await req.json();
    if (!postId) return NextResponse.json({ error: "Post ID required" }, { status: 400 });

    const post = await Post.findById(postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.author.toString() !== user.userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await Post.findByIdAndDelete(postId);
    return NextResponse.json({ message: "Post deleted" });
  } catch (err) {
    console.error("DELETE /api/posts error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
