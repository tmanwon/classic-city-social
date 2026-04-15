import { NextResponse, NextRequest } from "next/server";
import connectMongoDB from '@/config/mongodb';
import Event from "@/src/app/models/eventSchema";
import Review from "@/src/app/models/reviewSchema";
import User from "@/src/app/models/userSchema";

export const dynamic = "force-dynamic";

// Read CRUD operation for events
export async function GET() {
  await connectMongoDB();

  // Get events from our DB
  const dbEvents = await Event.find().lean();

  const formattedDbEvents = dbEvents.map((event) => ({
    ...event,
    _id: event._id.toString(),
  }));

  // Get events from Ticketmaster API
  const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?city=Athens&stateCode=GA&size=60&sort=date,asc&apikey=${process.env.NEXT_PUBLIC_TICKETMASTER_API_KEY}`);
  if (!response.ok) {
    throw new NextResponse(JSON.stringify({ error: `Error Code ${response.status}: Failed to fetch events from Ticketmaster: ${response.statusText}` }), {
      status: response.status,
    });
  }

  const tmData = (await response.json())._embedded.events;

  const newEvents = tmData.map((event: any) => {
    const maxResImg = event.images.reduce((prev: { width: number }, current: { width: number }) => {
      return (prev.width > current.width) ? prev : current;
    });

    return (
      {
        _id: event.id,
        tmid: event.id,
        title: event.name,
        description: event.description || "",
        date: event.dates.start.localDate,
        time: event.dates.start.localTime,
        location: `${event._embedded.venues[0].address.line1}, ${event._embedded.venues[0].city.name}, ${event._embedded.venues[0].state.stateCode} ${event._embedded.venues[0].postalCode}`,
        venue: `${event._embedded.venues[0].name}`,
        coordinates: {
          lat: event._embedded.venues[0].location.latitude,
          lng: event._embedded.venues[0].location.longitude,
        },
        category: event.classifications[0].segment.name,
        imageUrl: maxResImg.url || 'https://images.unsplash.com/photo-1672841821756-fc04525771c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwbXVzaWMlMjBmZXN0aXZhbCUyMGNyb3dkfGVufDF8fHx8MTc3Mzg2ODYyMXww&ixlib=rb-4.1.0&q=80&w=1080',
        price: event.priceRanges ? `$${event.priceRanges[0].min}+` : "Ticketmaster",
        attendees: [],
        reviews: [],
        createdBy: null,
        url: event.url,
        source: 'ticketmaster',
      }
    );
  });

  // Filter out Ticketmaster API events that are already in our DB
  const tmDupeFilteredEvents = newEvents.filter((event: any) => {
    return (
      formattedDbEvents.find((backendEvent) => backendEvent.tmid === event.tmid) === undefined
    )
  });

  const allEvents = [...formattedDbEvents, ...tmDupeFilteredEvents];

  return new NextResponse(JSON.stringify({ events: allEvents }), {
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