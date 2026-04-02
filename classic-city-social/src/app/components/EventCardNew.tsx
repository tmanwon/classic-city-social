import { color, motion } from 'motion/react';
import { Calendar, MapPin, Users, Star, ExternalLink, UserCheck } from 'lucide-react';
import { Event } from '../data/mockData';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from '../context/AuthContext';
import { generateSentimentSummary } from '../services/api';
import { useExtractColors } from "react-extract-colors";
import Image from 'next/image';
import { Londrina_Solid } from 'next/font/google';
import { use, useEffect } from 'react';

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
  const { colors, loading } = useExtractColors(event.imageUrl, {
    maxColors: 3,
    format: "rgb",
    maxSize: 200,
    sortBy: "dominance"
  });

  useEffect(() => {
    if (colors[0] && colors[1] && colors[2]) {
    colors[0] = colors[0].replace('rgb', 'rgba').replace(')', ', 1.0)');
    colors[1] = colors[1].replace('rgb', 'rgba').replace(')', ', 0.97)');
    colors[2] = colors[2].replace('rgb', 'rgba').replace(')', ', 0.8)');
    //colors.reverse();
    }
  }, [loading]);
  //console.log('Extracted colors:', colors);
  

  const categoryColor = categoryColors[event.category.toLowerCase()] || 'bg-gray-500';
/*
  <div className="self-stretch self-stretch relative bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-black/10 overflow-hidden">
<div className="w-[483px] h-[614px] left-[1px] top-[1px] absolute overflow-hidden">
<img className="w-[483px] h-[614px] left-0 top-0 absolute" src="https://placehold.co/483x614" />
<div className="w-36 h-5 left-[12px] top-[12px] absolute inline-flex justify-start items-start gap-2">
<div className="w-14 h-5 px-2 py-0.5 bg-red-500 rounded-lg flex justify-center items-center gap-1 overflow-hidden">
<div className="justify-start text-white text-xs font-medium font-['Inter'] leading-4">party</div>
</div>
<div className="w-28 h-5 px-2 py-0.5 bg-black/70 rounded-lg flex justify-center items-center gap-1 overflow-hidden">
<div className="justify-start text-white text-xs font-medium font-['Inter'] leading-4">ClassicCitySocial</div>
</div>
</div>
</div>
<div className="w-[483px] h-96 left-[1px] top-[165px] absolute bg-gradient-to-b from-orange-300/0 to-orange-300" />
<div className="w-[481px] h-96 left-[3px] top-[117px] absolute bg-[radial-gradient(ellipse_62.87%_62.87%_at_50.00%_50.00%,_rgba(83.17,_83.17,_83.17,_0.69)_0%,_rgba(83,_83,_83,_0)_100%)]" />
<div className="w-[483.33px] h-20 py-6 left-[1px] top-[534px] absolute border-t border-black/10 inline-flex flex-col justify-start items-center"></div>
  */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow z-0" style={{backgroundImage: `url(${event.imageUrl})`, backgroundSize: 'contain', backgroundPosition: 'top'}}>
        {/* Image */}
        {/*
        <div className="relative h-48 overflow-hidden z-1">
          */}
        <div className="relative h-48 overflow-hidden z-1">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill={true}
            sizes="(max-width: 354px)"
            loading='lazy'
            className="invisible w-full h-full object-cover"
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
        
        <div className="flex-1 flex flex-col " style={{ background: `linear-gradient(to top, ${colors[0]} 0%, ${colors[1]} 70%, ${colors[2]} 90%, transparent 100%)` }}>
        <CardHeader className="pb-3 z-2">
          <h3 className="text-xl font-semibold line-clamp-2" style={{ color: `contrast-color(${colors[2]})` }}>{event.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4"  style={{ color: `contrast-color(${colors[1]})` }}/>
              <span style={{ color: `contrast-color(${colors[1]})` }}>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" style={{ color: `contrast-color(${colors[1]})` }}/>
              <span style={{ color: `contrast-color(${colors[1]})` }}>{event.attendees.length}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-3 z-2">
          <p className="text-sm text-gray-700 line-clamp-3 mb-3" style={{ color: `contrast-color(${colors[1]})` }}>{event.description}</p>
          
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: `contrast-color(${colors[1]})` }}/>
            <span className="line-clamp-2" style={{ color: `contrast-color(${colors[1]})` }}>{event.location}</span>
          </div>

          {event.price && (
            <p className="text-sm mb-2">
              <span className="text-gray-600" style={{ color: `contrast-color(${colors[1]})` }}>
                Price: 
              </span>
              <span className="font-medium" style={{ color: `contrast-color(${colors[1]})` }}>{" " + event.price}</span>
            </p>
          )}

          {event.reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium" style={{ color: `contrast-color(${colors[1]})` }}>
                  {avgRating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-gray-600" style={{ color: `contrast-color(${colors[1]})` }}>
                ({event.reviews.length} reviews)
              </span>
            </div>
          )}

          {event.reviews.length > 0 && (
            <p className="text-xs text-gray-500 italic" style={{ color: `contrast-color(${colors[1]})` }}>{sentimentSummary}</p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-3 border-t z-2">
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
        </div>
      </Card>
    </motion.div>
  );
}
