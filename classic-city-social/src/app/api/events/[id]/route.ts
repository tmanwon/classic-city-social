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
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const body = await request.json();

    await connectMongoDB();
    
    const updatedEvent = await Event.findByIdAndUpdate(id, body, { new: true });

    if (!updatedEvent) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event: updatedEvent }, { status: 200 });
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