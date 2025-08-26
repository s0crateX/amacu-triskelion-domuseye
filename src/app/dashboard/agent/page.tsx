"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Users,
  Award,
  Filter,
  MessageCircle,
  Home,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Agent {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  businessAddress: string;
  profilePicture: string;
  isOnline: boolean;
  propertyCount: string;
  verifiedPropertyCount: number;
  userType: string;
  createdAt: Date | { seconds: number; nanoseconds: number };
  updatedAt: Date | { seconds: number; nanoseconds: number };
}

const specialtyOptions = [
  "All Specialties",
  "Residential",
  "Commercial",
  "Luxury",
  "Investment",
  "Condominiums",
  "First-time Buyers",
  "Relocation",
  "High-end Condos",
  "Executive Homes",
  "Office Spaces",
  "Retail",
  "Development",
  "Pre-selling",
];

const locationOptions = [
  "All Locations",
  "Manila",
  "Makati",
  "Quezon City",
  "Bonifacio Global City",
  "Ortigas",
  "Alabang",
];

// Helper function to convert timestamp to Date
const toDate = (
  timestamp: Date | { seconds: number; nanoseconds: number }
): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp.seconds * 1000);
};

// Function to fetch verified property count for an agent
const fetchVerifiedPropertyCount = async (agentId: string): Promise<number> => {
  try {
    const propertiesQuery = query(
      collection(db, "properties"),
      where("verifiedBy", "==", agentId),
      where("status", "==", "verified")
    );
    const querySnapshot = await getDocs(propertiesQuery);
    return querySnapshot.size;
  } catch (error) {
    console.error(`Error fetching property count for agent ${agentId}:`, error);
    return 0;
  }
};

export default function AgentPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [sortBy, setSortBy] = useState("rating");

  // Handle phone call
  const handleCall = (phone: string) => {
    if (phone && phone !== "Not provided") {
      window.open(`tel:${phone}`, "_self");
    } else {
      toast.error("Phone number not available");
    }
  };

  // Handle email
  const handleEmail = (email: string) => {
    if (email) {
      window.open(`mailto:${email}`, "_self");
    } else {
      toast.error("Email not available");
    }
  };

  // Handle chat - navigate to login
  const handleChat = () => {
    router.push("/dashboard/login");
  };

  // Fetch agents from Firebase
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const agentsQuery = query(
          collection(db, "users"),
          where("userType", "==", "agent")
        );

        const querySnapshot = await getDocs(agentsQuery);
        const agentsData: Agent[] = [];

        // Process each agent and fetch their verified property count
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const verifiedPropertyCount = await fetchVerifiedPropertyCount(doc.id);
          
          agentsData.push({
            uid: doc.id,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            companyName: data.companyName || "",
            businessAddress: data.businessAddress || "",
            profilePicture: data.profilePicture || "",
            isOnline: data.isOnline || false,
            propertyCount: data.propertyCount || "0",
            verifiedPropertyCount: verifiedPropertyCount,
            userType: data.userType,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        }

        // Sort agents by creation date (newest first) on client side
        const sortedAgents = agentsData.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return (
              toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()
            );
          }
          return 0;
        });

        setAgents(sortedAgents);
      } catch (error) {
        console.error("Error fetching agents:", error);
        toast.error("Failed to load agents. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Filter agents based on search criteria
  const filteredAgents = agents.filter((agent) => {
    const fullName = `${agent.firstName} ${agent.lastName}`.toLowerCase();
    const company = agent.companyName.toLowerCase();
    const email = agent.email.toLowerCase();
    const search = searchQuery.toLowerCase();

    const matchesSearch =
      fullName.includes(search) ||
      company.includes(search) ||
      email.includes(search);

    const matchesSpecialty = selectedSpecialty === "All Specialties";
    const matchesLocation = selectedLocation === "All Locations";

    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  // Sort agents
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return 0; // No rating data from Firebase
      case "experience":
        return 0; // No experience data from Firebase
      case "properties":
        return b.verifiedPropertyCount - a.verifiedPropertyCount;
      case "reviews":
        return 0; // No reviews data from Firebase
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Find Your Perfect Agent
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with experienced real estate professionals who will help
              you find your dream property
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search agents by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg bg-background border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Filters:</span>
            </div>

            <div className="flex flex-wrap gap-4">
              <Select
                value={selectedSpecialty}
                onValueChange={setSelectedSpecialty}
              >
                <SelectTrigger className="w-48 bg-background border-border">
                  <SelectValue placeholder="Select Specialty" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {specialtyOptions.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger className="w-48 bg-background border-border">
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {locationOptions.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-background border-border">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="experience">Most Experience</SelectItem>
                  <SelectItem value="properties">Most Properties</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Available Agents ({loading ? "..." : sortedAgents.length})
            </h2>
            <p className="text-muted-foreground">
              Choose from our network of verified real estate professionals
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card
                  key={i}
                  className="animate-pulse overflow-hidden bg-card border-border"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-20 h-20 bg-muted rounded-full" />
                      <div className="ml-4 flex-1 space-y-2">
                        <div className="h-5 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-12 bg-muted rounded" />
                        <div className="h-12 bg-muted rounded" />
                        <div className="h-12 bg-muted rounded" />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-muted rounded flex-1" />
                        <div className="h-8 bg-muted rounded flex-1" />
                        <div className="h-8 bg-muted rounded w-12" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedAgents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  {searchQuery
                    ? "No agents found matching your criteria"
                    : "No agents available"}
                </p>
                <p className="text-sm">
                  {searchQuery
                    ? "Try adjusting your filters or search terms"
                    : "There are currently no registered agents in the system."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedAgents.map((agent) => (
                <Card
                  key={agent.uid}
                  className="overflow-hidden hover:shadow-lg transition-shadow bg-card border-border"
                >
                  <CardContent className="p-6">
                    {/* Agent Photo and Basic Info */}
                    <div className="flex items-center mb-4">
                      <div className="relative">
                        <Avatar className="w-20 h-20">
                          <AvatarImage
                            src={agent.profilePicture}
                            alt={`${agent.firstName} ${agent.lastName}`}
                          />
                          <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                            {`${agent.firstName[0] || ""}${
                              agent.lastName[0] || ""
                            }`.toUpperCase() || "A"}
                          </AvatarFallback>
                        </Avatar>
                        {agent.isOnline && (
                          <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-background rounded-full"></div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-xl font-semibold text-foreground">
                          {agent.firstName} {agent.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {agent.companyName}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    {agent.businessAddress && (
                      <div className="flex items-center mb-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm text-muted-foreground truncate">
                          {agent.businessAddress}
                        </span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Home className="h-4 w-4 text-primary mr-1" />
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          {agent.verifiedPropertyCount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Verified
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Phone className="h-4 w-4 text-primary mr-1" />
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          {agent.phone ? "Yes" : "No"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Phone
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Mail className="h-4 w-4 text-primary mr-1" />
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          {agent.isOnline ? "Online" : "Offline"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Status
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">
                          {agent.phone || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{agent.email}</span>
                      </div>
                    </div>

                    {/* Contact Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleCall(agent.phone)}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEmail(agent.email)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleChat}>
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our experienced agents are here to guide you through every step of
            your real estate journey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8">
              <Award className="h-5 w-5 mr-2" />
              Become an Agent
            </Button>
            <Button size="lg" variant="outline" className="px-8">
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
