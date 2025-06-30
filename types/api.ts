import { User } from './user';
import { Post } from './post';
import { Category } from './category';

export interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  data?: T;
}

export interface AuthResponse {
  user: Pick<User, 'username' | 'role'>;
  // No token here if using HTTP-only cookies
}

export interface PostsResponse {
  posts: Post[];
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface SinglePostResponse {
  post: Post;
}

export interface SingleCategoryResponse {
  category: Category;
}