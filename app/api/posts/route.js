// app/api/posts/route.js

import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import { getUserFromRequest } from '@/middleware/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Optional: disables cache for this route

// 📥 Create a New Post (Admins Only)
export async function POST(req) {
  try {
    await dbConnect();

    const user = await getUserFromRequest(req); // ✅ Ensure it's awaited
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, category } = await req.json();

    // ✅ Simple input validation
    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const post = await Post.create({
      title,
      content,
      category,
      author: user.userId,
    });

    return NextResponse.json({ message: 'Post created', post }, { status: 201 });
  } catch (err) {
    console.error('POST /api/posts error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// 📤 Get All Posts (Public)
export async function GET() {
  try {
    await dbConnect();
    const posts = await Post.find().sort({ createdAt: -1 }).populate('author category');
    return NextResponse.json(posts, { status: 200 });
  } catch (err) {
    console.error('GET /api/posts error:', err);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
