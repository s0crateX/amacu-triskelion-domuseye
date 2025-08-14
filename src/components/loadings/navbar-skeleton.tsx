import { Skeleton } from "@/components/ui/skeleton";

// Navbar Navigation Skeleton Component - Only for tenant/landlord roles
export function NavbarNavigationSkeleton({
  userType,
  isLoading,
}: {
  userType?: string;
  isLoading?: boolean;
}) {
  // Show skeleton during loading or for tenant/landlord roles only
  // If still loading and userType is unknown, show skeleton (could be tenant/landlord)
  // If userType is known and it's not tenant/landlord, don't show skeleton
  if (
    !isLoading &&
    userType &&
    userType !== "tenant" &&
    userType !== "landlord"
  ) {
    return null;
  }

  return (
    <div className="flex items-center space-x-8">
      {/* Navigation items skeleton */}
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Skeleton className="h-4 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

// Profile Avatar Skeleton Component - Only for tenant/landlord roles
export function ProfileAvatarSkeleton({
  userType,
  isLoading,
}: {
  userType?: string;
  isLoading?: boolean;
}) {
  // Show skeleton during loading or for tenant/landlord roles only
  // If still loading and userType is unknown, show skeleton (could be tenant/landlord)
  // If userType is known and it's not tenant/landlord, don't show skeleton
  if (
    !isLoading &&
    userType &&
    userType !== "tenant" &&
    userType !== "landlord"
  ) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="hidden sm:block">
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </div>
  );
}

// Mobile Menu Skeleton Component - Only for tenant/landlord roles
export function MobileMenuSkeleton({
  userType,
  isLoading,
}: {
  userType?: string;
  isLoading?: boolean;
}) {
  // Show skeleton during loading or for tenant/landlord roles only
  // If still loading and userType is unknown, show skeleton (could be tenant/landlord)
  // If userType is known and it's not tenant/landlord, don't show skeleton
  if (
    !isLoading &&
    userType &&
    userType !== "tenant" &&
    userType !== "landlord"
  ) {
    return null;
  }

  return (
    <div className="space-y-4 p-4">
      {/* Navigation items skeleton for mobile */}
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
      ))}

      {/* Divider */}
      <div className="border-t border-border my-4" />

      {/* Profile section skeleton */}
      <div className="flex items-center space-x-3 p-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-20 rounded mb-1" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </div>

      {/* Logout button skeleton */}
      <div className="p-2">
        <Skeleton className="h-9 w-full rounded" />
      </div>
    </div>
  );
}

// Complete Navbar Skeleton (for full page loading) - Only for tenant/landlord roles
export function NavbarSkeleton({
  userType,
  isLoading,
}: {
  userType?: string;
  isLoading?: boolean;
}) {
  // Show skeleton during loading or for tenant/landlord roles only
  // If still loading and userType is unknown, show skeleton (could be tenant/landlord)
  // If userType is known and it's not tenant/landlord, don't show skeleton
  if (
    !isLoading &&
    userType &&
    userType !== "tenant" &&
    userType !== "landlord"
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo skeleton */}
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-6 w-24 rounded" />
          </div>

          {/* Desktop Navigation skeleton */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-8">
            <NavbarNavigationSkeleton
              userType={userType}
              isLoading={isLoading}
            />
          </div>

          {/* Right side skeleton */}
          <div className="flex items-center space-x-3">
            <Skeleton className="h-9 w-9 rounded" /> {/* Theme toggle */}
            <ProfileAvatarSkeleton userType={userType} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </header>
  );
}
