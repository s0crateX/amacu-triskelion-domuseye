import { Metadata } from "next";
import { Search, Filter, Phone, Mail, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Real Estate Agents - AI Powered Property Management Platform | DomusEye Next.js",
  description: "Connect with verified real estate agents through DomusEye's AI-powered rental property management platform built on Next.js. Find intelligent agent partnerships for property management and rental services.",
  keywords: [
    "domuseye real estate agents",
    "ai powered agent platform",
    "property management agents",
    "next js agent directory",
    "intelligent agent matching",
    "rental property agents",
    "smart agent partnerships",
    "ai agent recommendations"
  ],
};

// Mock data for agents
const agents = [
  {
    id: 1,
    name: "Emily Rodriguez",
    company: "Prime Realty Group",
    specialization: "Residential Properties",
    rating: 4.9,
    totalSales: 156,
    phone: "+1 (555) 123-4567",
    email: "emily.rodriguez@primerealty.com",
    image: "/assets/images/agent-1.jpg",
    verified: true,
  },
  {
    id: 2,
    name: "Michael Chen",
    company: "Urban Properties Inc",
    specialization: "Commercial & Luxury",
    rating: 4.8,
    totalSales: 203,
    phone: "+1 (555) 987-6543",
    email: "michael.chen@urbanproperties.com",
    image: "/assets/images/agent-2.jpg",
    verified: true,
  },
  {
    id: 3,
    name: "Sarah Thompson",
    company: "Metro Real Estate",
    specialization: "Investment Properties",
    rating: 4.7,
    totalSales: 89,
    phone: "+1 (555) 456-7890",
    email: "sarah.thompson@metrorealestate.com",
    image: "/assets/images/agent-3.jpg",
    verified: false,
  },
];

export default function AgentsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Agents
        </h1>
        <p className="text-lg text-muted-foreground">
          Connect with experienced real estate agents to help manage and market your properties
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents by name, company, or specialization..."
            className="w-full pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={agent.image} alt={agent.name} />
                  <AvatarFallback>
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    {agent.verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{agent.company}</CardDescription>
                  <p className="text-sm text-muted-foreground">{agent.specialization}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{agent.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {agent.totalSales} sales
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{agent.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{agent.email}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    Contact Agent
                  </Button>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}