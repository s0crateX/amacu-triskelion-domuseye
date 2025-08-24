'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { messageService } from '@/lib/database/messages';

interface NotificationContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const incrementUnreadCount = useCallback(() => {
    setUnreadCount(prev => prev + 1);
  }, []);

  const decrementUnreadCount = useCallback(() => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      const count = await messageService.getUnreadMessageCount(user.uid);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user?.uid]);

  // Initial load of unread count
  useEffect(() => {
    if (user?.uid) {
      refreshUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [user?.uid, refreshUnreadCount]);

  // Set up real-time listener for unread count changes
  useEffect(() => {
    if (!user?.uid) return;
    
    const unsubscribe = messageService.subscribeToUnreadCount(
      user.uid,
      (count: number) => {
        setUnreadCount(count);
      }
    );
    
    return unsubscribe;
  }, [user?.uid]);

  const value: NotificationContextType = {
    unreadCount,
    setUnreadCount,
    incrementUnreadCount,
    decrementUnreadCount,
    resetUnreadCount,
    refreshUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};