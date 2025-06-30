import { User } from './user';
import { Category } from './category';

export interface Post {
  _id?: string;
  title: string;
  content: string;
  author: User | string; // Can be populated or just an ID
  category: Category | string;
  createdAt?: string;
  updatedAt?: string;
}