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
  User as UserIcon,
  Shuffle,
  Map as MapIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { mockEvents, categories } from '../models/mockData';
import { EventType, EventResponse } from '../models/eventSchema';
import { Review } from '../models/reviewSchema';
import { User } from '../models/userSchema';
import { EventCard } from '../components/EventCardNew';
import { EventForm } from '../components/EventForm';
import { EventDetailsDialog } from '../components/EventDetailsDialog';
import { MapSlideOver } from '../components/MapSlideOver';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { getUserLocation, calculateDistance } from '../services/api';
import { data } from 'motion/react-client';

/**
 * Events Page
 * Main application page displaying events with advanced filtering and search.
 * Authenticated users can create/edit/delete events and manage interests.
 * All users can browse events, mark attendance, and read/write reviews.
 */
export default function EventsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateUserInterests } = useAuth();

  // Event management state
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventResponse[]>([]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // UI state for modals and interactions
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventResponse | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [showMap, setShowMap] = useState(false);

  // User preferences
  const [userInterests, setUserInterests] = useState<string[]>(user?.interests || []);

  // Fetch user's location for distance-based filtering
  useEffect(() => {
    getUserLocation().then(setUserLocation);
  }, []);

  /**
   * Main filtering logic - applies search, category, distance, and interest filters
   * Interest-based filtering also sorts matching events to the top for authenticated users
   */
  useEffect(() => {
    let filtered = events;

    // Text search - matches title, description, or location
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

    // Distance filter - uses haversine formula to calculate miles from user location
    if (distanceFilter && userLocation) {
      filtered = filtered.filter((event) => {
        if (!event.coordinates) return true;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          event.coordinates.lat || 0,
          event.coordinates.lng || 0
        );
        return distance <= distanceFilter;
      });
    }

    // Personalization - sort events matching user's interests to the top
    if (userInterests.length > 0 && isAuthenticated) {
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

  /**
   * FETCH EVENTS ON PAGE LOAD
   */
  useEffect(() => {
    fetchEvents();
  }, []);


  const fetchBackendEvents = async () => {
    // Fetch events from our DB through our backend API
    try {
      const response = await fetch('/api/events', {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`Error Code ${response.status}: Failed to fetch events from backend API: ${response.statusText}`);
      }
      const backend_data: EventResponse[] = (await response.json()).events;


      return backend_data;

    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events. Please try again later.');
      return [];
    }

  }

  const fetchTicketmasterEvents = async () => {
    // Ticketmaster API fetch (example, not fully implemented)
    try {
      const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?city=Athens&stateCode=GA&size=60&sort=date,asc&apikey=${process.env.NEXT_PUBLIC_TICKETMASTER_API_KEY}`);
      //const response = await fetch('https://app.ticketmaster.com/discovery/v2/events.json?postalCode=30601&apikey=11qju5jEo2UfKLGYhgwWx2waKSz1AcBo');
      if (!response.ok) {
        throw new Error(`Error Code ${response.status}: Failed to fetch events from Ticketmaster: ${response.statusText}`);
      }
      const ticketmaster_data = await response.json();
      console.log('Ticketmaster Data:', ticketmaster_data);
      console.log('Mapped Events:', ticketmaster_data._embedded.events);


      // Get object from ticketmaster_data._embedded.events.images array with largest width and use its url for the event image

      const newEvents: EventResponse[] = ticketmaster_data._embedded.events.map((event: any) => {
        const maxResImg = event.images.reduce((prev: { width: number }, current: { width: number }) => {
          return (prev.width > current.width) ? prev : current;
        });

        return (
          {
            _id: event.id,
            tmid: event.id,
            title: event.name,
            description: event.description || "",
            date: event.dates.start.localDate,
            time: event.dates.start.localTime,
            location: `${event._embedded.venues[0].address.line1}, ${event._embedded.venues[0].city.name}, ${event._embedded.venues[0].state.stateCode} ${event._embedded.venues[0].postalCode}`,
            venue: `${event._embedded.venues[0].name}`,
            coordinates: {
              lat: event._embedded.venues[0].location.latitude,
              lng: event._embedded.venues[0].location.longitude,
            },
            category: event.classifications[0].segment.name,
            imageUrl: maxResImg.url || 'https://images.unsplash.com/photo-1672841821756-fc04525771c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwbXVzaWMlMjBmZXN0aXZhbCUyMGNyb3dkfGVufDF8fHx8MTc3Mzg2ODYyMXww&ixlib=rb-4.1.0&q=80&w=1080',
            price: event.priceRanges ? `$${event.priceRanges[0].min}+` : "Ticketmaster",
            attendees: [],
            reviews: [],
            createdBy: null,
            url: event.url,
            source: 'ticketmaster',
          }
        );
      });

      return newEvents;
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events. Please try again later.');
      return [];
    }
  }

  /**
   * Fetch events from ticketmaster API from the Athens, GA area
   * Fetch additional platform-specific events from our backend API (not implemented yet, just comment out basic prototype code for now)
   * Fetch additional data if authenticated like friends attending, already attending, personalized recommendations, and events the user has created.
   */
  const fetchEvents = async () => {
    fetchBackendEvents().then((backend_data) => {
      fetchTicketmasterEvents().then((ticketmaster_data) => {

        const tmDupeFilteredEvents = ticketmaster_data.filter((event) => {
          return (
            backend_data.find((backendEvent) => backendEvent.tmid === event.tmid) === undefined
          )
        });

        setEvents(events => [...backend_data, ...tmDupeFilteredEvents, ...events]);
      });
    });
  }

  /**
   * Creates a new event and adds it to the top of the list
   * Only available to authenticated users
   */
  const handleCreateEvent = async (eventData: Partial<EventResponse>) => {
    if (!user) return;

    const newEvent: EventType = {
      title: eventData.title!,
      tmid: null,
      description: eventData.description!,
      date: eventData.date!,
      time: eventData.time!,
      location: eventData.location!,
      coordinates: eventData.coordinates!,
      category: eventData.category!,
      imageUrl: eventData.imageUrl || 'https://images.unsplash.com/photo-1672841821756-fc04525771c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwbXVzaWMlMjBmZXN0aXZhbCUyMGNyb3dkfGVufDF8fHx8MTc3Mzg2ODYyMXww&ixlib=rb-4.1.0&q=80&w=1080',
      venue: eventData.venue!,
      price: eventData.price!,
      attendees: [],
      reviews: [],
      createdBy: user.id,
      url: null,
      source: 'ClassicCitySocial',
    };

    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEvent),
    });
    const createdEvent: EventResponse = (await response.json()).event;

    setEvents([createdEvent, ...events]);
    setShowEventForm(false);
    toast.success('Event created successfully!');
  };

  /**
   * Updates an existing event with new data
   */
  const handleUpdateEvent = (eventData: Partial<EventResponse>) => {
    if (!editingEvent) return;

    const updatedEvents = events.map((event) =>
      event._id === editingEvent._id
        ? { ...event, ...eventData }
        : event
    );

    setEvents(updatedEvents);
    setEditingEvent(undefined);
    setShowEventForm(false);
    toast.success('Event updated successfully!');
  };

  /**
   * Removes an event from the list
   */
  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((event) => event._id !== id));
    toast.success('Event deleted');
  };

  /**
   * Toggle user's attendance for an event
   * Adds or removes user ID from attendees list
   */
  const handleAttendEvent = async (id: string) => {
    if (!user) {
      toast.error('Please log in to attend events');
      return;
    }

    let eventExistsInDB = false;

    // Check if there is an event in the database with the same id
    const response = await fetch(`/api/events/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      eventExistsInDB = true;
    } else {
      eventExistsInDB = false;
    }

    if (eventExistsInDB) {

      // Update the event in the database
      const db_event = events.find((e) => e._id === id);
      if (db_event?.attendees.includes(user.id)) { // Remove user from attendees list
        const response = await fetch(`/api/events/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            attendees: events.find((e) => e._id === id)?.attendees.filter((userId) => userId !== user.id),
          }),
        });
      } else { // Add user to attendees list
        const response = await fetch(`/api/events/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            attendees: [...events.find((e) => e._id === id)!.attendees, user.id],
          }),
        });

      }

      const updated_event = (await response.json()).event;

      setEvents((events) => {
        return events.map((event) => {
          if (event._id === id) {
            return updated_event;
          }
          return event;
        })
      }
      );

      const event = events.find((e) => e._id === id);
      const isCurrentlyAttending = event?.attendees.includes(user.id);

      toast.success(isCurrentlyAttending ? 'Removed from attending list' : 'Marked as attending!');
    } else {
      // Event is from ticketmaster, so we'll add it to the database formally to get enhanced social features from our platform
      const event = events.find((e) => e._id === id);
      if (event?.source === 'ticketmaster') {
        if (!event.attendees.includes(user.id)) {
          if (event.url) {
            window.open(event.url.toString(), '_blank');
          } else {
            toast.error('No URL found for this event');
          }
        }
      }
    }
    /*
    console.log(eventExistsInDB);
    const selected_event: EventResponse = (await response.json()).event;

    if (selected_event === undefined) {
      toast.error('Event not found');
      return;
    }



        const selected_event = events.find((e) => e._id === id)
    
        if (selected_event === undefined) {
    
        }
    
        if (selected_event?.source === 'ticketmaster') {
          //toast.error('You cannot attend events from Ticketmaster');
          if (!selected_event.attendees.includes(user.id)) {
            if (selected_event.url) {
              window.open(selected_event.url.toString(), '_blank');
            } else {
              toast.error('No URL found for this event');
            }
          }
        }
    
        setEvents(
          events.map((event) => {
            if (event._id === id) {
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
    
        const event = events.find((e) => e._id === id);
        const isCurrentlyAttending = event?.attendees.includes(user.id);
    
        toast.success(isCurrentlyAttending ? 'Removed from attending list' : 'Marked as attending!');
        */
  };

  /**
   * Adds a review to an event and updates both the events list
   * and the currently viewed event details
   */
  const handleAddReview = (eventId: string, review: Review) => {
    setEvents(
      events.map((event) =>
        event._id === eventId
          ? { ...event, reviews: [...event.reviews, review] }
          : event
      )
    );

    // Keep selected event in sync with updated reviews
    if (selectedEvent?._id === eventId) {
      setSelectedEvent({
        ...selectedEvent,
        reviews: [...selectedEvent.reviews, review],
      });
    }
  };

  /**
   * Picks a random event from the filtered list
   * Useful when user doesn't know what to do or wants discovery
   */
  const handleSurpriseMe = () => {
    if (filteredEvents.length === 0) {
      toast.error('No events available');
      return;
    }
    const randomEvent = filteredEvents[Math.floor(Math.random() * filteredEvents.length)];
    setSelectedEvent(randomEvent);
    toast.success('Surprise! Here\'s a random event for you!');
  };

  /**
   * Toggles interest tags for personalized filtering
   * Updates user preferences in AuthContext
   */
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
      {/* Navigation header - shows user info and auth/logout buttons */}
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
                  <div
                    className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
                    onClick={() => router.push('/profile')}
                  >
                    <UserIcon className="w-4 h-4" />
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
                    className="border-white/30 text-black hover:bg-white/10 hover:text-white"
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
        {/* Filtering and search controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Text search across event titles, descriptions, and locations */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11"
              />
            </div>

            {/* Category dropdown filter */}
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

            {/* Distance-based location filter */}
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

            {/* Random event picker for discovery */}
            <Button
              onClick={handleSurpriseMe}
              variant="outline"
              className="gap-2 whitespace-nowrap"
            >
              <Shuffle className="w-4 h-4" />
              Surprise Me!
            </Button>

            {/* Map View Toggle */}
            <Button
              onClick={() => setShowMap(true)}
              className="gap-2 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MapIcon className="w-4 h-4" />
              Map View
            </Button>
          </div>

          {/* Interest-based personalization - user can toggle to prioritize certain event types */}
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

        {/* Search results counter */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
          </p>
        </div>

        {/* Events grid - displays all filtered events */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">No events found</p>
            <p className="text-gray-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event._id}
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

      {/* Modal for creating or editing an event */}
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

      {/* Modal for viewing full event details, adding reviews, and marking attendance */}
      {selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onAddReview={handleAddReview}
          onAttend={handleAttendEvent}
        />
      )}

      {/* Map Slide-over */}
      <MapSlideOver
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        events={filteredEvents}
        onAttendEvent={handleAttendEvent}
      />
    </div>
  );
}