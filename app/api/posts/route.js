import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import { getUserFromRequest } from '@/middleware/auth';

export async function POST(req) {
  await dbConnect();
  const user = getUserFromRequest(req);
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { title, content, category } = await req.json();
  const post = await Post.create({
    title,
    content,
    category,
    author: user.userId,
  });
  return Response.json({ message: 'Post created', post });
}