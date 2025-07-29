import { Metadata } from "next";
import { Building2, MapPin, Bed, Bath, Square } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Properties | DomusEye",
  description: "Browse available properties for rent and sale",
};

// Mock data for properties
const properties = [
  {
    id: 1,
    title: "Modern Downtown Apartment",
    location: "Downtown, City Center",
    price: "$2,500/month",
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: "1,200 sq ft",
    image: "/assets/images/property-1.jpg",
    status: "Available",
  },
  {
    id: 2,
    title: "Luxury Family Home",
    location: "Suburban Heights",
    price: "$4,200/month",
    type: "House",
    bedrooms: 4,
    bathrooms: 3,
    area: "2,800 sq ft",
    image: "/assets/images/property-2.jpg",
    status: "Available",
  },
  {
    id: 3,
    title: "Cozy Studio Loft",
    location: "Arts District",
    price: "$1,800/month",
    type: "Studio",
    bedrooms: 1,
    bathrooms: 1,
    area: "650 sq ft",
    image: "/assets/images/property-3.jpg",
    status: "Pending",
  },
];

export default function PropertiesPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Available Properties
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover your perfect home from our curated selection of properties
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-muted relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="h-16 w-16 text-muted-foreground" />
              </div>
              <Badge 
                className="absolute top-2 right-2" 
                variant={property.status === "Available" ? "default" : "secondary"}
              >
                {property.status}
              </Badge>
            </div>
            
            <CardHeader>
              <CardTitle className="text-xl">{property.title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {property.location}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">
                    {property.price}
                  </span>
                  <Badge variant="outline">{property.type}</Badge>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    {property.bedrooms} bed
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    {property.bathrooms} bath
                  </div>
                  <div className="flex items-center gap-1">
                    <Square className="h-4 w-4" />
                    {property.area}
                  </div>
                </div>
                
                <Button className="w-full" disabled={property.status === "Pending"}>
                  {property.status === "Available" ? "View Details" : "Not Available"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}