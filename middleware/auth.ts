import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function getUserFromRequest(_req: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  console.log("🧪 TOKEN FROM COOKIE:", token);

  if (!token) {
    console.error("❌ No token found in cookie.");
    return null;
  }

  const user = verifyToken(token);

  console.log("🔓 DECODED USER:", user);

  if (!user) {
    console.error("❌ Invalid or expired token.");
    return null;
  }

  return user;
}
