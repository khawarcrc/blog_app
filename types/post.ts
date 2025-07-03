import { Document, Types } from "mongoose";
import { User } from './user';
import { Category } from './category';

type PostStatus = "draft" | "published";

export interface IPost<
  TAuthor = Types.ObjectId | User,
  TCategory = Types.ObjectId | Category,
  TLikedBy = Types.ObjectId[] | User[]
> extends Document {
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  views: number;
  likes: number;
  likedBy: TLikedBy;
  author: TAuthor;
  category: TCategory;
  tags: string[];
  featured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Default Post type (references as ObjectId)
export type Post = IPost<Types.ObjectId, Types.ObjectId, Types.ObjectId[]>;

// Post with populated author
export type PostWithAuthor = IPost<User, Types.ObjectId, Types.ObjectId[]>;

// Post with populated category
export type PostWithCategory = IPost<Types.ObjectId, Category, Types.ObjectId[]>;

// Fully populated Post
export type PopulatedPost = IPost<User, Category, User[]>;

// Input types
export type CreatePostInput = {
  title: string;
  content: string;
  author: Types.ObjectId | string;
  category: Types.ObjectId | string;
  slug?: string;
  status?: PostStatus;
  tags?: string[];
  featured?: boolean;
};

export type UpdatePostInput = {
  title?: string;
  content?: string;
  status?: PostStatus;
  tags?: string[];
  featured?: boolean;
};