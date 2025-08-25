"use client"

import { AdminAuthProvider } from "@/lib/auth/admin-auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth/auth-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { Toaster } from "sonner"
import FloatingChatbot from "@/components/chatbot-box"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <FloatingChatbot />
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <NotificationProvider>
            <AdminAuthProvider>
              {children}
              <Toaster />
            </AdminAuthProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  )
}