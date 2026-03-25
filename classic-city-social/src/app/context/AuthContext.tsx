'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  interests: string[];
  location?: {
    lat: number;
    lng: number;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserInterests: (interests: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
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
    });
  };

  const signup = async (email: string, password: string, name: string) => {
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (password.length >= 6 && email.includes('@')) {
          const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            name,
            interests: [],
          };
          setUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
          resolve();
        } else {
          reject(new Error('Invalid input'));
        }
      }, 500);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        updateUserInterests,
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
