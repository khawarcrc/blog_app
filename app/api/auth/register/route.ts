import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  await dbConnect();
  const { username, password, role } = await req.json();

  if (!username || !password) {
    return Response.json({ error: 'Username and password required' }, { status: 400 });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return Response.json({ error: 'User already exists' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    password: hashedPassword,
    role: role || 'user',
  });

  return Response.json({ message: 'User registered', user: { username: user.username, role: user.role } });
}