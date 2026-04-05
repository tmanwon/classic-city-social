export async function summarizeReviews(eventTitle: string, reviews: string[]) {
    const res = await fetch("/api/summarize-reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventTitle, reviews }),
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.error || "Failed to summarize reviews");
    }
  
    return data.summary as string;
  }