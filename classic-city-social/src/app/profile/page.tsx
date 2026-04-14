'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { mockEvents } from '../models/mockData';
import { User as MockUser } from '../models/userSchema';
import { EventCard } from '../components/EventCardNew';
import { Camera, Settings, Activity, MapPin, Edit3, ArrowLeft, Users } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUserProfile } = useAuth();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(user?.firstName + ' ' + user?.lastName || '');

  // Ensure user is authenticated to view this page
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  // Mock past events (just selecting a few events the user "attended" or mock ones)
  const pastEvents = mockEvents.slice(0, 3);

  // Mock friends activities
  const friendActivities = [
    { id: 1, friendName: 'Sarah Jenkins', action: 'is attending', eventTitle: 'Botanical Garden Twilight Walk', time: '2 hours ago' },
    { id: 2, friendName: 'Mike Ross', action: 'wrote a review for', eventTitle: 'Stand-Up Comedy Night', time: '5 hours ago' },
    { id: 3, friendName: 'Emily Chen', action: 'created a new event', eventTitle: 'Downtown Art Walk', time: '1 day ago' },
  ];

  const handleSaveName = () => {
    if (editName.trim() === '') {
      toast.error("Name cannot be empty");
      return;
    }
    const [firstName, lastName] = editName.split(' ');
    updateUserProfile({ firstName: firstName, lastName: lastName });
    setIsEditingName(false);
    toast.success("Profile updated");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" className="gap-2 text-gray-600 hover:text-black" onClick={() => router.push('/events')}>
            <ArrowLeft className="w-5 h-5" />
            Back to Events
          </Button>
          <div className="font-semibold text-lg">Profile Dashboard</div>
          <div className="w-24"></div> {/* spacer for centering */}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - User Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Cover Photo background effect */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-red-500 to-yellow-500 z-0"></div>

              {/* Profile Image */}
              <div className="relative z-10 mt-12 mb-4 group cursor-pointer">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200">
                  {user.imageUrl ? (
                    <Image src={user.imageUrl} alt={user.firstName + ' ' + user.lastName} width={128} height={128} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 text-4xl font-bold">
                      {user.firstName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-2 bg-white rounded-full text-black">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Name Details */}
              {isEditingName ? (
                <div className="w-full mb-4 z-10 flex flex-col gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-center font-semibold text-lg"
                    placeholder="Your Name"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="default" onClick={handleSaveName}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => { setIsEditingName(false); setEditName(user.firstName + ' ' + user.lastName); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="mb-6 z-10 relative group">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                    {user.firstName + ' ' + user.lastName}
                    <button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </h2>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              )}

              {/* Stats */}
              <div className="w-full grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 z-10">
                <div>
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Events</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">45</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Friends</div>
                </div>
              </div>
            </motion.div>

            {/* Friend's Activities Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Friends Activity
              </h3>
              <div className="space-y-6">
                {friendActivities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4 relative">
                    {index !== friendActivities.length - 1 && (
                      <div className="absolute top-8 bottom-[-24px] left-5 w-px bg-gray-200"></div>
                    )}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 z-10 border-4 border-white">
                      <span className="text-sm font-bold text-indigo-700">{activity.friendName.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{activity.friendName}</span> {activity.action} <span className="font-semibold">{activity.eventTitle}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Past Attended Events */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full"
            >
              <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-red-500" />
                Past Attended Events
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastEvents.map((event) => (
                  <div key={`profile-event-${event._id}`} className="h-[400px]">
                    {/* We reuse the improved EventCard here! */}
                    <EventCard
                      event={event}
                      onViewDetails={() => router.push('/events')}
                    />
                  </div>
                ))}
              </div>

            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}
