import { NextRequest, NextResponse } from "next/server";
import { Post } from "@/lib/models/Post";
import dbConnect from "@/lib/dbConnect";
import { getUserFromRequest } from "@/middleware/auth";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  await dbConnect();
  const slug = params.slug;

  const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  const user = await getUserFromRequest(req); // your custom middleware to extract user from JWT cookie

  const post = await Post.findOne({ slug });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const alreadyViewed = post.viewDetails.some((v: any) => {
    if (user?.userId) return v.userId?.toString() === user.userId;
    return v.ip === ip;
  });

  if (!alreadyViewed) {
    post.views += 1;
    post.viewDetails.push({
      userId: user?.userId || null,
      ip,
      userAgent,
      createdAt: new Date(),
    });
    await post.save();
  }

  return NextResponse.json({
    views: post.views,
    alreadyViewed,
  });
}
