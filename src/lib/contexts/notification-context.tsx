"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { messageService } from '@/lib/database/messages'

interface NotificationContextType {
  unreadCount: number
  setUnreadCount: (count: number) => void
  incrementUnreadCount: () => void
  decrementUnreadCount: () => void
  resetUnreadCount: () => void
  refreshUnreadCount: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { userData } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  // Refresh unread count from database
  const refreshUnreadCount = async () => {
    if (!userData?.uid) {
      setUnreadCount(0)
      return
    }

    try {
      const count = await messageService.getUnreadMessageCount(userData.uid)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  // Initialize unread count when user data is available
  useEffect(() => {
    if (userData?.uid) {
      refreshUnreadCount()
    } else {
      setUnreadCount(0)
    }
  }, [userData?.uid])

  const incrementUnreadCount = () => {
    setUnreadCount(prev => prev + 1)
  }

  const decrementUnreadCount = () => {
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const resetUnreadCount = () => {
    setUnreadCount(0)
  }

  const value: NotificationContextType = {
    unreadCount,
    setUnreadCount,
    incrementUnreadCount,
    decrementUnreadCount,
    resetUnreadCount,
    refreshUnreadCount,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}