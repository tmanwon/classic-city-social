import { Review } from './reviewSchema';

export type Event = {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    category: string;
    imageUrl: string;
    venue?: string;
    price?: string;
    capacity?: number;
    attendees: string[];
    reviews: Review[];
    createdBy?: string; // user ID of the creator
    source: 'user' | 'eventbrite' | 'ticketmaster' | 'athens_data';
}