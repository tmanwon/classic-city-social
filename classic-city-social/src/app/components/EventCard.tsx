import { motion } from 'motion/react';
import { Calendar, MapPin, Users, Star, ExternalLink, UserCheck } from 'lucide-react';
import { Event } from '../models/mockData';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from '../context/AuthContext';
import { generateSentimentSummary } from '../services/api';
import Image from 'next/image';

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (id: string) => void;
  onAttend?: (id: string) => void;
  onViewDetails?: (event: Event) => void;
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

  const categoryColor = categoryColors[event.category.toLowerCase()] || 'bg-gray-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden h-full flex flex-col gap-0 hover:shadow-xl transition-shadow">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill={true}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={`${categoryColor} text-white border-0`}>
              {event.category}
            </Badge>
            {event.source !== 'user' && (
              <Badge variant="secondary" className="bg-black/70 text-white border-0">
                {event.source}
              </Badge>
            )}
          </div>
          {isAttending && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-600 text-white border-0 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                Attending
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <h3 className="text-xl line-clamp-2">{event.title}</h3>
          {/* <div className="w-64 justify-start text-neutral-950 text-xl font-[600] font-inter leading-7">{event.title}</div> */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{event.attendees.length}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-3">
          <p className="text-sm text-gray-700 line-clamp-3 mb-3">{event.description}</p>

          <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{event.location}</span>
          </div>

          {event.price && (
            <p className="text-sm mb-2">
              <span className="text-gray-600">Price:</span> <span className="font-medium">{event.price}</span>
            </p>
          )}

          {event.reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{avgRating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-600">({event.reviews.length} reviews)</span>
            </div>
          )}

          {event.reviews.length > 0 && (
            <p className="text-xs text-gray-500 italic">{sentimentSummary}</p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-3 border-t">
          <div className="flex gap-2 w-full">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => onViewDetails?.(event)}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Details
            </Button>

            {isAuthenticated && onAttend && (
              <Button
                variant={isAttending ? "secondary" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => onAttend(event.id)}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                {isAttending ? 'Attending' : 'Attend'}
              </Button>
            )}
          </div>

          {isAuthenticated && user && event.createdBy === user.id && (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit?.(event)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => onDelete?.(event.id)}
              >
                Delete
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
