import { NextResponse, NextRequest } from "next/server";
import connectMongoDB from '@/config/mongodb';
import Event from "@/src/app/models/eventSchema";
import Review from "@/src/app/models/reviewSchema";

export const dynamic = "force-dynamic";

// Read CRUD operation for events
export async function GET() {
  await connectMongoDB();

  const events = await Event.find().lean();

  const eventsWithReviews = await Promise.all(
    events.map(async (event) => {
      const reviews = await Review.find({ eventId: event._id.toString() })
        .sort({ createdAt: -1 })
        .lean();

      return {
        ...event,
        _id: event._id.toString(),
        reviews,
      };
    })
  );

  return new NextResponse(JSON.stringify({ events: eventsWithReviews }), {
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

  return NextResponse.json(
    { message: "Event created successfully", event: createdEvent },
    { status: 201 }
  );
}