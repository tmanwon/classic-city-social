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
import {UserType} from '../models/userSchema';

export default function FriendsPage() {
    const router = useRouter();
    const {user, logout} = useAuth();
    const [friends, setFriends] = useState<UserType[]>([]);

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
                <>
                  <div
                    className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
                    onClick={() => router.push('/profile')}
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>{user?.firstName + ' ' + user?.lastName}</span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-white/30 text-black hover:bg-white/10 hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Logout</span>
                  </Button>
                  <Button
                  onClick={() => router.push('/events')}
                    variant="outline"
                    className="border-white/30 text-black hover:bg-white/10 hover:text-white"
                    >
                      <span className="hidden md:inline">Events</span>
                  </Button>
                </> 
            </div>
          </div>
        </div>
      </header>
      </div>
    );
}