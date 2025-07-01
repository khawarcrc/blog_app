// lib/auth.ts
import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  role: "user" | "admin" | "superadmin";
  // any other fields you store
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch (err) {
    return null;
  }
}
