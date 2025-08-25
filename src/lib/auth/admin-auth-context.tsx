"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getCurrentAdminData, AdminData } from './admin-auth-utils';

interface AdminAuthContextType {
  user: User | null;
  adminData: AdminData | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshAdminData: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAdminData = async () => {
    if (user) {
      try {
        const data = await getCurrentAdminData(user.uid);
        setAdminData(data);
      } catch (error) {
        console.error('Error refreshing admin data:', error);
        setAdminData(null);
      }
    } else {
      setAdminData(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const data = await getCurrentAdminData(user.uid);
          setAdminData(data);
        } catch (error) {
          console.error('Error fetching admin data:', error);
          setAdminData(null);
        }
      } else {
        setAdminData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AdminAuthContextType = {
    user,
    adminData,
    loading,
    isAuthenticated: !!user && !!adminData,
    isAdmin: !!user && !!adminData && adminData.isActive,
    refreshAdminData,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};