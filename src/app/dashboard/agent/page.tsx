"use client";

import React, { useState } from "react";
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Building2, 
  Users, 
  Award,
  Filter,
  MessageCircle,
  Home,
  Calendar
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock agent data with Filipino names
const mockAgents = [
  {
    id: 1,
    name: "Maria Santos",
    title: "Senior Real Estate Agent",
    company: "Prime Properties",
    location: "Manila, Philippines",
    rating: 4.9,
    reviews: 127,
    properties: 45,
    experience: "8 years",
    specialties: ["Residential", "Commercial", "Luxury"],
    phone: "+63 917 123 4567",
    email: "maria.santos@domuseye.com",
    description: "Specializing in luxury residential properties with over 8 years of experience in the Manila market.",
    languages: ["English", "Filipino", "Mandarin"],
    certifications: ["Licensed Real Estate Broker", "Certified Property Manager"]
  },
  {
    id: 2,
    name: "Juan Carlos Dela Cruz",
    title: "Property Investment Specialist",
    company: "Metro Realty Group",
    location: "Makati, Philippines",
    rating: 4.8,
    reviews: 89,
    properties: 32,
    experience: "6 years",
    specialties: ["Investment", "Commercial", "Condominiums"],
    phone: "+63 917 234 5678",
    email: "juan.delacruz@domuseye.com",
    description: "Expert in property investment strategies and commercial real estate transactions.",
    languages: ["English", "Filipino", "Mandarin"],
    certifications: ["Licensed Real Estate Broker", "Investment Property Specialist"]
  },
  {
    id: 3,
    name: "Ana Beatriz Reyes",
    title: "Residential Sales Expert",
    company: "Urban Living Realty",
    location: "Quezon City, Philippines",
    rating: 4.7,
    reviews: 156,
    properties: 67,
    experience: "10 years",
    specialties: ["Residential", "First-time Buyers", "Relocation"],
    phone: "+63 917 345 6789",
    email: "ana.reyes@domuseye.com",
    description: "Dedicated to helping families find their perfect home with personalized service.",
    languages: ["English", "Filipino", "Spanish"],
    certifications: ["Licensed Real Estate Broker", "Relocation Specialist"]
  },
  {
    id: 4,
    name: "Miguel Angelo Torres",
    title: "Luxury Property Consultant",
    company: "Elite Estates",
    location: "Bonifacio Global City, Philippines",
    rating: 4.9,
    reviews: 73,
    properties: 28,
    experience: "5 years",
    specialties: ["Luxury", "High-end Condos", "Executive Homes"],
    phone: "+63 917 456 7890",
    email: "miguel.torres@domuseye.com",
    description: "Specializing in luxury properties and high-end real estate transactions.",
    languages: ["English", "Filipino", "Spanish"],
    certifications: ["Licensed Real Estate Broker", "Luxury Property Specialist"]
  },
  {
    id: 5,
    name: "Isabella Marie Garcia",
    title: "Commercial Real Estate Agent",
    company: "Business Properties Inc.",
    location: "Ortigas, Philippines",
    rating: 4.6,
    reviews: 94,
    properties: 41,
    experience: "7 years",
    specialties: ["Commercial", "Office Spaces", "Retail"],
    phone: "+63 917 567 8901",
    email: "isabella.garcia@domuseye.com",
    description: "Expert in commercial real estate with focus on office and retail spaces.",
    languages: ["English", "Filipino", "Korean"],
    certifications: ["Licensed Real Estate Broker", "Commercial Property Specialist"]
  },
  {
    id: 6,
    name: "Rafael Jose Mendoza",
    title: "Property Development Advisor",
    company: "Future Developments",
    location: "Alabang, Philippines",
    rating: 4.8,
    reviews: 112,
    properties: 39,
    experience: "9 years",
    specialties: ["Development", "Pre-selling", "Investment"],
    phone: "+63 917 678 9012",
    email: "rafael.mendoza@domuseye.com",
    description: "Specializing in property development projects and pre-selling opportunities.",
    languages: ["English", "Filipino", "Korean"],
    certifications: ["Licensed Real Estate Broker", "Development Specialist"]
  }
];

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
  "Pre-selling"
];

const locationOptions = [
  "All Locations",
  "Manila",
  "Makati", 
  "Quezon City",
  "Bonifacio Global City",
  "Ortigas",
  "Alabang"
];

export default function AgentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [sortBy, setSortBy] = useState("rating");

  // Filter agents based on search criteria
  const filteredAgents = mockAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.specialties.some(specialty => 
                           specialty.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    
    const matchesSpecialty = selectedSpecialty === "All Specialties" || 
                            agent.specialties.includes(selectedSpecialty);
    
    const matchesLocation = selectedLocation === "All Locations" ||
                           agent.location.includes(selectedLocation);
    
    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  // Sort agents
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "experience":
        return parseInt(b.experience) - parseInt(a.experience);
      case "properties":
        return b.properties - a.properties;
      case "reviews":
        return b.reviews - a.reviews;
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
              Connect with experienced real estate professionals who will help you find your dream property
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
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
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

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
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
              Available Agents ({sortedAgents.length})
            </h2>
            <p className="text-muted-foreground">
              Choose from our network of verified real estate professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedAgents.map((agent) => (
              <Card key={agent.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-card border-border">
                <CardContent className="p-6">
                  {/* Agent Photo and Basic Info */}
                  <div className="flex items-center mb-4">
                     <div className="relative">
                       <Avatar className="w-20 h-20">
                         <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                           {agent.name.split(' ').map(n => n[0]).join('')}
                         </AvatarFallback>
                       </Avatar>
                       <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-background rounded-full"></div>
                     </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-xl font-semibold text-foreground">{agent.name}</h3>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm font-medium text-foreground">{agent.rating}</span>
                        <span className="ml-1 text-sm text-muted-foreground">({agent.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center mb-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">{agent.location}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Home className="h-4 w-4 text-primary mr-1" />
                      </div>
                      <div className="text-lg font-semibold text-foreground">{agent.properties}</div>
                      <div className="text-xs text-muted-foreground">Properties</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Calendar className="h-4 w-4 text-primary mr-1" />
                      </div>
                      <div className="text-lg font-semibold text-foreground">{agent.experience}</div>
                      <div className="text-xs text-muted-foreground">Experience</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-primary mr-1" />
                      </div>
                      <div className="text-lg font-semibold text-foreground">{agent.reviews}</div>
                      <div className="text-xs text-muted-foreground">Reviews</div>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {agent.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {agent.description}
                  </p>

                  {/* Contact Buttons */}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sortedAgents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No agents found matching your criteria</p>
                <p className="text-sm">Try adjusting your filters or search terms</p>
              </div>
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
            Our experienced agents are here to guide you through every step of your real estate journey
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