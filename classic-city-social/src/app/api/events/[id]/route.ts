import mongoose from "mongoose";
import { NextResponse, NextRequest } from "next/server";
import connectMongoDB from "@/config/mongodb";
import Event from "@/src/app/models/eventSchema";

import User from "@/src/app/models/userSchema";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// Read CRUD operation for events by id
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await connectMongoDB();

  let event = null;

  if (mongoose.Types.ObjectId.isValid(id)) {
    event = await Event.findById(id);
  }

  if (!event) {
    event = await Event.findOne({ tmid: id });
  }

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

  let oldEvent = null;
  if (body.attendees) {
    oldEvent = await Event.findById(id);
  }

  const updatedEvent = await Event.findByIdAndUpdate(id, body, { new: true });

  if (!updatedEvent) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (body.attendees && oldEvent) {
    const oldAttendees = oldEvent.attendees || [];
    const newAttendees = body.attendees;

    const addedUsers = newAttendees.filter((uid: string) => !oldAttendees.includes(uid));
    const removedUsers = oldAttendees.filter((uid: string) => !newAttendees.includes(uid));

    if (addedUsers.length > 0) {
      await User.updateMany(
        { _id: { $in: addedUsers } },
        { $addToSet: { eventsAttending: updatedEvent._id.toString() } }
      );
    }

    if (removedUsers.length > 0) {
      await User.updateMany(
        { _id: { $in: removedUsers } },
        { $pull: { eventsAttending: updatedEvent._id.toString() } }
      );
    }
  }

  return NextResponse.json({ event: updatedEvent }, { status: 200 });
}

// Delete CRUD operation for events by id
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
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