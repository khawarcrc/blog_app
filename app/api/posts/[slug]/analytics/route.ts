// /api/posts/[slug]/analytics/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/Post";
import AnalyticsLog from "@/models/AnalyticsLog";
import { getUserFromRequest } from "@/middleware/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  await dbConnect();

  const user = await getUserFromRequest(req);

  // ✅ Allow only authenticated users
  if (!user) {
    console.log("Unauthorized access attempt: Not logged in");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Get post to retrieve views count
  const post = await Post.findOne({ slug: params.slug }).select("views");

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // ✅ Get detailed view logs from AnalyticsLog collection
  const logs = await AnalyticsLog.find({ slug: params.slug }).sort({ createdAt: -1 });

  const viewDetails = logs.map((log) => ({
    userId: log.userId,
    sessionId: log.sessionId,
    ip: log.ip,
    userAgent: log.userAgent,
    device: log.device,
    browser: log.browser,
    os: log.os,
    referer: log.referer,
    country: log.country,
    region: log.region,
    city: log.city,
    createdAt: log.createdAt,
  }));

  return NextResponse.json({
    views: post.views,
    viewDetails,
  });
}
