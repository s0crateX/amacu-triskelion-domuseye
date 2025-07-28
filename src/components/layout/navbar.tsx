"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Home, Building2, Search, Info, Phone, User, LogOut } from "lucide-react";
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

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Properties", href: "/properties", icon: Building2 },
  { name: "Search", href: "/search", icon: Search },
  { name: "About", href: "/about", icon: Info },
  { name: "Contact", href: "/contact", icon: Phone },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, userData, isAuthenticated } = useAuth();
  const router = useRouter();

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
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
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
                          <AvatarImage src={userData?.profilePicture || user?.photoURL || ""} alt={userData?.firstName || "User"} />
                          <AvatarFallback className="text-sm">
                            {getInitials(userData?.firstName, userData?.lastName)}
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
                      <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
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
                  onClick={() => router.push('/profile')}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userData?.profilePicture || user?.photoURL || ""} alt={userData?.firstName || "User"} />
                    <AvatarFallback className="text-sm">
                      {getInitials(userData?.firstName, userData?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
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
                <SheetHeader className="mb-6">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex items-center justify-center space-x-2 mb-4">
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
                  </div>
                </SheetHeader>
                <div className="flex flex-col space-y-4">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  <div className="pt-4 border-t space-y-2">
                    {isAuthenticated ? (
                      <>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start" 
                          onClick={() => {
                            setIsOpen(false);
                            handleLogout();
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" className="w-full" asChild>
                          <Link href="/login" onClick={() => setIsOpen(false)}>
                            Login
                          </Link>
                        </Button>
                        <Button className="w-full" asChild>
                          <Link href="/register" onClick={() => setIsOpen(false)}>
                            Sign Up
                          </Link>
                        </Button>
                      </>
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
