import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/config/mongodb';
import UserModel from '@/src/app/models/userSchema';

type Params = { params: Promise<{ id: string }> };

// GET /api/users/[id] — fetch a single user by ID
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await connectMongoDB();

  const user = await UserModel.findById(id, { password: 0 });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json(user, { status: 200 });
}

// PUT /api/users/[id] — update a user's profile
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  await connectMongoDB();

  const user = await UserModel.findByIdAndUpdate(id, body, { new: true, fields: { password: 0 } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json(user, { status: 200 });
}

// DELETE /api/users/[id] — delete a user account
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await connectMongoDB();

  const user = await UserModel.findByIdAndDelete(id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({ message: 'User deleted' }, { status: 200 });
}
