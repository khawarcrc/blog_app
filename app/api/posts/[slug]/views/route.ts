// /api/posts/[slug]/views/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/Post";
import AnalyticsLog from "@/models/AnalyticsLog";
import { getUserFromRequest } from "@/middleware/auth";
import { UAParser } from "ua-parser-js";
import { v4 as uuidv4 } from "uuid";

// Create or retrieve session ID cookie using App Router's cookies() helper
async function getOrSetSessionId(): Promise<string> {
  const cookieStore = await cookies(); 
  const existing = cookieStore.get("govAnalyticsSession")?.value;
  if (existing) return existing;

  const newSessionId = uuidv4();
  cookieStore.set("govAnalyticsSession", newSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return newSessionId;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  await dbConnect();
  const slug = params.slug;
  const sessionId = await getOrSetSessionId();

  // Get IP and agent headers
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  const referer = req.headers.get("referer") || "direct";

  // Parse browser/device info
  const parser = new UAParser(userAgent);
  const ua = parser.getResult();
  const device = `${ua.device.vendor || ""} ${ua.device.model || ""}`.trim();
  const browser = ua.browser.name || "unknown";
  const os = ua.os.name || "unknown";

  // Get authenticated user (if any)
  const user = await getUserFromRequest(req);

  // Attempt to get geo location info
  let geoData = { country: "", regionName: "", city: "" };
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
    geoData = await geoRes.json();
  } catch (err) {
    console.error("Geo IP lookup failed:", err);
  }

  // Prevent double-logging view within 10 minutes for same session/post
  const recentView = await AnalyticsLog.findOne({
    slug,
    sessionId,
    createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) }, // last 10 mins
  });

  if (!recentView) {
    // Save new view to analytics
    await AnalyticsLog.create({
      slug,
      userId: user?.userId || null,
      sessionId,
      ip,
      userAgent,
      device,
      browser,
      os,
      country: geoData.country,
      region: geoData.regionName,
      city: geoData.city,
      referer,
    });

    // Update main post view count
    await Post.updateOne({ slug }, { $inc: { views: 1 } });
  }

  return NextResponse.json({ status: "logged" });
}
