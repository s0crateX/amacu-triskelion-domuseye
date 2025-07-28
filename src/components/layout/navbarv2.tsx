"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { logoutUser } from "@/lib/auth/auth-utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut } from "lucide-react";

export function Navbarv2() {
  const { user, userData, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navItems = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "Properties",
      link: "/properties",
    },
    {
      name: "Search",
      link: "#search",
    },
    {
      name: "About Us",
      link: "/about",
    },
    {
      name: "Contact",
      link: "#contact",
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="relative w-full">
        <Navbar>
          <NavBody>
            <NavbarLogo />
            <NavItems items={navItems} />
            <div className="flex items-center gap-4">
              <NavbarButton className="p-0">
                <ThemeToggle />
              </NavbarButton>
              <div className="w-20 h-8 bg-muted animate-pulse rounded"></div>
            </div>
          </NavBody>
        </Navbar>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            <NavbarButton className="p-0">
              <ThemeToggle />
            </NavbarButton>
            
            {isAuthenticated ? (
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
            ) : (
              <>
                <NavbarButton variant="primary" href="/login">
                  Login
                </NavbarButton>
                <NavbarButton variant="primary" href="/register">
                  SignUp
                </NavbarButton>
              </>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <div className="flex items-center gap-4">
              <NavbarButton className="p-0">
                <ThemeToggle />
              </NavbarButton>
              {isAuthenticated && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData?.profilePicture || user?.photoURL || ""} alt={userData?.firstName || "User"} />
                  <AvatarFallback className="text-sm">
                    {getInitials(userData?.firstName, userData?.lastName)}
                  </AvatarFallback>
                </Avatar>
              )}
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}

            <div className="flex w-full flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <div className="border-t pt-4">
                    <div className="flex flex-col space-y-2 mb-4">
                      <p className="text-sm font-medium">
                        {userData?.firstName} {userData?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {userData?.userType}
                      </p>
                    </div>
                  </div>
                  <NavbarButton
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push('/profile');
                    }}
                    variant="secondary"
                    className="w-full"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </NavbarButton>
                  <NavbarButton
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    variant="secondary"
                    className="w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </NavbarButton>
                </>
              ) : (
                <>
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full"
                    href="/login"
                  >
                    Login
                  </NavbarButton>
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full"
                    href="/register"
                  >
                    SignUp
                  </NavbarButton>
                </>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Navbar */}
    </div>
  );
}
