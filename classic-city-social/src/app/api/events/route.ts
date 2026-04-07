import { NextResponse, NextRequest } from "next/server";
import connectMongoDB from '@/config/mongodb';
import Event from "@/src/app/models/eventSchema";


/*
 * Currently, these functions are implemented for mock data. Once the database is set up, we will replace the mock data with actual database queries using Mongoose.
 * Considerations/Changes when DB is set up: 
 * - We will need to handle asynchronous operations with the database, so all functions will need to be async and use await for database queries.
 * - We will need to add error handling for database operations, such as try/catch blocks to catch any errors that may occur during database interactions and return 
 * appropriate error responses.
 * - For the POST and PUT operations, we will need to validate the incoming data before attempting to create or update an event in the database. 
 * This could involve checking for required fields, validating data types, and ensuring that the data meets any constraints defined in our Mongoose schema.
 * - Add necessary mongoDB connections and queries
 * - enum validator for event source: enum: ['user', 'ticketmaster', 'eventbrite', 'athens_data']
 */

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
    const { title, description, date, time, location, coordinates, category, imageUrl, venue, price, attendees, reviews, createdBy, url, source } = await request.json(); // body is the parsed JSON data from the request, which should contain the event details (either from a user or API source)
    await connectMongoDB();
    // Create a new event object with a unique ID, attendees and reviews are initialized as empty because this is a new event. source is set to 'user' for now. 
    const createdEvent = await Event.create({ title, description, date, time, location, coordinates, category, imageUrl, venue, price, attendees, reviews, createdBy, url, source });
    // Return the newly created event in the response with a 201 status code indicating successful creation
    return NextResponse.json(
        { message: "Event created successfully", event: createdEvent },
        { status: 201 }
    );
}

