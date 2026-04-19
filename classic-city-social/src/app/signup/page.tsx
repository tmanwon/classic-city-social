'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Camera } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { doCredentialLogin } from '../../../actions';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { ImageCropper } from '../components/ImageCropper';
import { uploadImage } from '../utils/cdn';

/**
 * Signup Page
 * User registration form with name, email, and password validation
 * Creates new user account via AuthContext and redirects to events
 */
export default function SignupPage() {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showCropperModal, setShowCropperModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Handles form submission - creates new user account
   * On success: shows toast and redirects to events
   * On error: displays generic error message to prevent info leakage
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      if (password.length >= 6 && email.includes('@')) {
        const [firstName, lastName] = name.split(' ');
        const newUser = {
          firstName: firstName || '',
          lastName: lastName || '',
          email: email,
          password: password,
          imageUrl: profileImage || undefined,
          interests: [],
          myEvents: [],
          eventsAttending: [],
          friends: []
        };

        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
        });

        const data = await response.json();


        if (!response.ok) {
          throw new Error(data.error || response.statusText);
        }

        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);

        const res = await doCredentialLogin(formData as any);
        if (res?.error) {
          throw new Error("Authentication failed after signup");
        }

        await update();
        toast.success('Account created successfully!');
        router.push('/events');
        router.refresh();
      } else {
        throw new Error('Invalid input');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred');
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
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl text-white mb-2">Create Account</h2>
            <p className="text-gray-300">Join the ClassicCitySocial community</p>
          </div>

          {/* Profile Image Drag & Drop / Upload Preview */}
          <div className="flex justify-center mb-8">
            <div
              className="relative w-28 h-28 rounded-full border-2 border-dashed border-gray-400 bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors group overflow-hidden"
              onClick={() => setShowCropperModal(true)}
            >
              {profileImage ? (
                <>
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-2 text-center">
                  <Camera className="w-6 h-6 text-gray-400 mb-1 group-hover:text-white transition-colors" />
                  <span className="text-[10px] text-gray-400 font-medium group-hover:text-white transition-colors">Add Photo</span>
                </div>
              )}
            </div>
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center gap-3 text-red-200"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{errorMessage}</p>
            </motion.div>
          )}

          {/* Registration form with name, email, and password fields */}
          <form onSubmit={handleSubmit} className="space-y-5">
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

      {/* Full-screen Cropper Modal Overlay */}
      {showCropperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl overflow-hidden shadow-[0_0_50px_rgba(255,0,0,0.15)]"
          >
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <h3 className="text-white text-lg font-semibold text-center">Crop Profile Picture</h3>
            </div>
            <div className="p-4">
              <ImageCropper
                onCropComplete={async (croppedImage) => {
                  const toastId = toast.loading('Uploading profile picture...');
                  try {
                    const url = await uploadImage(croppedImage);
                    setProfileImage(url);
                    toast.success('Profile picture ready!', { id: toastId });
                    setShowCropperModal(false);
                  } catch (error) {
                    toast.error('Failed to upload image. Please try again.', { id: toastId });
                  }
                }}
                onCancel={() => setShowCropperModal(false)}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
