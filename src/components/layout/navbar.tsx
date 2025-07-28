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
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { logoutUser } from "@/lib/auth/auth-utils";
import { useRouter } from "next/navigation";
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

// Navigation items for different user roles
const visitorNavigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Properties", href: "/properties", icon: Building2 },
  { name: "Agents", href: "/agents", icon: Users },
  { name: "About Us", href: "/about", icon: Info },
  { name: "Contact Us", href: "/contact", icon: Phone },
];

const tenantNavigation = [
  { name: "Home", href: "/users/tenant", icon: Home },
  { name: "Properties", href: "/users/tenant/properties", icon: Building2 },
  { name: "Agents", href: "/users/tenant/agents", icon: Users },
  { name: "Support", href: "/users/tenant/support", icon: HeadphonesIcon },
];

const landlordNavigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Agents", href: "/agents", icon: Users },
  { name: "My Properties", href: "/dashboard/properties", icon: Building },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Support", href: "/support", icon: HeadphonesIcon },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const { user, userData, isAuthenticated, loading } = useAuth();
  const router = useRouter();

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

  // Debug logging to understand state changes
  React.useEffect(() => {
    console.log("Navbar state:", {
      loading,
      isAuthenticated,
      hasUser: !!user,
      hasUserData: !!userData,
      userType: userData?.userType,
    });
  }, [loading, isAuthenticated, user, userData]);

  // Determine which navigation to show based on user role
  const getNavigation = () => {
    // If still loading or user is authenticated but userData is not yet loaded, don't show any navigation
    if (loading || (isAuthenticated && !userData)) {
      return [];
    }

    if (!isAuthenticated || !user) {
      return visitorNavigation;
    }

    switch (userData?.userType) {
      case "tenant":
        return tenantNavigation;
      case "landlord":
        return landlordNavigation;
      default:
        return visitorNavigation;
    }
  };

  const navigation = getNavigation();

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/assets/images/logo.png"
                alt="DomusEye Logo"
                width={32}
                height={32}
                className="h-8 w-8 dark:invert"
              />
              <span className="text-xl font-bold text-foreground">
                DomusEye
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {loading || (isAuthenticated && !userData) ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.name}
                </Link>
              ))
            )}
          </nav>

          {/* Right side - Theme toggle and CTA */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Desktop Profile Dropdown */}
                <div className="hidden sm:flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors">
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
                        <span className="hidden sm:block text-sm font-medium">
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
                          onClick={() => router.push("/dashboard/properties")}
                        >
                          <Building className="mr-2 h-4 w-4" />
                          <span>My Properties</span>
                        </DropdownMenuItem>
                      )}
                      {userData?.userType === "tenant" ? (
                        <DropdownMenuItem
                          onClick={() =>
                            router.push("/users/tenant/payment-history")
                          }
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span>Payment History</span>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => router.push("/support")}
                        >
                          <HeadphonesIcon className="mr-2 h-4 w-4" />
                          <span>Support</span>
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
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/dashboard/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard/register">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-6">
                <SheetHeader>
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  {/* User Profile Section - Show at top for authenticated users */}
                  {isAuthenticated && userData && (
                    <div className="pb-4 border-b border-border/40 mb-4">
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={
                                userData?.profilePicture || user?.photoURL || ""
                              }
                              alt={userData?.firstName || "User"}
                            />
                            <AvatarFallback className="text-sm font-medium">
                              {getInitials(
                                userData?.firstName,
                                userData?.lastName
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-lg font-semibold text-foreground">
                              {userData?.firstName} {userData?.lastName}
                            </span>
                            <span className="text-sm text-muted-foreground capitalize">
                              {userData?.userType}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setIsOpen(false);
                            router.push(
                              userData?.userType === "tenant"
                                ? "/users/tenant/profile"
                                : "/profile"
                            );
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Navigation Items */}
                  <div className="space-y-1 flex-1">
                    {loading || (isAuthenticated && !userData) ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-sm text-muted-foreground">
                          Loading...
                        </div>
                      </div>
                    ) : (
                      navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-accent/50"
                            onClick={() => setIsOpen(false)}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })
                    )}
                  </div>

                  {/* Additional authenticated user options */}
                  {isAuthenticated &&
                    userData &&
                    userData?.userType === "landlord" && (
                      <div className="pt-4 border-t border-border/40 mt-4">
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-3 py-2.5 h-auto text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200"
                          onClick={() => {
                            setIsOpen(false);
                            router.push("/dashboard/properties");
                          }}
                        >
                          <Building className="mr-3 h-4 w-4" />
                          My Properties
                        </Button>
                      </div>
                    )}

                  <div className="pt-4 border-t border-border/40 mt-4">
                    {isAuthenticated ? (
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-3 py-2.5 h-auto text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200"
                        onClick={() => {
                          setIsOpen(false);
                          handleLogout();
                        }}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Log out
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full h-10 text-sm font-medium"
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
                          className="w-full h-10 text-sm font-medium"
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
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
