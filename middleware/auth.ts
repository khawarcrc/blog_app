import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function getUserFromRequest(req) {
  try {
    const cookieStore = await cookies(); // ✅ Fix here
    const token = cookieStore.get('token')?.value;
    if (!token) return null;

    const user = verifyToken(token); // or await if verifyToken is async
    return user;
  } catch (err) {
    console.error('Error in getUserFromRequest:', err);
    return null;
  }
}
