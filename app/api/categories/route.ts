import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { getUserFromRequest } from "@/middleware/auth";

// GET: Read all categories (public or authenticated, as needed)
export async function GET() {
  await dbConnect();
  const categories = await Category.find().sort({ name: 1 });
  return Response.json({ categories });
}

// POST: Create new category (logged-in users only)
export async function POST(req: Request) {
  await dbConnect();
  const user = await getUserFromRequest(req);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();

  if (!name || typeof name !== "string") {
    return Response.json(
      { error: "Category name is required" },
      { status: 400 }
    );
  }

  const normalizedName = name.trim().toLowerCase();

  const existing = await Category.findOne({
    name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
  });

  if (existing) {
    return Response.json({ error: "Category already exists" }, { status: 400 });
  }

  const category = await Category.create({ name: normalizedName });

  return Response.json(
    { message: "Category created", category },
    { status: 201 }
  );
}

// PUT: Update a category (logged-in users only)
export async function PUT(req: Request) {
  await dbConnect();
  const user = await getUserFromRequest(req);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, name } = await req.json();

  if (!id || !name || typeof name !== "string") {
    return Response.json(
      { error: "Category ID and new name are required" },
      { status: 400 }
    );
  }

  const normalizedName = name.trim().toLowerCase();

  const existing = await Category.findOne({
    _id: { $ne: id },
    name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
  });

  if (existing) {
    return Response.json(
      { error: "Another category with this name already exists" },
      { status: 400 }
    );
  }

  const updated = await Category.findByIdAndUpdate(
    id,
    { name: normalizedName },
    { new: true }
  );

  if (!updated) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  return Response.json({ message: "Category updated", category: updated });
}

// DELETE: Delete a category (logged-in users only)
export async function DELETE(req: Request) {
  await dbConnect();
  const user = await getUserFromRequest(req);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  if (!id) {
    return Response.json({ error: "Category ID is required" }, { status: 400 });
  }

  const deleted = await Category.findByIdAndDelete(id);

  if (!deleted) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  return Response.json({ message: "Category deleted", category: deleted });
}
