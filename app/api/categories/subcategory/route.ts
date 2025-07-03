// app/api/categories/subcategory/route.ts

import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import { getUserFromRequest } from "@/middleware/auth";

// POST: Add subcategory
export async function POST(req: Request) {
  await dbConnect();
  const user = await getUserFromRequest(req);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { categoryId, subcategoryName } = await req.json();

  if (!categoryId || !subcategoryName) {
    return Response.json(
      { error: "Category ID and subcategory name are required" },
      { status: 400 }
    );
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  const normalizedSub = subcategoryName.trim().toLowerCase();

  const exists = category.subcategories.find(
    (sub: any) => sub.name === normalizedSub
  );

  if (exists) {
    return Response.json(
      { error: "Subcategory already exists" },
      { status: 400 }
    );
  }

  category.subcategories.push({ name: normalizedSub });
  await category.save();

  return Response.json({
    message: "Subcategory added",
    category,
  });
}

// PUT: Update subcategory name
export async function PUT(req: Request) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { categoryId, subcategoryId, newName } = await req.json();
  if (!categoryId || !subcategoryId || !newName) {
    return Response.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  const sub = category.subcategories.id(subcategoryId);
  if (!sub) {
    return Response.json({ error: "Subcategory not found" }, { status: 404 });
  }

  sub.name = newName.trim().toLowerCase();
  await category.save();

  return Response.json({ message: "Subcategory updated", category });
}

// DELETE: Remove subcategory
export async function DELETE(req: Request) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { categoryId, subcategoryId } = await req.json();
  if (!categoryId || !subcategoryId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  category.subcategories = category.subcategories.filter(
    (sub: any) => sub._id.toString() !== subcategoryId
  );

  await category.save();

  return Response.json({ message: "Subcategory deleted", category });
}
