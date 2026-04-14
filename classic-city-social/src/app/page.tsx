'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Calendar, MapPin, Users, Star, Sparkles } from 'lucide-react';
import { Button } from './components/ui/button';

/**
 * Splash/Landing Page
 * Displays the app's value proposition with animated hero section,
 * feature highlights, and CTAs to sign up or browse events
 */
export default function SplashPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Background image overlay - subtle event photo background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url(https://creaturecomfortsbeer.com/wp-content/uploads/2021/03/CCBC_STPavillionPeopleStillInsta-3702-2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Animated decorative blobs - add visual interest and movement */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 bg-red-500 rounded-full opacity-30 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 20, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-500 rounded-full opacity-20 blur-xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        {/* Logo/Brand section - fades in from top */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-red-500" />
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight">ClassicCity<span className="text-red-500">Social</span></h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl">Discover events around UGA campus and the Classic City</p>
        </motion.div>

        {/* Feature cards - highlight 4 main app features */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-6xl w-full"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <Calendar className="w-8 h-8 mb-3 text-red-400" />
            <h3 className="text-lg mb-2">Find Events</h3>
            <p className="text-sm text-gray-300">
              Discover concerts, games, festivals, and more around Athens & UGA
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <Users className="w-8 h-8 mb-3 text-yellow-400" />
            <h3 className="text-lg mb-2">Find Event Buddies</h3>
            <p className="text-sm text-gray-300">
              Connect with others attending the same events
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <Star className="w-8 h-8 mb-3 text-blue-400" />
            <h3 className="text-lg mb-2">Rate & Review</h3>
            <p className="text-sm text-gray-300">
              Share your experiences and read reviews from other students
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <MapPin className="w-8 h-8 mb-3 text-green-400" />
            <h3 className="text-lg mb-2">Explore Athens</h3>
            <p className="text-sm text-gray-300">
              Find historic sites, parks, trails, and local venues
            </p>
          </div>
        </motion.div>

        {/* Detailed description section - explains app benefits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-3xl text-center mb-8 space-y-4"
        >
          <p className="text-lg text-gray-300">ClassicCitySocial is your ultimate guide to experiencing everything Athens and UGA have to offer. From Sanford Stadium to 40 Watt, from the botanical garden to local festivals, never miss out on the action!</p>
          <p className="text-gray-400">Create custom events, mark your attendance, discover random activities when you're bored, and filter by your interests. Explore the Classic City together!</p>
        </motion.div>

        {/* Call-to-action buttons - primary (signup) and secondary (browse) options */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg"
            onClick={() => router.push('/signup')}
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 bg-white/100 text-black hover:bg-white/20 hover:text-white px-8 py-6 text-lg"
            onClick={() => router.push('/events')}
          >Browse Events</Button>
        </motion.div>

        {/* Footer text - handles existing user redirect to login */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 text-sm text-gray-400"
        >
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-red-400 hover:text-red-300 underline"
          >
            Log in here
          </button>
        </motion.p>
      </div>
    </div>
  );
}