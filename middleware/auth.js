import { verifyToken } from '@/lib/auth';

export function getUserFromRequest(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}