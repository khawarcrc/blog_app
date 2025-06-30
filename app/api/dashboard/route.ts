import { getUserFromRequest } from '@/middleware/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const user = await getUserFromRequest(req);
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Proceed with your dashboard logic
  return NextResponse.json({ message: 'Welcome to dashboard', user });
}
