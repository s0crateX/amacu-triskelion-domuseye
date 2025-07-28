"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

export default function ProfileRedirectPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push("/login");
      } else if (userData?.userType) {
        // Redirect to appropriate dashboard profile based on user type
        if (userData.userType === "tenant") {
          router.push("/dashboard/tenant/profile");
        } else if (userData.userType === "landlord") {
          // Redirect to landlord profile page
          router.push("/dashboard/landlord/profile");
        } else {
          // Fallback to tenant profile
          router.push("/dashboard/tenant/profile");
        }
      }
    }
  }, [user, userData, loading, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Redirecting to your profile...</p>
      </div>
    </div>
  );
}