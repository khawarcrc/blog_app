import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import { getUserFromRequest } from '@/middleware/auth';

export async function GET() {
  await dbConnect();
  const categories = await Category.find();
  return Response.json({ categories });
}

export async function POST(req) {
  await dbConnect();
  const user = getUserFromRequest(req);
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { name } = await req.json();
  const category = await Category.create({ name });
  return Response.json({ message: 'Category created', category });
}