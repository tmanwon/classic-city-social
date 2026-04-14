import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/config/mongodb';
import User from '@/src/app/models/userSchema';



// POST /api/users — create a new user
export async function POST(request: NextRequest) {
  const bcrypt = require('bcrypt');
  const saltRounds = 10;

  const body = await request.json();
  const { firstName, lastName, email, password, imageUrl } = body;

  await connectMongoDB();

  // If firstName and lastName are absent, it's a login request
  if (!firstName && !lastName && email && password) {
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    return NextResponse.json(user, { status: 200 });
  }

  // Otherwise, it's a signup request
  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }

  const user = await User.create({ firstName, lastName, email, password: hashedPassword, imageUrl });
  return NextResponse.json(user, { status: 201 });
}

// GET /api/users — get all users
export async function GET() {
  await connectMongoDB();
  const users = await User.find();
  return new NextResponse(JSON.stringify({ users }), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
}
