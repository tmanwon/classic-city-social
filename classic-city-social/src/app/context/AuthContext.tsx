'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserResponse, UserType, User } from '../models/userSchema';

/*
interface User {
  id: string;
  email: string;
  name: string;
  interests: string[];
  imageUrl?: string;
  friends?: string[];
  myEvents?: string[];
  eventsAttending?: string[];
  location?: {
    lat: number;
    lng: number;
  };
}
*/

interface AuthContextType {
  user: UserResponse | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, imageUrl?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserInterests: (interests: string[]) => void;
  updateUserProfile: (updates: Partial<UserResponse>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    return new Promise<void>(async (resolve, reject) => {

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const user: UserResponse = await response.json();

      if (response.ok) {
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        resolve();
      } else if (response.status === 401) {
        reject(new Error('Invalid email or password'));
      } else {
        reject(new Error(response.statusText));
      }



      /*
      setTimeout(() => {
        if (password.length >= 6) {
          const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            name: email.split('@')[0],
            interests: [],
          };
          setUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
      */
    });
  };

  const signup = async (email: string, password: string, name: string, imageUrl?: string) => {
    // Simulate API call
    return new Promise<void>(async (resolve, reject) => {
      if (password.length >= 6 && email.includes('@')) {

        // Split name into first and last name
        const [firstName, lastName] = name.split(' ');
        const newUser: UserType = {
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password,
          imageUrl: imageUrl,
          interests: [],
          myEvents: [],
          eventsAttending: [],
          friends: []
        };

        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUser),
        });

        const data = await response.json();

        if (response.ok) {
          const user: UserResponse = data;
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
          resolve();
        } else {
          reject(new Error(data.error || response.statusText));
        }

      } else {
        reject(new Error('Invalid input'));
      }


      /*
      setTimeout(() => {
        if (password.length >= 6 && email.includes('@')) {
          const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            name,
            imageUrl,
            interests: [],
          };
          setUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
          resolve();
        } else {
          reject(new Error('Invalid input'));
        }
      }, 500);
      */
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUserInterests = (interests: string[]) => {
    if (user) {
      const updatedUser = { ...user, interests };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const updateUserProfile = (updates: Partial<UserResponse>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        updateUserInterests,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
