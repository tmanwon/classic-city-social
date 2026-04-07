import { Event, Review } from '../models/mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock sentiment analysis
export async function analyzeSentiment(text: string): Promise<'positive' | 'negative' | 'neutral'> {
  await delay(300);

  const positiveWords = ['great', 'amazing', 'excellent', 'wonderful', 'awesome', 'love', 'fantastic', 'incredible'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing', 'poor', 'worst'];

  const lowerText = text.toLowerCase();
  const hasPositive = positiveWords.some(word => lowerText.includes(word));
  const hasNegative = negativeWords.some(word => lowerText.includes(word));

  if (hasPositive && !hasNegative) return 'positive';
  if (hasNegative && !hasPositive) return 'negative';
  return 'neutral';
}

// Mock external events API (Eventbrite/Ticketmaster)
export async function fetchExternalEvents(): Promise<Event[]> {
  await delay(800);

  // Simulate API response
  return [
    {
      id: 'ext-1',
      title: 'Live Music at The Foundry',
      description: 'Indie rock bands performing live. Great vibes and local brews.',
      date: '2026-04-05',
      time: '21:00',
      location: 'The Foundry, Athens, GA',
      coordinates: { lat: 33.9585, lng: -83.3772 },
      category: 'music',
      imageUrl: 'https://images.unsplash.com/photo-1672841821756-fc04525771c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwbXVzaWMlMjBmZXN0aXZhbCUyMGNyb3dkfGVufDF8fHx8MTc3Mzg2ODYyMXww&ixlib=rb-4.1.0&q=80&w=1080',
      venue: 'The Foundry',
      price: '$12',
      attendees: [],
      reviews: [],
      createdBy: 'external',
      source: 'eventbrite',
    },
  ];
}

// Calculate distance between coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Export event to Google Calendar
export function exportToGoogleCalendar(event: Event): string {
  const startDate = new Date(`${event.date}T${event.time}`);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: event.description,
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Get user's geolocation
export async function getUserLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to Athens, GA coordinates if permission denied
          resolve({ lat: 33.9519, lng: -83.3576 });
        }
      );
    } else {
      // Default to Athens, GA coordinates
      resolve({ lat: 33.9519, lng: -83.3576 });
    }
  });
}

// Generate sentiment summary for reviews
export function generateSentimentSummary(reviews: Review[]): string {
  if (reviews.length === 0) return 'No reviews yet.';

  const sentimentCounts = reviews.reduce((acc, review) => {
    const sentiment = review.sentiment || 'neutral';
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const dominant = Object.entries(sentimentCounts).sort(([, a], [, b]) => b - a)[0][0];

  const summaries = {
    positive: `Most attendees had a great time! (${avgRating.toFixed(1)}/5 stars)`,
    negative: `Some concerns raised by attendees. (${avgRating.toFixed(1)}/5 stars)`,
    neutral: `Mixed reviews from attendees. (${avgRating.toFixed(1)}/5 stars)`,
  };

  return summaries[dominant as keyof typeof summaries];
}
