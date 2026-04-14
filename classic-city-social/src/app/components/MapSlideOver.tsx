'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Map as MapIcon, ChevronRight } from 'lucide-react';
import { EventResponse } from '../models/eventSchema';
import dynamic from 'next/dynamic';
import { EventDetailsDialog } from './EventDetailsDialog';

// Import map dynamically without SSR to avoid 'window is not defined' errors
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-50">Loading map...</div>
});

interface MapSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventResponse[];
  onAttendEvent?: (id: string) => void;
  onAddReview?: (eventId: string, review: any, newEvent?: EventResponse) => void;
}

export function MapSlideOver({ isOpen, onClose, events, onAttendEvent, onAddReview }: MapSlideOverProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);

  // Close when pressing escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Dimmed Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Slide-over Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[600px] lg:w-[800px] bg-white shadow-2xl z-50 flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                  <MapIcon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Events Map</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                aria-label="Close map"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative bg-gray-100 h-full w-full">
              <MapComponent
                events={events}
                onEventClick={(event) => setSelectedEvent(event)}
              />
            </div>

            {/* Display Event Details Dialog over the map instead of a separate page */}
            {selectedEvent && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <EventDetailsDialog
                  event={selectedEvent}
                  onClose={() => setSelectedEvent(null)}
                  onAttend={onAttendEvent || (() => { })}
                  onAddReview={onAddReview || (() => { })}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
