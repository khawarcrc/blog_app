import { Types } from "mongoose";

//
// ---------- Subcategory Interface ----------
//

export interface Subcategory {
  _id?: Types.ObjectId | string; // optional when creating new subcategory
  name: string;
}

//
// ---------- Main Category Interface ----------
//

export interface Category {
  _id?: Types.ObjectId | string;
  name: string;
  subcategories: Subcategory[]; // nested subdocuments
  createdAt?: string;
  updatedAt?: string;
}

//
// ---------- Input Types ----------
//

export type CreateCategoryInput = {
  name: string;
  subcategories?: { name: string }[]; // optional on creation
};

export type UpdateCategoryInput = {
  name?: string;
  subcategories?: { name: string; _id?: string }[]; // optional on update
};
