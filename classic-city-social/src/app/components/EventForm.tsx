import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, MapPin, Loader2 } from 'lucide-react';
import { Event } from '../models/eventSchema';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface EventFormProps {
  event?: Event;
  onSubmit: (event: Partial<Event>) => void;
  onCancel: () => void;
}

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || '',
    time: event?.time || '',
    coordinates: {
      lat: event?.coordinates?.lat,
      lng: event?.coordinates?.lng
    },
    location: event?.location || '',
    category: event?.category || 'music',
    imageUrl: event?.imageUrl || '',
    venue: event?.venue || '',
    price: event?.price || '',
  });

  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search for address autofill
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (formData.location && showLocationDropdown && formData.location.length > 3) {
        setIsSearchingLocation(true);
        try {
          // OSM typeahead autofill
          const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(formData.location)}&limit=5`);
          const data = await res.json();
          if (data && data.features) {
            setLocationSuggestions(data.features);
          }
        } catch (error) {
          console.error("Error fetching locations:", error);
        } finally {
          setIsSearchingLocation(false);
        }
      } else {
        setLocationSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.location, showLocationDropdown]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStrictAddress = (props: any) => {
    const parts = [];
    // Combine housenumber and street into a single string if both exist
    if (props.housenumber && props.street) {
      parts.push(`${props.housenumber} ${props.street}`);
    } else if (props.street) {
      parts.push(props.street);
    }

    if (props.city) parts.push(props.city);
    if (props.state) parts.push(props.state);
    if (props.postcode) parts.push(props.postcode);
    return parts.join(', ');
  };

  const handleSelectLocation = (feature: any) => {
    const strictAddress = getStrictAddress(feature.properties);

    // Fallback if no strict address could be formed
    const locationString = strictAddress || feature.properties.name || '';

    handleChange('location', locationString);

    if (feature.properties.name) {
      handleChange('venue', feature.properties.name);
    }

    if (feature.geometry && feature.geometry.coordinates) {
      const lat = feature.geometry.coordinates[1];
      const lng = feature.geometry.coordinates[0];
      console.log('Photon Autocomplete Coordinates extracted:', { lat, lng });
      handleChange('coordinates', { lat, lng });
    } else {
      console.warn('Photon returned no valid geometry coordinates for feature:', feature);
    }

    setShowLocationDropdown(false);
  };

  const categories = ['music', 'sports', 'arts', 'food', 'nature', 'entertainment', 'volunteering', 'tech'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl">{event ? 'Edit Event' : 'Create New Event'}</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              placeholder="e.g., Live Music at The Foundry"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
              rows={4}
              placeholder="Describe your event..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2 relative" ref={dropdownRef}>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => {
                handleChange('location', e.target.value);
                setShowLocationDropdown(true);
              }}
              onFocus={() => setShowLocationDropdown(true)}
              autoComplete="off"
              required
              placeholder="e.g., 40 Watt Club, Athens, GA"
            />
            {showLocationDropdown && (formData.location.length > 3) && (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto" style={{ top: '100%' }}>
                {isSearchingLocation ? (
                  <div className="p-4 text-sm text-gray-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> Searching addresses...
                  </div>
                ) : locationSuggestions.length > 0 ? (
                  <ul className="py-1">
                    {locationSuggestions.map((feature, i) => (
                      <li
                        key={i}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm flex items-start gap-3 border-b last:border-0 transition-colors"
                        onClick={() => handleSelectLocation(feature)}
                      >
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-gray-900 block text-base">{feature.properties.name || feature.properties.street}</span>
                          <span className="text-gray-500 text-sm block mt-0.5">
                            {[feature.properties.city, feature.properties.state, feature.properties.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue Name</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) => handleChange('venue', e.target.value)}
              placeholder="e.g., 40 Watt Club"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="e.g., Free, $10, $20-$50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500">
              Leave blank to use a default image based on category
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {event ? 'Update Event' : 'Create Event'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
