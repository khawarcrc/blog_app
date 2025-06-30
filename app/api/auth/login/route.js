import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers"; // Added import

export async function POST(req) {
  await dbConnect();
  const { username, password } = await req.json();

  if (!username || !password) {
    return Response.json(
      { error: "Username and password required" },
      { status: 400 }
    );
  }

  const user = await User.findOne({ username });
  if (!user) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // Set the HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return Response.json({
    message: "Login successful",
    user: { username: user.username, role: user.role },
  });
}
