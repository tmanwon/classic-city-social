import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { eventTitle, reviews } = await req.json();

    if (!eventTitle || !Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json(
        { error: "eventTitle and reviews are required" },
        { status: 400 }
      );
    }

    // Keep requests smaller and cleaner
    const reviewText = reviews
      .filter((review: unknown) => typeof review === "string" && review.trim().length > 0)
      .slice(0, 20)
      .map((review: string, index: number) => `${index + 1}. ${review.trim()}`)
      .join("\n");

    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      input: `
Summarize these reviews for the event "${eventTitle}".

Reviews:
${reviewText}

Return:
1. A 2-sentence overall summary
2. 3 common pros
3. 3 common cons
4. Overall sentiment: Positive, Mixed, or Negative

Only use information supported by the reviews.
`,
    });

    return NextResponse.json({
      summary: response.output_text,
    });
  } catch (error) {
    console.error("OpenAI summary error:", error);
    return NextResponse.json(
      { error: "Failed to summarize reviews" },
      { status: 500 }
    );
  }
}
