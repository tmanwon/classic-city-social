'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Event } from '../data/mockData';
import { EventCard } from './EventCardNew';

// Fix for default marker icons in Leaflet with webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

// Helper component to adjust map bounds to fit all markers
function MapBounds({ events }: { events: Event[] }) {
  const map = useMap();

  useEffect(() => {
    if (events.length === 0) return;

    const bounds = L.latLngBounds(events.map(e => [e.coordinates?.lat || 33.9519, e.coordinates?.lng || -83.3576]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [events, map]);

  return null;
}

export default function MapComponent({ events, onEventClick }: MapComponentProps) {
  // Athens, GA center default
  const defaultCenter: [number, number] = [33.9519, -83.3576];

  const eventsWithCoords = events.filter(e => e.coordinates);

  if (eventsWithCoords.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
        No events with location data available
      </div>
    );
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      className="w-full h-full z-0 font-sans"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBounds events={eventsWithCoords} />

      {eventsWithCoords.map((event) => (
        <Marker
          key={event.id}
          position={[event.coordinates!.lat, event.coordinates!.lng]}
          eventHandlers={{
            click: () => onEventClick(event),
            mouseover: (e: L.LeafletEvent) => e.target.openPopup(),
            mouseout: (e: L.LeafletEvent) => e.target.closePopup(),
          }}
        >
          <Popup className="custom-popup" interactive={true} minWidth={280}>
            {/* Render a simplified mini card inside the popup to avoid heavy mounting bugs */}
            <div className="flex flex-col gap-2 cursor-pointer w-full min-w-[250px]" onClick={() => onEventClick(event)}>
              <img src={event.imageUrl} alt={event.title} className="w-full h-24 object-cover rounded-md" />
              <h4 className="font-bold text-sm leading-tight text-gray-900 mt-1">{event.title}</h4>
              <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()} • {event.time}</p>
              <div className="text-blue-600 text-xs font-semibold mt-1">View Details →</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
