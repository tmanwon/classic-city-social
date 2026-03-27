'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import  Link  from 'next/link';
import { motion } from 'motion/react';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

/**
 * Signup Page
 * User registration form with name, email, and password validation
 * Creates new user account via AuthContext and redirects to events
 */
export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handles form submission - creates new user account
   * On success: shows toast and redirects to events
   * On error: displays generic error message to prevent info leakage
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signup(email, password, name);
      toast.success('Account created successfully!');
      router.push('/events');
    } catch (error) {
      toast.error('Failed to create account. Check your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-black to-gray-900 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl text-white mb-2">Create Account</h2>
            <p className="text-gray-300">Join the ClassicCitySocial community</p>
          </div>

          {/* Registration form with name, email, and password fields */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full name field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Dawg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@uga.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password field with minimum 6 character requirement */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <p className="text-xs text-gray-400">Must be at least 6 characters</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-6"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-gray-400">or</span>
            </div>
          </div>

          {/* Log in link */}
          <div className="text-center space-y-4">
            <p className="text-gray-300">
              Already have an account?{' '}
              <Link href="/login" className="text-red-400 hover:text-red-300 underline">
                Log in
              </Link>
            </p>
            <Link
              href="/events"
              className="block text-sm text-gray-400 hover:text-gray-300"
            >
              Continue as guest
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
