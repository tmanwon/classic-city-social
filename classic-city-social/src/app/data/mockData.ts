export interface Event {
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

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  friends: string[]
  imageUrl?: string;
  myEvents: string[]; // IDs of events the user has created
  eventsAttending: string[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  createdAt: string;
}

export interface AthensLocation {
  id: string;
  name: string;
  type: 'historic_site' | 'park' | 'trail';
  description: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Mock Athens data
export const athensLocations: AthensLocation[] = [
  {
    id: '1',
    name: 'State Botanical Garden of Georgia',
    type: 'park',
    description: 'A 313-acre preserve featuring diverse plant collections, nature trails, and educational programs.',
    address: '2450 S Milledge Ave, Athens, GA 30605',
    coordinates: { lat: 33.9108, lng: -83.3768 },
  },
  {
    id: '2',
    name: 'Tree That Owns Itself',
    type: 'historic_site',
    description: 'A famous white oak tree in Athens that is popularly thought to own itself and the land around it.',
    address: 'Dearing St & Finley St, Athens, GA 30605',
    coordinates: { lat: 33.9572, lng: -83.3757 },
  },
  {
    id: '3',
    name: 'Sandy Creek Nature Center',
    type: 'trail',
    description: 'A 225-acre nature preserve with hiking trails, boardwalks, and environmental education.',
    address: '205 Old Commerce Rd, Athens, GA 30607',
    coordinates: { lat: 33.9891, lng: -83.3382 },
  },
  {
    id: '4',
    name: 'Sanford Stadium',
    type: 'historic_site',
    description: "Home of the Georgia Bulldogs football team, one of the most iconic venues in college football.",
    address: 'University of Georgia, Athens, GA 30602',
    coordinates: { lat: 33.9498, lng: -83.3733 },
  },
];

// Mock event data
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Georgia Bulldogs vs. Auburn Tigers',
    description: 'Experience the thrill of SEC football at Sanford Stadium! Watch the Dawgs take on the Tigers in this classic rivalry matchup.',
    date: '2026-10-17',
    time: '15:30',
    location: 'Sanford Stadium, Athens, GA',
    coordinates: { lat: 33.9498, lng: -83.3733 },
    category: 'sports',
    imageUrl: 'https://images.unsplash.com/photo-1659059398425-f0214a2fe0da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwZm9vdGJhbGwlMjBzdGFkaXVtJTIwZ2FtZXxlbnwxfHx8fDE3NzM4Njg2MjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    venue: 'Sanford Stadium',
    price: '$75-$250',
    capacity: 92746,
    attendees: ['user1', 'user2'],
    reviews: [
      {
        id: 'r1',
        userId: 'user1',
        userName: 'Jake Dawson',
        rating: 5,
        comment: 'Incredible atmosphere! Go Dawgs!',
        sentiment: 'positive',
        createdAt: '2026-03-15T10:00:00Z',
      },
      {
        id: 'r1b',
        userId: 'user2',
        userName: 'Alex Rivera',
        rating: 4,
        comment: 'Super exciting game but parking was tough.',
        sentiment: 'positive',
        createdAt: '2026-03-16T10:00:00Z',
      },
    ],
    createdBy: 'system',
    source: 'ticketmaster',
  },
  {
    id: '2',
    title: 'AthFest Music & Arts Festival',
    description: 'Athens premier music and arts festival featuring local bands, artists, and food vendors across downtown.',
    date: '2026-06-26',
    time: '12:00',
    location: 'Downtown Athens, GA',
    coordinates: { lat: 33.9577, lng: -83.3782 },
    category: 'music',
    imageUrl: 'https://images.unsplash.com/photo-1672841821756-fc04525771c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwbXVzaWMlMjBmZXN0aXZhbCUyMGNyb3dkfGVufDF8fHx8MTc3Mzg2ODYyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    venue: 'Downtown Athens',
    price: 'Free',
    attendees: ['user3', 'user4', 'user5'],
    reviews: [
      {
        id: 'r2',
        userId: 'user3',
        userName: 'Emily Chen',
        rating: 5,
        comment: 'Amazing lineup this year! So many talented local artists.',
        sentiment: 'positive',
        createdAt: '2026-03-16T14:30:00Z',
      },
    ],
    createdBy: 'system',
    source: 'eventbrite',
  },
  {
    id: '3',
    title: 'Georgia Museum of Art Exhibition',
    description: 'New contemporary art exhibition featuring regional artists. Free admission for UGA students.',
    date: '2026-04-15',
    time: '10:00',
    location: 'Georgia Museum of Art, Athens, GA',
    coordinates: { lat: 33.9429, lng: -83.3767 },
    category: 'arts',
    imageUrl: 'https://images.unsplash.com/photo-1742497360136-3c7f3110bc26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBnYWxsZXJ5JTIwZXhoaWJpdGlvbiUyMG9wZW5pbmd8ZW58MXx8fHwxNzczNzkzMzc5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    venue: 'Georgia Museum of Art',
    price: 'Free',
    attendees: ['user6'],
    reviews: [],
    createdBy: 'system',
    source: 'athens_data',
  },
  {
    id: '4',
    title: 'Farm to Table Food Festival',
    description: 'Celebrate local agriculture with tastings from Athens best farm-to-table restaurants and food trucks.',
    date: '2026-05-20',
    time: '11:00',
    location: 'Bishop Park, Athens, GA',
    coordinates: { lat: 33.9512, lng: -83.3889 },
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1773720261664-4f031d4ed1a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZmVzdGl2YWwlMjBvdXRkb29yJTIwbWFya2V0fGVufDF8fHx8MTc3Mzg2ODYyMnww&ixlib=rb-4.1.0&q=80&w=1080',
    venue: 'Bishop Park',
    price: '$10-$30',
    attendees: [],
    reviews: [],
    createdBy: 'system',
    source: 'eventbrite',
  },
  {
    id: '5',
    title: 'Botanical Garden Twilight Walk',
    description: 'Evening guided tour through the State Botanical Garden with live music and refreshments.',
    date: '2026-04-10',
    time: '18:30',
    location: 'State Botanical Garden of Georgia',
    coordinates: { lat: 33.9108, lng: -83.3768 },
    category: 'nature',
    imageUrl: 'https://images.unsplash.com/photo-1650558745412-e04ff10d7663?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWtpbmclMjB0cmFpbCUyMG5hdHVyZSUyMHBhcmt8ZW58MXx8fHwxNzczODY4NjIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    venue: 'State Botanical Garden',
    price: '$15',
    attendees: ['user7'],
    reviews: [
      {
        id: 'r3',
        userId: 'user7',
        userName: 'Michael Park',
        rating: 4,
        comment: 'Beautiful gardens and peaceful atmosphere. Great date night activity!',
        sentiment: 'positive',
        createdAt: '2026-03-17T19:00:00Z',
      },
    ],
    createdBy: 'system',
    source: 'athens_data',
  },
  {
    id: '6',
    title: 'Stand-Up Comedy Night',
    description: 'Hilarious evening with touring comedians and local talent. 21+ event.',
    date: '2026-03-28',
    time: '20:00',
    location: '40 Watt Club, Athens, GA',
    coordinates: { lat: 33.9577, lng: -83.3765 },
    category: 'entertainment',
    imageUrl: 'https://images.unsplash.com/photo-1769761341012-526493327ac7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21lZHklMjBzaG93JTIwdGhlYXRlciUyMHBlcmZvcm1hbmNlfGVufDF8fHx8MTc3MzgxNDIyNHww&ixlib=rb-4.1.0&q=80&w=1080',
    venue: '40 Watt Club',
    price: '$20',
    capacity: 250,
    attendees: ['user8', 'user9'],
    reviews: [],
    createdBy: 'system',
    source: 'eventbrite',
  },
];

export const categories = [
  'All',
  'Music',
  'Sports',
  'Arts',
  'Food',
  'Nature',
  'Entertainment',
  'Volunteering',
  'Tech',
];
