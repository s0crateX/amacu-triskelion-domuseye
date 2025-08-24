"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  Home,
  Building2,
  Info,
  Phone,
  User,
  LogOut,
  Users,
  HeadphonesIcon,
  Building,
  CreditCard,
  Settings,
  FileText,
  MessageSquare,
  Mailbox,
  Wallet,
  Bot,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useNotifications } from "@/contexts/notification-context";
import { logoutUser } from "@/lib/auth/auth-utils";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  NavbarNavigationSkeleton,
  ProfileAvatarSkeleton,
  MobileMenuSkeleton,
} from "@/components/loadings/navbar-skeleton";

// Navigation items for different user roles
const visitorNavigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Properties", href: "/dashboard/properties", icon: Building2 },
  { name: "Agents", href: "/dashboard/agent", icon: Users },
  { name: "About Us", href: "/dashboard/about", icon: Info },
  { name: "Contact Us", href: "/dashboard/contact", icon: Phone },
];

const tenantNavigation = [
  { name: "Home", href: "/users/tenant", icon: Home },
  { name: "Properties", href: "/users/tenant/properties", icon: Building2 },
  { name: "Agents", href: "/users/tenant/agents", icon: Users },
  { name: "Messages", href: "/users/tenant/messages", icon: MessageSquare },
  { name: "Support", href: "/users/tenant/support", icon: HeadphonesIcon },
];

const landlordNavigation = [
  { name: "Home", href: "/users/landlord", icon: Home },
  {
    name: "My Properties",
    href: "/users/landlord/my-properties",
    icon: Building,
  },
  {
    name: "Community Board",
    href: "/users/landlord/community-board",
    icon: Users,
  },
  { name: "Messages", href: "/users/landlord/messages", icon: MessageSquare },
  { name: "Requests", href: "/users/landlord/requests", icon: MessageSquare },
];

const agentNavigation = [
  { name: "Dashboard", href: "/users/agent", icon: Home },
  { name: "Properties", href: "/users/agent/properties", icon: Building },
  { name: "Eyenalyzer", href: "/users/agent/eyenalyzer", icon: Bot },
  { name: "Messages", href: "/users/agent/messages", icon: MessageSquare },
];

// Notification Badge Component
const NotificationBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) return null;
  
  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
      {count > 99 ? '99+' : count}
    </span>
  );
};

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const { user, userData, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  // Check if a navigation item is active
  const isActiveRoute = (href: string) => {
    // Exact match for root path
    if (href === "/" && pathname === "/") return true;

    // For non-root paths, only match exact paths
    if (href !== "/" && pathname === href) return true;

    return false;
  };

  // Determine authentication state to prevent flicker
  const authState = React.useMemo(() => {
    // If user is not authenticated, immediately show visitor navbar (no loading state)
    if (!isAuthenticated || !user) {
      return "visitor";
    }

    // If user is authenticated but userData is still loading, show loading state
    if (isAuthenticated && !userData) {
      return "authenticated-loading";
    }

    // User is fully authenticated with userData available
    return "authenticated";
  }, [isAuthenticated, user, userData]);

  // Handle scroll to show/hide navbar
  React.useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Show navbar when at top of page
          if (currentScrollY < 10) {
            setIsVisible(true);
          }
          // Hide navbar when scrolling down, show when scrolling up
          // Use smaller threshold for mobile devices
          else if (currentScrollY > lastScrollY && currentScrollY > 50) {
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY) {
            setIsVisible(true);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Add both scroll and touchmove listeners for better mobile support
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
    };
  }, [lastScrollY]);

  // Optional: Debug logging for development
  // React.useEffect(() => {
  //   console.log("Navbar auth state:", authState, {
  //     loading,
  //     isAuthenticated,
  //     hasUser: !!user,
  //     hasUserData: !!userData,
  //     userType: userData?.userType,
  //   });
  // }, [authState, loading, isAuthenticated, user, userData]);

  // Determine which navigation to show based on auth state
  const getNavigation = () => {
    switch (authState) {
      case "visitor":
        // Immediately show visitor navigation for non-authenticated users
        return visitorNavigation;
      case "authenticated-loading":
        // Don't show navigation while userData is loading for authenticated users
        return [];
      case "authenticated":
        // Show role-based navigation for fully authenticated users
        switch (userData?.userType) {
          case "tenant":
            return tenantNavigation;
          case "landlord":
            return landlordNavigation;
          case "agent":
            return agentNavigation;
          default:
            return visitorNavigation;
        }
      default:
        return visitorNavigation;
    }
  };

  const navigation = getNavigation();

  const handleTenantLogout = async () => {
    try {
      await logoutUser();
      toast.success("Tenant logged out successfully");

      router.push("/");
    } catch (error) {
      console.error("Tenant logout error:", error);
      toast.error("Failed to logout tenant");
    }
  };

  const handleLandlordLogout = async () => {
    try {
      await logoutUser();
      toast.success("Landlord logged out successfully");

      router.push("/");
    } catch (error) {
      console.error("Landlord logout error:", error);
      toast.error("Failed to logout landlord");
    }
  };

  const handleLogout = async () => {
    if (userData?.userType === "tenant") {
      await handleTenantLogout();
    } else if (userData?.userType === "landlord") {
      await handleLandlordLogout();
    } else if (userData?.userType === "agent") {
      // Agent logout - use generic logout
      try {
        await logoutUser();
        toast.success("Logged out successfully");
        router.push("/");
      } catch (error) {
        console.error("Logout error:", error);
        toast.error("Failed to logout");
      }
    } else {
      // Fallback for other user types
      try {
        await logoutUser();
        toast.success("Logged out successfully");
        router.push("/");
      } catch (error) {
        console.error("Logout error:", error);
        toast.error("Failed to logout");
      }
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ease-in-out will-change-transform ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center min-w-0 flex-shrink-0">
            <Link
              href={userData?.userType === "agent" ? "/users/agent" : "/"}
              className="flex items-center space-x-3"
            >
              <Image
                src="/assets/images/logo.png"
                alt="DomusEye Logo"
                width={32}
                height={32}
                className="h-8 w-8 dark:invert flex-shrink-0"
              />
              <span className="text-xl font-bold text-foreground whitespace-nowrap">
                DomusEye
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center space-x-8">
              {authState === "authenticated-loading" ? (
                <NavbarNavigationSkeleton
                  userType={userData?.userType}
                  isLoading={true}
                />
              ) : (
                navigation.map((item) => {
                  const isActive = isActiveRoute(item.href);
                  const isMessagesTab = item.name === "Messages";
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap px-2 py-1 rounded-md hover:bg-primary/10 ${
                        isActive
                          ? "text-primary bg-primary/10 font-semibold transform scale-105"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.name}
                      {isMessagesTab && <NotificationBadge count={unreadCount} />}
                    </Link>
                  );
                })
              )}
            </div>
          </nav>

          {/* Right side - CTA */}
          <div className="flex items-center space-x-3 min-w-0 flex-shrink-0">
            {authState === "visitor" ? (
              // Immediately show login/register buttons for visitors
              <div className="hidden sm:flex items-center space-x-3">
                <ThemeToggle />
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/login" className="whitespace-nowrap">
                    Login
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link
                    href="/dashboard/register"
                    className="whitespace-nowrap"
                  >
                    Sign Up
                  </Link>
                </Button>
              </div>
            ) : authState === "authenticated-loading" ? (
              <>
                {/* Desktop Profile Skeleton */}
                <div className="hidden sm:flex items-center">
                  <ProfileAvatarSkeleton
                    userType={userData?.userType}
                    isLoading={true}
                  />
                </div>
                {/* Mobile Profile Skeleton */}
                <div className="sm:hidden">
                  <ProfileAvatarSkeleton
                    userType={userData?.userType}
                    isLoading={true}
                  />
                </div>
              </>
            ) : authState === "authenticated" ? (
              <>
                {/* Desktop Profile Dropdown */}
                <div className="hidden sm:flex items-center space-x-3">
                  <ThemeToggle />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              userData?.profilePicture || user?.photoURL || ""
                            }
                            alt={userData?.firstName || "User"}
                          />
                          <AvatarFallback className="text-sm">
                            {getInitials(
                              userData?.firstName,
                              userData?.lastName
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden lg:block text-sm font-medium whitespace-nowrap">
                          {userData?.firstName || "User"}
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {userData?.firstName} {userData?.lastName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground capitalize">
                            {userData?.userType}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            userData?.userType === "tenant"
                              ? "/users/tenant/profile"
                              : "/profile"
                          )
                        }
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      {userData?.userType === "landlord" && (
                        <DropdownMenuItem
                          onClick={() =>
                            router.push("/users/landlord/applications")
                          }
                        >
                          <Mailbox className="mr-2 h-4 w-4" />
                          <span>Applicants</span>
                        </DropdownMenuItem>
                      )}
                      {userData?.userType === "landlord" && (
                        <DropdownMenuItem
                          onClick={() =>
                            router.push("/users/landlord/payment-history")
                          }
                        >
                          <Wallet className="mr-2 h-4 w-4" />
                          <span>Payment History</span>
                        </DropdownMenuItem>
                      )}
                      {userData?.userType === "tenant" && (
                        <DropdownMenuItem
                          onClick={() =>
                            router.push("/users/tenant/application")
                          }
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Application</span>
                        </DropdownMenuItem>
                      )}
                      {userData?.userType === "tenant" && (
                        <DropdownMenuItem
                          onClick={() =>
                            router.push("/users/tenant/payment-history")
                          }
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span>Payment History</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Profile Picture Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  onClick={() =>
                    router.push(
                      userData?.userType === "tenant"
                        ? "/users/tenant/profile"
                        : "/profile"
                    )
                  }
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={userData?.profilePicture || user?.photoURL || ""}
                      alt={userData?.firstName || "User"}
                    />
                    <AvatarFallback className="text-sm">
                      {getInitials(userData?.firstName, userData?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </>
            ) : null}

            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[280px] sm:w-[320px] px-4 py-3"
              >
                <SheetHeader className="mb-3">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Content */}
                  {authState === "authenticated-loading" ? (
                    <MobileMenuSkeleton
                      userType={userData?.userType}
                      isLoading={true}
                    />
                  ) : (
                    <>
                      {/* User Profile Section - Show at top for authenticated users */}
                      {authState === "authenticated" && (
                        <div className="pb-3 border-b border-border/40 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={
                                    userData?.profilePicture ||
                                    user?.photoURL ||
                                    ""
                                  }
                                  alt={userData?.firstName || "User"}
                                />
                                <AvatarFallback className="text-xs font-medium">
                                  {getInitials(
                                    userData?.firstName,
                                    userData?.lastName
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-base font-semibold text-foreground truncate">
                                  {userData?.firstName} {userData?.lastName}
                                </span>
                                <span className="text-xs text-muted-foreground capitalize">
                                  {userData?.userType}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0"
                              onClick={() => {
                                setIsOpen(false);
                                router.push(
                                  userData?.userType === "tenant"
                                    ? "/users/tenant/profile"
                                    : userData?.userType === "agent"
                                    ? "/users/agent/profile"
                                    : "/profile"
                                );
                              }}
                            >
                              <Settings className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Navigation Items */}
                      <div className="space-y-1 flex-1">
                        {navigation.map((item) => {
                          const Icon = item.icon;
                          const isActive = isActiveRoute(item.href);
                          const isMessagesTab = item.name === "Messages";
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={`relative flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out hover:bg-primary/10 ${
                                isActive
                                  ? "text-primary bg-primary/10 font-semibold transform translate-x-1"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                              onClick={() => setIsOpen(false)}
                            >
                              <div className="relative">
                                <Icon className="h-4 w-4 flex-shrink-0" />
                                {isMessagesTab && <NotificationBadge count={unreadCount} />}
                              </div>
                              <span className="text-sm">{item.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                      {/* Additional authenticated user options */}
                      {authState === "authenticated" && (
                        <div className="pt-3 border-t border-border/40 mt-4 space-y-1">
                          {/* Landlord specific links */}
                          {userData?.userType === "landlord" && (
                            <>
                              <Link
                                href="/users/landlord/applications"
                                className="flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-primary/10"
                                onClick={() => setIsOpen(false)}
                              >
                                <Mailbox className="h-4 w-4 flex-shrink-0" />
                                <span className="text-sm">Applicants</span>
                              </Link>
                              <Link
                                href="/users/landlord/payment-history"
                                className="flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-primary/10"
                                onClick={() => setIsOpen(false)}
                              >
                                <Wallet className="h-4 w-4 flex-shrink-0" />
                                <span className="text-sm">Payment History</span>
                              </Link>
                            </>
                          )}

                          {/* Tenant specific links */}
                          {userData?.userType === "tenant" && (
                            <>
                              <Link
                                href="/users/tenant/application"
                                className="flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-primary/10"
                                onClick={() => setIsOpen(false)}
                              >
                                <FileText className="h-4 w-4 flex-shrink-0" />
                                <span className="text-sm">Application</span>
                              </Link>
                              <Link
                                href="/users/tenant/payment-history"
                                className="flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-primary/10"
                                onClick={() => setIsOpen(false)}
                              >
                                <CreditCard className="h-4 w-4 flex-shrink-0" />
                                <span className="text-sm">Payment History</span>
                              </Link>
                            </>
                          )}
                        </div>
                      )}

                      {/* Bottom Action Section */}
                      {(authState === "visitor" ||
                        authState === "authenticated") && (
                        <div className="pt-4 border-t border-border/40 mt-4 space-y-3">
                          {/* Theme Toggle - Always show for mobile */}
                          <div className="flex items-center justify-between px-3">
                            <span className="text-sm font-medium text-muted-foreground">
                              Theme
                            </span>
                            <ThemeToggle />
                          </div>

                          {authState === "authenticated" ? (
                            <Button
                              variant="ghost"
                              className="w-full justify-start px-3 py-2.5 h-auto text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-all duration-200"
                              onClick={() => {
                                setIsOpen(false);
                                handleLogout();
                              }}
                            >
                              <LogOut className="mr-2.5 h-4 w-4 flex-shrink-0" />
                              <span className="text-sm">Log out</span>
                            </Button>
                          ) : authState === "visitor" ? (
                            <div className="space-y-2.5">
                              <Button
                                variant="ghost"
                                className="w-full h-9 text-sm font-medium"
                                asChild
                              >
                                <Link
                                  href="/dashboard/login"
                                  onClick={() => setIsOpen(false)}
                                >
                                  Login
                                </Link>
                              </Button>
                              <Button
                                className="w-full h-9 text-sm font-medium"
                                asChild
                              >
                                <Link
                                  href="/dashboard/register"
                                  onClick={() => setIsOpen(false)}
                                >
                                  Sign Up
                                </Link>
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
