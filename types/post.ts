import { User } from "./user";
import { Category,Subcategory } from "./category";

//
// ---------- Common Types ----------
//
export type PostStatus = "draft" | "published";


export interface Comment {
  _id: string;
  userId:  User; // If populated, it’s a full User object
  text: string;
  createdAt?: string;
}

//
// ---------- Main Post Type ----------
//
export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  views: number;
  likes: number;
  liked: boolean;
  dislikes: number;
  disliked: boolean;
  likedBy: User[];
  dislikedBy: User[];
  author: User;
  category: Category;
  subcategory?: Subcategory;
  tags: string[];
  featured: boolean;
  comments: Comment[];
  createdAt?: string;
  updatedAt?: string;
}
