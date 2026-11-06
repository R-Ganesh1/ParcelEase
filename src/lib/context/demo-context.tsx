'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole, Society } from '@/types';
import { MockDatabase } from '@/lib/db/mock-db';

interface DemoContextType {
  currentUser: Profile | null;
  setCurrentUser: (user: Profile | null) => void;
  switchRole: (role: UserRole) => void;
  society: Society;
  unreadCount: number;
  refreshState: () => void;
  stateTick: number;
  login: (email: string, password: string, expectedRole?: UserRole) => {
    success: boolean;
    profile?: Profile;
    error?: 'USER_NOT_REGISTERED' | 'INVALID_PASSWORD' | 'ROLE_MISMATCH';
    message?: string;
  };
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    role: UserRole;
    society_id?: string;
    apartment_number?: string;
  }) => {
    success: boolean;
    profile?: Profile;
    error?: string;
  };
  logout: () => void;
  isLoggedIn: boolean;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  // Default to Ramesh Kumar (STAFF) as in the user's screenshot
  const [currentUser, setCurrentUser] = useState<Profile | null>(() => MockDatabase.getProfiles()[1]);
  const [society] = useState<Society>(() => MockDatabase.getSociety());
  const [stateTick, setStateTick] = useState(0);

  const refreshState = () => {
    setStateTick((prev) => prev + 1);
  };

  const switchRole = (role: UserRole) => {
    const profiles = MockDatabase.getProfiles();
    const target = profiles.find((p) => p.role === role);
    if (target) {
      setCurrentUser(target);
      refreshState();
    }
  };

  const login = (email: string, password: string, expectedRole?: UserRole) => {
    const res = MockDatabase.loginUser(email, password, expectedRole);
    if (res.success && res.profile) {
      setCurrentUser(res.profile);
      refreshState();
    }
    return res;
  };

  const register = (data: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    role: UserRole;
    society_id?: string;
    apartment_number?: string;
  }) => {
    const res = MockDatabase.registerUser(data);
    if (res.success && res.profile) {
      setCurrentUser(res.profile);
      refreshState();
    }
    return res;
  };

  const logout = () => {
    setCurrentUser(null);
    refreshState();
  };

  const unreadCount = currentUser
    ? MockDatabase.getNotifications(
        currentUser.role === 'RESIDENT' ? currentUser.id : undefined
      ).filter((n) => !n.read).length
    : 0;

  return (
    <DemoContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        society,
        unreadCount,
        refreshState,
        stateTick,
        login,
        register,
        logout,
        isLoggedIn: currentUser !== null,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
