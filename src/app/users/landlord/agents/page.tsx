"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Home,
  Users,
  Award,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";
import { conversationService } from "@/lib/database/messages";

// Helper function to convert timestamp to Date
const toDate = (
  timestamp: Date | { seconds: number; nanoseconds: number }
): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp.seconds * 1000);
};

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
  "Property Management",
  "Rental Properties",
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

// Function to fetch verified property count for a specific agent
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
    console.error("Error fetching verified property count:", error);
    return 0;
  }
};

export default function AgentsPage() {
  const router = useRouter();
  const { userData } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [sortBy, setSortBy] = useState("properties");

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

  // Function to handle opening agent messages with automatic conversation creation
  const handleOpenAgentMessages = async (agent: Agent) => {
    if (!agent || !userData) {
      console.error("Missing required data for creating conversation");
      return;
    }

    try {
      // Create or find existing conversation with the agent
      const conversationId = await conversationService.createNewConversation(
        userData.uid, // landlord ID
        `${userData.firstName} ${userData.lastName}`, // landlord name
        agent.uid, // agent ID
        `${agent.firstName} ${agent.lastName}`, // agent name
        "agent", // agent type
        undefined, // no property ID for agent conversations
        undefined // no property title for agent conversations
      );

      // Create initial message with agent details
      const agentDetailsMessage =
        `Hello ${agent.firstName}! I'm a property owner looking for professional property management and marketing services.\n\n` +
        `I have rental properties that I'd like to discuss with you. I see that you work with ${agent.companyName} and currently manage ${agent.propertyCount} properties, which gives me confidence in your expertise.\n\n` +
        `I'm interested in discussing:\n` +
        `🏢 Property management services and fees\n` +
        `📈 Marketing strategies to attract quality tenants\n` +
        `🔍 Tenant screening and selection process\n` +
        `💼 Lease management and rent collection\n` +
        `🔧 Property maintenance coordination\n\n` +
        `I believe a partnership with your agency could help maximize my property's potential and ensure professional management. Would you be available to discuss how we can work together?\n\n` +
        `Thank you for your time!`;

      // Navigate to messages page with the conversation and pre-populated message
      router.push(
        `/users/landlord/messages?agentId=${
          agent.uid
        }&agentName=${encodeURIComponent(
          `${agent.firstName} ${agent.lastName}`
        )}&conversationId=${conversationId}&draftMessage=${encodeURIComponent(
          agentDetailsMessage
        )}`
      );
    } catch (error) {
      console.error("Error creating conversation:", error);
      // Fallback to regular navigation
      router.push(
        `/users/landlord/messages?agentId=${
          agent.uid
        }&agentName=${encodeURIComponent(
          `${agent.firstName} ${agent.lastName}`
        )}`
      );
    }
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

        querySnapshot.forEach((doc) => {
          const data = doc.data();
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
            verifiedPropertyCount: 0, // Will be updated below
            userType: data.userType,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });

        // Fetch verified property counts for all agents
        for (const agent of agentsData) {
          agent.verifiedPropertyCount = await fetchVerifiedPropertyCount(agent.uid);
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
              Connect with experienced real estate agents to help manage and
              market your properties effectively
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search agents by name, company, or location..."
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
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-semibold text-foreground">
                            {agent.firstName} {agent.lastName}
                          </h3>
                          {agent.isOnline && (
                            <Badge variant="secondary" className="text-xs">
                              Online
                            </Badge>
                          )}
                        </div>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenAgentMessages(agent)}
                      >
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
            Ready to Grow Your Property Portfolio?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our experienced agents are here to help you manage, market, and
            maximize the potential of your real estate investments
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
