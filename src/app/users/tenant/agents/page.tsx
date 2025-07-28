import { Metadata } from "next";
import { Users, Star, MapPin, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "Agents | DomusEye",
  description: "Meet our professional real estate agents",
};

// Mock data for agents
const agents = [
  {
    id: 1,
    name: "Sarah Johnson",
    title: "Senior Property Consultant",
    location: "Downtown District",
    phone: "+1 (555) 123-4567",
    email: "sarah.johnson@domuseye.com",
    rating: 4.9,
    reviews: 127,
    specialties: ["Luxury Homes", "Commercial", "Investment"],
    experience: "8+ years",
    avatar: "/assets/images/agent-1.jpg",
  },
  {
    id: 2,
    name: "Michael Chen",
    title: "Property Specialist",
    location: "Suburban Areas",
    phone: "+1 (555) 234-5678",
    email: "michael.chen@domuseye.com",
    rating: 4.8,
    reviews: 89,
    specialties: ["Family Homes", "First-time Buyers", "Rentals"],
    experience: "5+ years",
    avatar: "/assets/images/agent-2.jpg",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    title: "Rental Specialist",
    location: "City Center",
    phone: "+1 (555) 345-6789",
    email: "emily.rodriguez@domuseye.com",
    rating: 4.7,
    reviews: 156,
    specialties: ["Apartments", "Student Housing", "Short-term Rentals"],
    experience: "6+ years",
    avatar: "/assets/images/agent-3.jpg",
  },
  {
    id: 4,
    name: "David Thompson",
    title: "Commercial Agent",
    location: "Business District",
    phone: "+1 (555) 456-7890",
    email: "david.thompson@domuseye.com",
    rating: 4.9,
    reviews: 203,
    specialties: ["Office Spaces", "Retail", "Industrial"],
    experience: "10+ years",
    avatar: "/assets/images/agent-4.jpg",
  },
];

export default function AgentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Our Professional Agents
        </h1>
        <p className="text-lg text-muted-foreground">
          Connect with our experienced real estate professionals who are ready to help you find your perfect property
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                  <AvatarFallback className="text-lg">
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <CardTitle className="text-xl">{agent.name}</CardTitle>
              <CardDescription>{agent.title}</CardDescription>
              
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{agent.rating}</span>
                <span className="text-muted-foreground">({agent.reviews} reviews)</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{agent.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{agent.experience} experience</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Specialties:</p>
                <div className="flex flex-wrap gap-1">
                  {agent.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}