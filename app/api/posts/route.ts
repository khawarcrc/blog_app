// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Post from "@/models/Post";
// import Category from "@/models/Category";
// import { getUserFromRequest } from "@/middleware/auth";
// import sanitizeHtml from "sanitize-html";

// export const dynamic = "force-dynamic";

// // 🛡️ Utility to create SEO-safe and unique slugs
// function generateUniqueSlug(title: string): string {
//   const base = title
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "")
//     .slice(0, 80);

//   const uniqueSuffix = Date.now().toString(36);
//   return `${base}-${uniqueSuffix}`;
// }

// // ✅ GET: Posts with pagination, search, filter
// export async function GET(req: Request) {
//   try {
//     await dbConnect();
//     const { searchParams } = new URL(req.url);

//     // Check if slug parameter exists (single post request)
//     const slug = searchParams.get("slug");
//     if (slug) {
//       const post = await Post.findOne({ slug, status: "published" })
//         .populate("author", "username")
//         .populate("category", "name");

//       if (!post) {
//         return NextResponse.json({ error: "Post not found" }, { status: 404 });
//       }

//       return NextResponse.json({ post });
//     }

//     // Paginated posts list request
//     const page = parseInt(searchParams.get("page") || "1");
//     const limit = parseInt(searchParams.get("limit") || "10");
//     const search = searchParams.get("search") || "";
//     const category = searchParams.get("category") || "";
//     const author = searchParams.get("author") || "";
//     const status = searchParams.get("status") || "published";

//     const skip = (page - 1) * limit;

//     const query: any = {};
//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: "i" } },
//         { content: { $regex: search, $options: "i" } },
//       ];
//     }
//     if (category) query.category = category;
//     if (author) query.author = author;
//     if (status) query.status = status;

//     const posts = await Post.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .populate("category", "name")
//       .populate("author", "username");

//     const total = await Post.countDocuments(query);

//     return NextResponse.json({
//       posts,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit),
//       },
//     });
//   } catch (err) {
//     console.error("GET /api/posts error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// // ✅ POST: Create post with unique slug, sanitize content, new/existing category
// export async function POST(req: Request) {
//   try {
//     await dbConnect();
//     const user = await getUserFromRequest(req);
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const {
//       title,
//       content,
//       categoryId,
//       newCategoryName,
//       status = "draft",
//     } = await req.json();

//     if (!title || !content) {
//       return NextResponse.json({ error: "Missing title or content" }, { status: 400 });
//     }

//     if (categoryId && newCategoryName) {
//       return NextResponse.json(
//         { error: "Choose either existing category or create new one" },
//         { status: 400 }
//       );
//     }

//     let category;

//     if (categoryId) {
//       category = await Category.findById(categoryId);
//       if (!category) {
//         return NextResponse.json({ error: "Invalid category" }, { status: 400 });
//       }
//     }

//     if (newCategoryName) {
//       const normalized = newCategoryName.trim().toLowerCase();
//       const existing = await Category.findOne({
//         name: { $regex: new RegExp(`^${normalized}$`, "i") },
//       });

//       if (existing) {
//         return NextResponse.json({ error: "Category already exists" }, { status: 400 });
//       }

//       category = await Category.create({ name: normalized });
//     }

//     if (!category) {
//       return NextResponse.json({ error: "Category is required" }, { status: 400 });
//     }

//     const sanitizedContent = sanitizeHtml(content);
//     const slug = generateUniqueSlug(title);

//     const post = await Post.create({
//       title,
//       slug,
//       content: sanitizedContent,
//       category: category._id,
//       author: user.userId,
//       status,
//     });

//     return NextResponse.json({ message: "Post created", post }, { status: 201 });
//   } catch (err) {
//     console.error("POST /api/posts error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// // ✅ PUT: Update post with ownership, category, slug regen
// export async function PUT(req: Request) {
//   try {
//     await dbConnect();
//     const user = await getUserFromRequest(req);
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { postId, title, content, categoryId, status } = await req.json();

//     if (!postId || !title || !content || !categoryId) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//     }

//     const post = await Post.findById(postId);
//     if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

//     if (post.author.toString() !== user.userId) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     const category = await Category.findById(categoryId);
//     if (!category) return NextResponse.json({ error: "Invalid category" }, { status: 400 });

//     const sanitizedContent = sanitizeHtml(content);
//     const slug = generateUniqueSlug(title);

//     post.title = title;
//     post.slug = slug;
//     post.content = sanitizedContent;
//     post.category = category._id;
//     post.status = status || post.status;

//     await post.save();

//     return NextResponse.json({ message: "Post updated", post });
//   } catch (err) {
//     console.error("PUT /api/posts error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// // ✅ DELETE: Delete post by owner
// export async function DELETE(req: Request) {
//   try {
//     await dbConnect();
//     const user = await getUserFromRequest(req);
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { postId } = await req.json();
//     if (!postId) return NextResponse.json({ error: "Post ID required" }, { status: 400 });

//     const post = await Post.findById(postId);
//     if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

//     if (post.author.toString() !== user.userId) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     await Post.findByIdAndDelete(postId);
//     return NextResponse.json({ message: "Post deleted" });
//   } catch (err) {
//     console.error("DELETE /api/posts error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/Post";
import Category from "@/models/Category";
import { getUserFromRequest } from "@/middleware/auth";
import sanitizeHtml from "sanitize-html";
import slugify from "slugify";
import crypto from "crypto";
import User from "@/models/User";


export const dynamic = "force-dynamic";

// ✅ Utility: Generate unique SEO-friendly slug
function generateUniqueSlug(title: string): string {
  const base = slugify(title, { lower: true, strict: true, trim: true });
  const suffix = Date.now().toString(36);
  return `${base}-${suffix}`;
}

// ✅ GET: Fetch posts (single or list with filters)
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const slug = searchParams.get("slug");
    if (slug) {
      const post = await Post.findOne({ slug, status: "published" })
        .populate("author", "username")
        .populate("category", "name");
      if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
      return NextResponse.json({ post });
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const author = searchParams.get("author") || "";
    const status = searchParams.get("status") || "published";
    const skip = (page - 1) * limit;

    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }
    if (category) query.category = category;
    if (author) query.author = author;
    if (status) query.status = status;

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("category", "name")
      .populate("author", "username");

    const total = await Post.countDocuments(query);

    return NextResponse.json({
      posts,
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

// ✅ POST: Create post
export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, content, categoryId, newCategoryName, status = "draft" } = await req.json();
    if (!title || !content) return NextResponse.json({ error: "Missing title or content" }, { status: 400 });
    if (categoryId && newCategoryName) return NextResponse.json({ error: "Choose either existing category or create a new one" }, { status: 400 });

    let category;
    if (categoryId) {
      category = await Category.findById(categoryId);
      if (!category) return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    if (newCategoryName) {
      const normalized = newCategoryName.trim().toLowerCase();
      const existing = await Category.findOne({ name: { $regex: new RegExp(`^${normalized}$`, "i") } });
      if (existing) return NextResponse.json({ error: "Category already exists" }, { status: 400 });
      category = await Category.create({ name: normalized });
    }

    if (!category) return NextResponse.json({ error: "Category is required" }, { status: 400 });

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
      author: user.userId,
      status,
    });

    return NextResponse.json({ message: "Post created", post }, { status: 201 });
  } catch (err) {
    console.error("POST /api/posts error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ✅ PUT: Update post
export async function PUT(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { postId, title, content, categoryId, status } = await req.json();
    if (!postId || !title || !content || !categoryId) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const post = await Post.findById(postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.author.toString() !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const category = await Category.findById(categoryId);
    if (!category) return NextResponse.json({ error: "Invalid category" }, { status: 400 });

    const slug = generateUniqueSlug(title);
    const sanitizedContent = sanitizeHtml(content);

    post.title = title;
    post.slug = slug;
    post.content = sanitizedContent;
    post.category = category._id;
    post.status = status || post.status;

    await post.save();
    return NextResponse.json({ message: "Post updated", post });
  } catch (err) {
    console.error("PUT /api/posts error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ✅ DELETE: Remove post
export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { postId } = await req.json();
    if (!postId) return NextResponse.json({ error: "Post ID required" }, { status: 400 });

    const post = await Post.findById(postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.author.toString() !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await Post.findByIdAndDelete(postId);
    return NextResponse.json({ message: "Post deleted" });
  } catch (err) {
    console.error("DELETE /api/posts error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
