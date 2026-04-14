import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Review from '@/src/app/models/reviewSchema';
import Event from '@/src/app/models/eventSchema';

type Params = { params: Promise<{ id: string }> };

// GET /api/reviews/[id] — fetch a single review
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectToDB();
    const { id } = await params;

    const review = await Review.findById(id);
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    return NextResponse.json({ review }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

// PUT /api/reviews/[id] — edit a review's rating, comment, or sentiment
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectToDB();
    const { id } = await params;
    const { rating, comment, sentiment } = await req.json();

    const review = await Review.findByIdAndUpdate(
      id,
      { rating, comment, sentiment },
      { new: true, runValidators: true }
    );
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    return NextResponse.json({ review }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] — delete a review and remove it from its event
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await connectToDB();
    const { id } = await params;

    const review = await Review.findByIdAndDelete(id);
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    // Remove the review ID from the event's reviews array
    await Event.findByIdAndUpdate(review.eventId, {
      $pull: { reviews: id },
    });

    return NextResponse.json({ message: 'Review deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete review' },
      { status: 500 }
    );
  }
}
