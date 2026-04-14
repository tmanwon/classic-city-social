import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDB } from "@/lib/mongodb";
import Event from "@/src/app/models/eventSchema";
import Review from "@/src/app/models/reviewSchema";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
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
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const eventKey = event._id.toString();

    const reviews = await Review.find({ eventId: eventKey });

    if (!reviews || reviews.length === 0) {
      return NextResponse.json(
        { error: "No reviews found for this event" },
        { status: 400 }
      );
    }

    const reviewText = reviews
      .filter((review) => typeof review.comment === "string" && review.comment.trim().length > 0)
      .slice(0, 20)
      .map(
        (review, index) =>
          `${index + 1}. Rating: ${review.rating}/5 - ${review.comment.trim()}`
      )
      .join("\n");

    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      input: `
Summarize these reviews for the event "${event.title}".

Reviews:
${reviewText}

Return:
A 2-sentence overall summary of pros (if any) and cons (if any), in a format like (for example): "Attendees generally enjoyed the event, highlighting the great atmosphere and music. However, some noted that the venue was a bit small and crowded."

Only use information supported by the reviews.
`,
    });

    const summary = response.output_text;

    await Event.findByIdAndUpdate(event._id, {
      aiSummary: summary,
      aiSummaryUpdatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("OpenAI summary error:", error);

    return NextResponse.json(
      { error: error?.message || "Failed to summarize reviews" },
      { status: 500 }
    );
  }
}