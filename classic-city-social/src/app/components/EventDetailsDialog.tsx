'use client';

import { useEffect, useState } from 'react';
import { X, Star, Calendar, ExternalLink, Users, MapPin, UserCheck, UserPlus } from 'lucide-react';
import { EventResponse } from '../models/eventSchema';
import { ReviewType, ReviewResponse } from '../models/reviewSchema';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { analyzeSentiment, exportToGoogleCalendar, generateSentimentSummary } from '../services/api';
import { summarizeReviews } from '@/lib/summarizeReviews';
import Image from 'next/image';
import { useExtractColors } from 'react-extract-colors';
import dynamic from 'next/dynamic';

const MiniMap = dynamic(() => import('./MiniMapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-white/10 animate-pulse" />
});

interface EventDetailsDialogProps {
  event: EventResponse;
  onClose: () => void;
  onAddReview: (eventId: string, review: Review) => void;
  onAttend: (eventId: string) => void;
}

const format12Hour = (timeStr?: string) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  if (!h || !m) return timeStr;
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

export function EventDetailsDialog({ event, onClose, onAddReview, onAttend }: EventDetailsDialogProps) {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [reviewSummary, setReviewSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  const { colors, loading } = useExtractColors(event.imageUrl, {
    maxColors: 3,
    format: "hex",
    maxSize: 200,
    sortBy: "dominance"
  });

  const [domColor, setDomColor] = useState<string>('#ffffff');

  useEffect(() => {
    if (!loading && colors && colors.length > 0) {
      setDomColor(colors[0]);
    }
  }, [loading, colors]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
  };

  const getContrastColor = (hexColor: string) => {
    const rgb = hexToRgb(hexColor).split(',').map(Number);
    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    return luminance > 0.6 ? '#1a1a1a' : '#ffffff';
  };

  const rgbDom = hexToRgb(domColor);
  const textColor = getContrastColor(domColor);
  const isLightText = textColor === '#ffffff';
  const mutedTextColor = isLightText ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  const borderColor = isLightText ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
  const panelBg = isLightText ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)';

  const isAttending = user ? event.attendees.includes(user._id) : false;
  const avgRating = event.reviews.length > 0
    ? event.reviews.reduce((sum, r) => sum + r.rating, 0) / event.reviews.length
    : 0;

  useEffect(() => {
    const loadSummary = async () => {
      try {
        if (!event || !event.reviews || event.reviews.length < 2) {
          setReviewSummary('');
          setSummaryError('');
          return;
        }

        setSummaryLoading(true);
        setSummaryError('');

        const reviewTexts = event.reviews.map((review) => review.comment);
        const summary = await summarizeReviews(event.title, reviewTexts);

        setReviewSummary(summary);
      } catch (error) {
        console.error(error);
        setSummaryError('Could not generate review summary.');
      } finally {
        setSummaryLoading(false);
      }
    };

    loadSummary();
  }, [event]);

  const handleSubmitReview = async () => {
    if (!user || !comment.trim()) return;

    setSubmitting(true);
    try {
      const sentiment = await analyzeSentiment(comment);
      const newReview: Review = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user._id,
        userName: user.firstName + ' ' + user.lastName,
        rating,
        comment,
        sentiment,
        createdAt: new Date().toISOString(),
      };

      onAddReview(event._id, newReview);
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8">
      <div
        className="relative rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-colors duration-700 border border-white/10"
        style={{ backgroundColor: domColor, color: textColor }}
      >
        {/* Dynamic Header Area */}
        <div className="relative h-72 md:h-[400px] w-full">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill={true}
            className="w-full h-full object-cover"
            priority
          />
          <div
            className="absolute inset-0 h-full w-full"
            style={{
              background: `linear-gradient(to top, rgba(${rgbDom}, 1) 0%, rgba(${rgbDom}, 0.95) 15%, rgba(${rgbDom}, 0.6) 40%, rgba(${rgbDom}, 0) 100%)`
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 z-50 hover:bg-white/20"
            style={{ backgroundColor: isLightText ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)', color: textColor }}
          >
            <X className="w-6 h-6" />
          </button>

          <div className="absolute top-6 left-6 z-20 flex gap-2">
            <Badge className="text-white font-bold tracking-wide text-sm px-4 py-1.5 shadow-md border-0" style={{ backgroundColor: isLightText ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
              {event.category}
            </Badge>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative z-10 px-8 md:px-12 pb-12 -mt-24">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 drop-shadow-sm leading-tight tracking-tight">
            {event.title}
          </h2>

          <div className="flex flex-wrap gap-x-8 gap-y-4 mb-10 text-lg font-medium">
            <div className="flex items-center gap-2.5" style={{ color: mutedTextColor }}>
              <Calendar className="w-6 h-6 opacity-80" />
              <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {format12Hour(event.time)}</span>
            </div>
            <div className="flex items-center gap-2.5" style={{ color: mutedTextColor }}>
              <Users className="w-6 h-6 opacity-80" />
              <span>{event.attendees.length} attending</span>
            </div>
            {event.price && (
              <div className="flex items-center gap-2" style={{ color: mutedTextColor }}>
                <span className="font-bold text-xl" style={{ color: textColor }}>{event.price}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mb-10 border-b pb-10" style={{ borderColor }}>
            {isAuthenticated && (
              <Button
                onClick={() => onAttend(event._id)}
                className={`gap-2 h-14 w-14 px-8 rounded-2xl text-lg font-bold transition-all shadow-lg ${isAttending ? 'opacity-90' : 'hover:-translate-y-1'} sm:w-auto`}
                style={{
                  backgroundColor: isLightText ? (isAttending ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.95)') : (isAttending ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.85)'),
                  color: isLightText ? (isAttending ? textColor : domColor) : (isAttending ? textColor : '#ffffff'),
                }}
              >
                {isAttending ? (
                  <UserCheck className="w-6 h-6" />
                ) : (
                  <UserPlus className="w-6 h-6" />
                )}
                <span className="hidden sm:block">{isAttending ? 'Attending' : 'Mark Attending'}</span>
              </Button>
            )}
            <Button
              onClick={handleExportToCalendar}
              className="gap-2 h-14 w-14 px-8 rounded-2xl text-lg font-semibold border-2 bg-transparent transition-colors hover:bg-black/5 sm:w-auto"
              style={{ color: textColor, borderColor: isLightText ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
            >
              <Calendar className="w-5 h-5" />
              <span className="hidden sm:block">Add to Google Calendar</span>
            </Button>
            {event.source === 'ticketmaster' && event.url && (
              <Button
                onClick={() => window.open(event.url as string, '_blank', 'noopener,noreferrer')}
                className="gap-2 h-14 px-8 rounded-2xl text-lg font-bold transition-all shadow-lg hover:-translate-y-1 text-white border-0"
                style={{ backgroundColor: '#026cdf' }}
              >
                <ExternalLink className="w-5 h-5" />
                Find Tickets
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-12">
              <section>
                <h3 className="text-2xl font-bold mb-4 opacity-90 tracking-tight">About This Event</h3>
                <p className="whitespace-pre-line text-lg leading-relaxed mix-blend-plus-lighter" style={{ color: mutedTextColor }}>
                  {event.description}
                </p>
              </section>

              <section className="border-t pt-10" style={{ borderColor }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold tracking-tight">Reviews & Ratings</h3>
                  {event.reviews.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: panelBg }}>
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                      <span className="text-lg font-bold">{avgRating.toFixed(1)}</span>
                      <span className="text-sm font-medium" style={{ color: mutedTextColor }}>({event.reviews.length} reviews)</span>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border p-6 mb-8 backdrop-blur-md shadow-sm" style={{ borderColor, backgroundColor: panelBg }}>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2 opacity-90">
                    ✨ AI Review Summary
                  </h3>

                  {summaryLoading && <p className="text-sm font-medium" style={{ color: mutedTextColor }}>Generating summary...</p>}
                  {summaryError && <p className="text-sm text-red-400 font-medium">{summaryError}</p>}

                  {!summaryLoading && !summaryError && reviewSummary && (
                    <div className="text-base leading-relaxed font-medium mix-blend-plus-lighter" style={{ color: mutedTextColor }}>
                      {reviewSummary}
                    </div>
                  )}

                  {!summaryLoading && !summaryError && !reviewSummary && (
                    <p className="text-sm font-medium" style={{ color: mutedTextColor }}>
                      Not enough reviews yet to generate an AI summary.
                    </p>
                  )}
                </div>

                {event.reviews.length > 0 && (
                  <div className="p-5 rounded-2xl mb-8 border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <span className="font-bold opacity-90">Sentiment Analysis:</span>
                      <span style={{ color: mutedTextColor }}>{sentimentSummary}</span>
                    </p>
                  </div>
                )}

                {isAuthenticated ? (
                  <div className="mb-10 p-6 rounded-2xl border" style={{ borderColor, backgroundColor: panelBg }}>
                    <h4 className="font-bold mb-4 text-lg">Add Your Review</h4>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-3 opacity-80">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setRating(num)}
                            className="transition-transform hover:scale-110 active:scale-95"
                          >
                            <Star
                              className={`w-8 h-8 ${num <= rating
                                ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                                : 'text-gray-400/30'
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
                      rows={4}
                      className="mb-5 bg-transparent border-2 rounded-xl text-lg focus:ring-0 focus:border-white/50 placeholder:opacity-50"
                      style={{ borderColor, color: textColor }}
                    />
                    <Button
                      onClick={handleSubmitReview}
                      disabled={!comment.trim() || submitting}
                      className="font-bold rounded-xl px-8"
                      style={{ backgroundColor: isLightText ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.85)', color: isLightText ? domColor : '#ffffff' }}
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                ) : (
                  <p className="font-medium mb-8 p-4 rounded-xl text-center" style={{ backgroundColor: panelBg, color: mutedTextColor }}>
                    Log in to add a review
                  </p>
                )}

                <div className="space-y-6">
                  {event.reviews.length === 0 ? (
                    <p className="text-center py-10 font-medium" style={{ color: mutedTextColor }}>No reviews yet. Be the first to review!</p>
                  ) : (
                    event.reviews.map((review) => (
                      <div key={review.id} className="pb-6 border-b last:border-0" style={{ borderColor }}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold text-lg">{review.userId}</p>
                            <p className="text-sm font-medium mt-0.5" style={{ color: mutedTextColor }}>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full shadow-sm" style={{ backgroundColor: isLightText ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.6)' }}>
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-sm tracking-wide">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-base leading-relaxed mix-blend-plus-lighter" style={{ color: mutedTextColor }}>{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              {/* Location Side Panel */}
              <div className="p-6 rounded-2xl border shadow-sm backdrop-blur-md flex flex-col gap-5" style={{ borderColor, backgroundColor: panelBg }}>
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MapPin className="w-6 h-6 opacity-80" /> Location
                  </h3>
                  <div>
                    <p className="font-bold text-lg mb-1">{event.venue}</p>
                    <p className="font-medium text-base mix-blend-plus-lighter" style={{ color: mutedTextColor }}>{event.location}</p>
                  </div>
                </div>

                {event.coordinates?.lat != null && event.coordinates?.lng != null && (
                  <div className="w-full aspect-square rounded-xl overflow-hidden border shadow-inner transition-opacity" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                    <MiniMap lat={event.coordinates.lat} lng={event.coordinates.lng} />
                  </div>
                )}
              </div>

              {event.attendees.length > 0 && (
                <div className="p-6 rounded-2xl border shadow-sm backdrop-blur-md" style={{ borderColor, backgroundColor: panelBg }}>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 opacity-80" /> Event Buddies
                  </h3>
                  <p className="font-medium mb-4" style={{ color: mutedTextColor }}>
                    <span className="font-bold text-lg" style={{ color: textColor }}>{event.attendees.length}</span> {event.attendees.length === 1 ? 'person is' : 'people are'} attending this event
                  </p>
                  {isAuthenticated && isAttending && (
                    <div className="px-4 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-700 font-semibold mb-2 shadow-inner">
                      You're attending! Connect with other attendees at the event.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}