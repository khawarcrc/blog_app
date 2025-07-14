// route.ts - /api/posts/[slug]/analytics
import { NextRequest, NextResponse } from "next/server";
import Post from "@/models/Post";
import dbConnect from "@/lib/dbConnect";
import { getUserFromRequest } from "@/middleware/auth";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  await dbConnect();

  const user = await getUserFromRequest(req);

  // Allow only admins
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get analytics fields only
  const post = await Post.findOne({ slug: params.slug }).select("views viewDetails");

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Optional: Only send needed fields from each view entry (for performance & clarity)
  const viewDetails = post.viewDetails.map((view: any) => ({
    userId: view.userId,
    ip: view.ip,
    userAgent: view.userAgent,
    device: view.device,
    sessionId: view.sessionId,
    referer: view.referer,
    country: view.country,
    region: view.region,
    city: view.city,
    createdAt: view.createdAt,
  }));

  return NextResponse.json({
    views: post.views,
    viewDetails,
  });
}
