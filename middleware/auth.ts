// middleware/auth.ts
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function getUserFromRequest(_req: Request) {
  const cookieStore = await cookies(); 
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const user = verifyToken(token);
  if (!user) {
    console.error("Invalid or expired token.");
    return null;
  }

  return user;
}
