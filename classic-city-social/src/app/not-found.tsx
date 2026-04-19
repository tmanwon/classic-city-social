'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from './components/ui/button';

/**
 * 404 Not Found Page
 * Custom error page that matches the app's dark theme with gradient background
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-black to-gray-900 text-white relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background image overlay - subtle event photo background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'url(https://creaturecomfortsbeer.com/wp-content/uploads/2021/03/CCBC_STPavillionPeopleStillInsta-3702-2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Animated decorative blobs */}
      <motion.div
        className="absolute top-20 left-10 w-24 h-24 bg-red-500 rounded-full opacity-20 blur-xl"
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
        className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-500 rounded-full opacity-15 blur-xl"
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

      {/* Main content */}
      <motion.div
        className="relative z-10 text-center max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 404 Number */}
        <motion.div
          className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-yellow-500 mb-4"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
        >
          404
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl font-bold mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Page Not Found
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-gray-300 text-lg mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Oops! The page you're looking for seems to have wandered off. 
          Let's get you back on track.
        </motion.p>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            asChild
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold transition-all duration-200 hover:scale-105"
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>

          <Button
            asChild
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-full font-semibold transition-all duration-200 hover:scale-105"
          >
            <Link href="/events" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Browse Events
            </Link>
          </Button>
        </motion.div>

        {/* Back button hint */}
        <motion.p
          className="mt-8 text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Or press the back button in your browser
        </motion.p>
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-16 h-16 bg-red-400 rounded-full opacity-10 blur-lg"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-yellow-400 rounded-full opacity-10 blur-lg"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}