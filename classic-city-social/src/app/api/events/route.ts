import { NextResponse, NextRequest } from "next/server";
import connectMongoDB from '@/config/mongodb';
import Event from "@/src/app/models/eventSchema";
import Review from "@/src/app/models/reviewSchema";
import User from "@/src/app/models/userSchema";

export const dynamic = "force-dynamic";

// Read CRUD operation for events
export async function GET() {
  await connectMongoDB();

  const events = await Event.find().lean();

  const formattedEvents = events.map((event) => ({
    ...event,
    _id: event._id.toString(),
  }));

  return new NextResponse(JSON.stringify({ events: formattedEvents }), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
}

// Create CRUD operation for events
export async function POST(request: NextRequest) {
  const {
    tmid,
    title,
    description,
    date,
    time,
    location,
    coordinates,
    category,
    imageUrl,
    venue,
    price,
    attendees,
    reviews,
    createdBy,
    url,
    source
  } = await request.json();

  await connectMongoDB();

  const createdEvent = await Event.create({
    tmid,
    title,
    description,
    date,
    time,
    location,
    coordinates,
    category,
    imageUrl,
    venue,
    price,
    attendees,
    reviews,
    createdBy,
    url,
    source
  });

  if (attendees && attendees.length > 0) {
    await User.updateMany(
      { _id: { $in: attendees } },
      { $addToSet: { eventsAttending: createdEvent._id.toString() } }
    );
  }

  return NextResponse.json(
    { message: "Event created successfully", event: createdEvent },
    { status: 201 }
  );
}