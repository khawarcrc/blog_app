import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import { getUserFromRequest } from '@/middleware/auth';

export async function GET() {
  await dbConnect();
  const categories = await Category.find().sort({ name: 1 }); // Optional: sorted alphabetically
  return Response.json({ categories });
}

export async function POST(req: Request) {
  await dbConnect();
  const user = await getUserFromRequest(req);

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await req.json();

  if (!name || typeof name !== 'string') {
    return Response.json({ error: 'Category name is required' }, { status: 400 });
  }

  const normalizedName = name.trim().toLowerCase();

  // Check if category already exists (case-insensitive)
  const existing = await Category.findOne({
    name: { $regex: new RegExp(`^${normalizedName}$`, 'i') },
  });

  if (existing) {
    return Response.json({ error: 'Category already exists' }, { status: 400 });
  }

  const category = await Category.create({ name: normalizedName });

  return Response.json({ message: 'Category created', category }, { status: 201 });
}
