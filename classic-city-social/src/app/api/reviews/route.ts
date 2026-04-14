import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Event from "@/src/app/models/eventSchema";
import Review from "@/src/app/models/reviewSchema";

// GET /api/reviews?eventId=123 — fetch all reviews for an event
export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    const query = eventId ? { eventId } : {};
    const reviews = await Review.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const {
      eventId,
      userId,
      userName,
      rating,
      comment,
      sentiment,
      createdAt,
    } = await req.json();

    if (!eventId || !userId || !userName || typeof rating !== "number" || !comment?.trim()) {
      return NextResponse.json(
        { error: "Missing required review fields" },
        { status: 400 }
      );
    }

    let event = null;

    if (mongoose.Types.ObjectId.isValid(eventId)) {
      event = await Event.findById(eventId);
    }

    if (!event) {
      event = await Event.findOne({ tmid: eventId });
    }

    if (!event) {
      return NextResponse.json(
        { error: "Event not found for review" },
        { status: 404 }
      );
    }

    const review = await Review.create({
      eventId: event._id.toString(),
      userId,
      userName,
      rating,
      comment: comment.trim(),
      sentiment,
      createdAt: createdAt || new Date().toISOString(),
    });

    await Event.findByIdAndUpdate(event._id, {
      $push: { reviews: review._id.toString() },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create review" },
      { status: 500 }
    );
  }
}