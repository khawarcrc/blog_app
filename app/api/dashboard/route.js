import { getUserFromRequest } from '@/middleware/auth';

export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Return dashboard data here
  return Response.json({ message: 'Welcome to the admin dashboard', user });
}