import { color, motion } from 'motion/react';
import { Calendar, MapPin, Users, Star, ExternalLink, UserCheck } from 'lucide-react';
import { EventResponse } from '../models/eventSchema';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from '../context/AuthContext';
import { generateSentimentSummary } from '../services/api';
import { useExtractColors } from "react-extract-colors";
import Image from 'next/image';
import { Londrina_Solid } from 'next/font/google';
import { useState, useEffect } from 'react';

interface EventCardProps {
  event: EventResponse;
  onEdit?: (event: EventResponse) => void;
  onDelete?: (id: string) => void;
  onAttend?: (id: string) => void;
  onViewDetails?: (event: EventResponse) => void;
}

export function EventCard({ event, onEdit, onDelete, onAttend, onViewDetails }: EventCardProps) {
  const { user, isAuthenticated } = useAuth();
  const isAttending = user ? event.attendees.includes(user.id) : false;
  const avgRating = event.reviews.length > 0
    ? event.reviews.reduce((sum, r) => sum + r.rating, 0) / event.reviews.length
    : 0;

  const sentimentSummary = generateSentimentSummary(event.reviews);
  const categoryColors: Record<string, string> = {
    music: 'bg-purple-500',
    sports: 'bg-red-500',
    arts: 'bg-blue-500',
    food: 'bg-orange-500',
    nature: 'bg-green-500',
    entertainment: 'bg-yellow-500',
    volunteering: 'bg-pink-500',
    tech: 'bg-cyan-500',
  };
  const { colors, loading } = useExtractColors(event.imageUrl, {
    maxColors: 3,
    format: "hex",
    maxSize: 200,
    sortBy: "dominance"
  });

  const [domColor, setDomColor] = useState<string>('#000000');

  useEffect(() => {
    if (!loading && colors && colors.length > 0) {
      setDomColor(colors[0]);
    }
  }, [loading, colors]);

  // Convert hex to rgb for rgba usage
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  };

  const rgbDom = hexToRgb(domColor);

  // Calculate relative luminance to determine text color (black or white)
  const getContrastColor = (hexColor: string) => {
    const rgb = hexToRgb(hexColor).split(',').map(Number);
    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    return luminance > 0.6 ? '#1a1a1a' : '#ffffff';
  };

  const textColor = getContrastColor(domColor);
  const isLightText = textColor === '#ffffff';
  const mutedTextColor = isLightText ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  const borderColor = isLightText ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  const categoryColor = categoryColors[event.category.toLowerCase()] || 'bg-gray-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card
        className="group relative overflow-hidden h-full min-h-[440px] flex flex-col border-0 shadow-lg hover:shadow-2xl transition-all duration-500"
        style={{ backgroundColor: domColor }}
      >
        {/* Background Image Container */}
        <div className="absolute inset-x-0 top-0 h-[65%] w-full overflow-hidden z-0">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill={true}
            sizes="(max-width: 400px) 100vw, 400px"
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex gap-2 z-20">
            <Badge className={`${categoryColor} text-white border-0 shadow-md backdrop-blur-md`}>
              {event.category}
            </Badge>
            {event.source !== 'ClassicCitySocial' && (
              <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white border-0 shadow-md">
                {event.source}
              </Badge>
            )}
          </div>

          {isAttending && (
            <div className="absolute top-4 right-4 z-20">
              <Badge className="bg-green-500/90 backdrop-blur-md text-white border-0 shadow-md flex items-center gap-1.5 px-3 py-1">
                <UserCheck className="w-3.5 h-3.5" />
                Attending
              </Badge>
            </div>
          )}

          {/* Smooth Gradient Overlay syncing with the dominant color */}
          <div
            className="absolute inset-x-0 bottom-0 h-full max-h-[120%]"
            style={{
              background: `linear-gradient(to top, rgba(${rgbDom}, 1) 0%, rgba(${rgbDom}, 0.95) 15%, rgba(${rgbDom}, 0.7) 35%, rgba(${rgbDom}, 0) 100%)`
            }}
          />
        </div>

        {/* Content Container - Starts overlapping the image gradient */}
        <div className="relative z-10 flex flex-col flex-1 mt-[45%] rounded-t-3xl pt-6 pb-5 px-6">
          <CardHeader className="p-0 mb-4 z-20">
            <h3
              className="text-2xl font-bold line-clamp-2 leading-tight tracking-tight drop-shadow-sm transition-colors duration-300"
              style={{ color: textColor }}
            >
              {event.title}
            </h3>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm font-medium">
              <div className="flex items-center gap-1.5" style={{ color: mutedTextColor }}>
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5" style={{ color: mutedTextColor }}>
                <Users className="w-4 h-4" />
                <span>{event.attendees.length} attending</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 z-20 flex flex-col gap-3">
            <div className="flex items-start gap-2 text-sm font-medium" style={{ color: textColor }}>
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-80" />
              <span className="line-clamp-2 leading-snug">{event.venue}</span>
            </div>

            <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: mutedTextColor }}>
              {event.description}
            </p>

            <div className="flex items-center justify-between mt-auto pt-2">
              {event.price && (
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider font-bold mb-0.5" style={{ color: mutedTextColor }}>Tickets</span>
                  <span className="font-semibold text-lg leading-none" style={{ color: textColor }}>{event.price}</span>
                </div>
              )}

              {event.reviews.length > 0 && (
                <div className="flex flex-col items-end">
                  <span className="text-xs uppercase tracking-wider font-bold mb-0.5" style={{ color: mutedTextColor }}>Rating</span>
                  <div className="flex items-center gap-1 font-semibold leading-none">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span style={{ color: textColor }}>{avgRating.toFixed(1)}</span>
                    <span className="text-xs ml-1 font-normal opacity-70" style={{ color: textColor }}>({event.reviews.length})</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter
            className="flex flex-col gap-3 p-0 pt-5 mt-5 border-t border-solid z-20"
            style={{ borderColor: borderColor }}
          >
            <div className="flex gap-3 w-full">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 font-semibold rounded-xl h-10 transition-transform active:scale-95 shadow-sm"
                style={{
                  backgroundColor: isLightText ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                  color: textColor
                }}
                onClick={() => onViewDetails?.(event)}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Details
              </Button>

              {isAuthenticated && onAttend && (
                <Button
                  size="sm"
                  variant={isAttending ? "secondary" : "default"}
                  className={`flex-1 font-semibold rounded-xl h-10 transition-transform active:scale-95 shadow-md ${isAttending ? 'opacity-80' : 'hover:scale-[1.02]'
                    }`}
                  style={{
                    backgroundColor: isLightText ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)',
                    color: isLightText ? domColor : '#ffffff',
                  }}
                  onClick={() => onAttend(event._id)}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  {isAttending ? 'Attending' : 'Attend'}
                </Button>
              )}
            </div>

            {isAuthenticated && user && event.createdBy === user.id && (
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl h-9 bg-transparent border-dashed border-2 hover:bg-white/10"
                  style={{ color: textColor, borderColor: borderColor }}
                  onClick={() => onEdit?.(event)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 rounded-xl h-9 hover:bg-red-600"
                  onClick={() => onDelete?.(event._id)}
                >
                  Delete
                </Button>
              </div>
            )}
          </CardFooter>
        </div>
      </Card>
    </motion.div>
  );
}
