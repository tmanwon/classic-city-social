import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/config/mongodb';
import UserModel from '@/src/app/models/userSchema';

// POST /api/users — create a new user
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { firstName, lastName, email, password } = body;

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await connectMongoDB();

  const existing = await UserModel.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }

  const user = await UserModel.create({ firstName, lastName, email, password });
  return NextResponse.json(user, { status: 201 });
}
