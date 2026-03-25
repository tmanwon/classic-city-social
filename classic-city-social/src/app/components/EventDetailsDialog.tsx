import { useState } from 'react';
import { X, Star, Calendar, ExternalLink, Users, MapPin, UserCheck } from 'lucide-react';
import { Event, Review } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { analyzeSentiment, exportToGoogleCalendar, generateSentimentSummary } from '../services/api';
import Image from 'next/image';

interface EventDetailsDialogProps {
  event: Event;
  onClose: () => void;
  onAddReview: (eventId: string, review: Review) => void;
  onAttend: (eventId: string) => void;
}

export function EventDetailsDialog({ event, onClose, onAddReview, onAttend }: EventDetailsDialogProps) {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const isAttending = user ? event.attendees.includes(user.id) : false;
  const avgRating = event.reviews.length > 0
    ? event.reviews.reduce((sum, r) => sum + r.rating, 0) / event.reviews.length
    : 0;

  const handleSubmitReview = async () => {
    if (!user || !comment.trim()) return;
    
    setSubmitting(true);
    try {
      const sentiment = await analyzeSentiment(comment);
      const newReview: Review = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        userName: user.name,
        rating,
        comment,
        sentiment,
        createdAt: new Date().toISOString(),
      };
      
      onAddReview(event.id, newReview);
      setComment('');
      setRating(5);
      toast.success('Review added!');
    } catch (error) {
      toast.error('Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportToCalendar = () => {
    const url = exportToGoogleCalendar(event);
    window.open(url, '_blank');
    toast.success('Opening Google Calendar...');
  };

  const sentimentSummary = generateSentimentSummary(event.reviews);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header Image */}
        <div className="relative h-64 md:h-80">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill={true}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-red-600 text-white text-lg px-3 py-1">
              {event.category}
            </Badge>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Title and basic info */}
          <h2 className="text-3xl md:text-4xl mb-4">{event.title}</h2>
          
          <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{event.attendees.length} attending</span>
            </div>
            {event.price && (
              <div className="flex items-center gap-2">
                <span className="font-medium">{event.price}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            {isAuthenticated && (
              <Button
                onClick={() => onAttend(event.id)}
                variant={isAttending ? "secondary" : "default"}
                className="gap-2"
              >
                <UserCheck className="w-4 h-4" />
                {isAttending ? 'Attending' : 'Mark Attending'}
              </Button>
            )}
            <Button onClick={handleExportToCalendar} variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Add to Google Calendar
            </Button>
          </div>

          {/* Location */}
          <div className="mb-6">
            <h3 className="text-lg mb-2">Location</h3>
            <div className="flex items-start gap-2 text-gray-700">
              <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p>{event.venue}</p>
                <p className="text-sm text-gray-600">{event.location}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg mb-2">About This Event</h3>
            <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
          </div>

          {/* Reviews section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl">Reviews & Ratings</h3>
              {event.reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-medium">{avgRating.toFixed(1)}</span>
                  <span className="text-gray-600">({event.reviews.length})</span>
                </div>
              )}
            </div>

            {event.reviews.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-900">
                  <strong>Sentiment Summary:</strong> {sentimentSummary}
                </p>
              </div>
            )}

            {/* Add review form */}
            {isAuthenticated ? (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="mb-3">Add Your Review</h4>
                <div className="mb-3">
                  <label className="block text-sm text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRating(num)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            num <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows={3}
                  className="mb-3"
                />
                <Button
                  onClick={handleSubmitReview}
                  disabled={!comment.trim() || submitting}
                  size="sm"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            ) : (
              <p className="text-gray-600 mb-6">Log in to add a review</p>
            )}

            {/* Reviews list */}
            <div className="space-y-4">
              {event.reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
              ) : (
                event.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{review.userName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                    {review.sentiment && (
                      <Badge
                        variant="outline"
                        className={`mt-2 text-xs ${
                          review.sentiment === 'positive'
                            ? 'border-green-500 text-green-700'
                            : review.sentiment === 'negative'
                            ? 'border-red-500 text-red-700'
                            : 'border-gray-500 text-gray-700'
                        }`}
                      >
                        {review.sentiment}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Event buddies section */}
          {event.attendees.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-xl mb-4">Event Buddies</h3>
              <p className="text-gray-600 mb-3">
                {event.attendees.length} {event.attendees.length === 1 ? 'person is' : 'people are'} attending this event
              </p>
              {isAuthenticated && isAttending && (
                <p className="text-sm text-green-700">
                  You're attending! Connect with other attendees at the event.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
