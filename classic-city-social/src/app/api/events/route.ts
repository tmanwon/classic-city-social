import { NextResponse, NextRequest } from "next/server";
import connectMongoDB from '@/config/mongodb';
import Event from "@/src/app/models/eventSchema";


export const dynamic = "force-dynamic";

// Read CRUD operation for events
export async function GET() {
    await connectMongoDB();
    const events = await Event.find();
    return new NextResponse(JSON.stringify({ events }), {
        status: 200,
        headers: {
            "content-type": "application/json",
        },
    });
}

// Create CRUD operation for events
export async function POST(request: NextRequest) { // Request is the incoming request object from Next.js API route
    const { tmid, title, description, date, time, location, coordinates, category, imageUrl, venue, price, attendees, reviews, createdBy, url, source } = await request.json(); // body is the parsed JSON data from the request, which should contain the event details (either from a user or API source)
    await connectMongoDB();
    // Create a new event object with a unique ID, attendees and reviews are initialized as empty because this is a new event. source is set to 'user' for now. 
    const createdEvent = await Event.create({ tmid, title, description, date, time, location, coordinates, category, imageUrl, venue, price, attendees, reviews, createdBy, url, source });
    // Return the newly created event in the response with a 201 status code indicating successful creation
    return NextResponse.json(
        { message: "Event created successfully", event: createdEvent },
        { status: 201 }
    );
}

