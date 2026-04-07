import mongoose from "mongoose";
import { NextResponse, NextRequest } from "next/server";
import connectMongoDB from "@/config/mongodb";
import Event from "@/src/app/models/eventSchema";

type RouteParams = {
    params: Promise<{ id: string }>;
};
// Read CRUD operation for events by id
export async function GET(_request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    await connectMongoDB();
    const event = await Event.findOne({ _id: id });

    if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event }, { status: 200 });
}

// Update CRUD operation for events by id
export async function PUT(request: NextRequest) {
    const body = await request.json(); // same as POST
    const index = mockEvents.findIndex(event => event.id === body.id); // find the index of the event to update based on the ID provided in the request body
    // if the event is not found, returns a 404 error response
    if (index === -1) {
        return Response.json({ error: 'Event not found' }, { status: 404 });
    }
    // Update the event by merging existing data with request body - allows for partial updates as body does not need to contain all fields
    // Something to consider when database is set up - we most likely will not want all fields to be updatable (source, createdBy, reviews)
    mockEvents[index] = { ...mockEvents[index], ...body };
    // Return the updated event in the response with a 200 status code
    return NextResponse.json({ event: mockEvents[index] }, { status: 200 });
}

// Delete CRUD operation for events by id
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    const { id } = await params; // shorthand to extract event ID from the request body
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }
    await connectMongoDB();
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
}