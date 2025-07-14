// /api/posts/[slug]/views/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/models/Post";
import AnalyticsLog from "@/models/AnalyticsLog";
import { getUserFromRequest } from "@/middleware/auth";
import { UAParser } from "ua-parser-js";
import { v4 as uuidv4 } from "uuid";

function getOrSetSessionId(req: NextRequest, res: NextResponse): string {
  const cookie = req.cookies.get("govAnalyticsSession")?.value;
  if (cookie) return cookie;

  const newSessionId = uuidv4();
  res.cookies.set("govAnalyticsSession", newSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return newSessionId;
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  await dbConnect();

  const slug = params.slug;
  const res = NextResponse.next();

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  const referer = req.headers.get("referer") || "direct";
  const sessionId = getOrSetSessionId(req, res);
  const user = await getUserFromRequest(req);

  const parser = new UAParser(userAgent);
  const ua = parser.getResult();
  const device = `${ua.device.vendor || ""} ${ua.device.model || ""}`.trim();
  const browser = ua.browser.name || "unknown";
  const os = ua.os.name || "unknown";

  // Geo data (basic)
  let geoData = { country: "", regionName: "", city: "" };
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
    geoData = await geoRes.json();
  } catch (err) {
    console.error("Geo API failed", err);
  }

  // Avoid duplicate logs within X minutes (e.g., 10 mins)
  const recentView = await AnalyticsLog.findOne({
    slug,
    sessionId,
    createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) },
  });

  if (!recentView) {
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

    // Increment main post view
    await Post.updateOne({ slug }, { $inc: { views: 1 } });
  }

  return NextResponse.json(
    { status: "logged", views: "tracked" },
    { headers: res.headers }
  );
}
