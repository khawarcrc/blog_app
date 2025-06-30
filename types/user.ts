export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  _id?: string;
  username: string;
  password?: string; // Optional for cases where you don't want to expose it
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}