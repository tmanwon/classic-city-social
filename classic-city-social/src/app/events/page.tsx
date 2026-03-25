'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  LogOut, 
  Search, 
  Filter, 
  Sparkles, 
  MapPin, 
  User,
  Shuffle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Event, mockEvents, categories, Review } from '../data/mockData';
import { EventCard } from '../components/EventCard';
import { EventForm } from '../components/EventForm';
import { EventDetailsDialog } from '../components/EventDetailsDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { getUserLocation, calculateDistance } from '../services/api';

export default function EventsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateUserInterests } = useAuth();
  
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(mockEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [userInterests, setUserInterests] = useState<string[]>(user?.interests || []);

  // Get user location on mount
  useEffect(() => {
    getUserLocation().then(setUserLocation);
  }, []);

  // Filter events based on search, category, distance, and interests
  useEffect(() => {
    let filtered = events;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        (event) => event.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Distance filter
    if (distanceFilter && userLocation) {
      filtered = filtered.filter((event) => {
        if (!event.coordinates) return true;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          event.coordinates.lat,
          event.coordinates.lng
        );
        return distance <= distanceFilter;
      });
    }

    // Interest-based filter (if user has interests selected)
    if (userInterests.length > 0 && isAuthenticated) {
      // Sort by matching interests
      filtered = filtered.sort((a, b) => {
        const aMatch = userInterests.includes(a.category.toLowerCase());
        const bMatch = userInterests.includes(b.category.toLowerCase());
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }

    setFilteredEvents(filtered);
  }, [searchQuery, selectedCategory, distanceFilter, events, userLocation, userInterests, isAuthenticated]);

  const handleCreateEvent = (eventData: Partial<Event>) => {
    if (!user) return;

    const newEvent: Event = {
      id: Math.random().toString(36).substr(2, 9),
      title: eventData.title!,
      description: eventData.description!,
      date: eventData.date!,
      time: eventData.time!,
      location: eventData.location!,
      category: eventData.category!,
      imageUrl: eventData.imageUrl || 'https://images.unsplash.com/photo-1672841821756-fc04525771c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwbXVzaWMlMjBmZXN0aXZhbCUyMGNyb3dkfGVufDF8fHx8MTc3Mzg2ODYyMXww&ixlib=rb-4.1.0&q=80&w=1080',
      venue: eventData.venue,
      price: eventData.price,
      attendees: [],
      reviews: [],
      createdBy: user.id,
      source: 'user',
    };

    setEvents([newEvent, ...events]);
    setShowEventForm(false);
    toast.success('Event created successfully!');
  };

  const handleUpdateEvent = (eventData: Partial<Event>) => {
    if (!editingEvent) return;

    const updatedEvents = events.map((event) =>
      event.id === editingEvent.id
        ? { ...event, ...eventData }
        : event
    );

    setEvents(updatedEvents);
    setEditingEvent(undefined);
    setShowEventForm(false);
    toast.success('Event updated successfully!');
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
    toast.success('Event deleted');
  };

  const handleAttendEvent = (id: string) => {
    if (!user) {
      toast.error('Please log in to attend events');
      return;
    }

    setEvents(
      events.map((event) => {
        if (event.id === id) {
          const isAttending = event.attendees.includes(user.id);
          return {
            ...event,
            attendees: isAttending
              ? event.attendees.filter((userId) => userId !== user.id)
              : [...event.attendees, user.id],
          };
        }
        return event;
      })
    );

    const event = events.find((e) => e.id === id);
    const isCurrentlyAttending = event?.attendees.includes(user.id);
    
    toast.success(isCurrentlyAttending ? 'Removed from attending list' : 'Marked as attending!');
  };

  const handleAddReview = (eventId: string, review: Review) => {
    setEvents(
      events.map((event) =>
        event.id === eventId
          ? { ...event, reviews: [...event.reviews, review] }
          : event
      )
    );
    
    // Update selected event if viewing details
    if (selectedEvent?.id === eventId) {
      setSelectedEvent({
        ...selectedEvent,
        reviews: [...selectedEvent.reviews, review],
      });
    }
  };

  const handleSurpriseMe = () => {
    if (filteredEvents.length === 0) {
      toast.error('No events available');
      return;
    }
    const randomEvent = filteredEvents[Math.floor(Math.random() * filteredEvents.length)];
    setSelectedEvent(randomEvent);
    toast.success('Surprise! Here\'s a random event for you!');
  };

  const handleToggleInterest = (interest: string) => {
    const newInterests = userInterests.includes(interest)
      ? userInterests.filter((i) => i !== interest)
      : [...userInterests, interest];
    
    setUserInterests(newInterests);
    if (user) {
      updateUserInterests(newInterests);
      toast.success('Interests updated!');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-black text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
              <Sparkles className="w-8 h-8" />
              <h1 className="text-2xl md:text-3xl font-bold">ClassicCity<span className="text-red-500">Social</span></h1>
            </div>
            
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
                    <User className="w-4 h-4" />
                    <span>{user?.name}</span>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingEvent(undefined);
                      setShowEventForm(true);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden md:inline">Add Event</span>
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Logout</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => router.push('/login')}
                    variant="outline"
                    className="border-white/30 text-black hover:bg-white/10 hover:text-white"
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => router.push('/signup')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11"
              />
            </div>

            {/* Category filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Distance filter */}
            <Select
              value={distanceFilter?.toString() || 'all'}
              onValueChange={(val) => setDistanceFilter(val === 'all' ? null : Number(val))}
            >
              <SelectTrigger className="w-full md:w-48">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Distances</SelectItem>
                <SelectItem value="2">Within 2 miles</SelectItem>
                <SelectItem value="5">Within 5 miles</SelectItem>
                <SelectItem value="10">Within 10 miles</SelectItem>
              </SelectContent>
            </Select>

            {/* Surprise me button */}
            <Button
              onClick={handleSurpriseMe}
              variant="outline"
              className="gap-2 whitespace-nowrap"
            >
              <Shuffle className="w-4 h-4" />
              Surprise Me!
            </Button>
          </div>

          {/* Interest badges */}
          {isAuthenticated && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Filter by your interests:</p>
              <div className="flex flex-wrap gap-2">
                {categories.filter(c => c !== 'All').map((category) => (
                  <Badge
                    key={category}
                    variant={userInterests.includes(category.toLowerCase()) ? 'default' : 'outline'}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => handleToggleInterest(category.toLowerCase())}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
          </p>
        </div>

        {/* Events grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">No events found</p>
            <p className="text-gray-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={(event) => {
                  setEditingEvent(event);
                  setShowEventForm(true);
                }}
                onDelete={handleDeleteEvent}
                onAttend={handleAttendEvent}
                onViewDetails={setSelectedEvent}
              />
            ))}
          </div>
        )}
      </div>

      {/* Event form modal */}
      {showEventForm && (
        <EventForm
          event={editingEvent}
          onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
          onCancel={() => {
            setShowEventForm(false);
            setEditingEvent(undefined);
          }}
        />
      )}

      {/* Event details modal */}
      {selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onAddReview={handleAddReview}
          onAttend={handleAttendEvent}
        />
      )}
    </div>
  );
}