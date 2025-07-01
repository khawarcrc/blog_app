import { getUserFromRequest } from '@/middleware/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Send user info (including role) to the frontend
  return NextResponse.json({ message: 'Welcome to dashboard', user });
}