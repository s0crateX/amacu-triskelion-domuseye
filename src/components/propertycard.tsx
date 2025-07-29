import React, { useState } from "react";
import { 
  MapPin, 
  Bed, 
  Bath, 
  Home, 
  CheckCircle, 
  Car,
  Calendar,
  Eye,
  User,
  Wifi,
  Tv,
  AirVent,
  Utensils,
  Dumbbell,
  Shield,
  ChevronLeft,
  ChevronRight,
  Heart
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (property: Property) => void;
}

// Amenities icons mapping
const amenityIcons: { [key: string]: React.ComponentType<{ size?: number; className?: string }> } = {
  wifi: Wifi,
  tv: Tv,
  ac: AirVent,
  kitchen: Utensils,
  gym: Dumbbell,
  security: Shield,
};

export const PropertyCard = ({ property, onViewDetails }: PropertyCardProps) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(property);
    } else {
      router.push(`/dashboard/properties/${property.id}`);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.images && property.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.images && property.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  // Get the main image to display
  const mainImage = property.images && property.images.length > 0 
    ? property.images[currentImageIndex] 
    : property.image || "/next.svg";

  // Format price
  const formatPrice = (price: string) => {
    if (!price) return "Price not available";
    return price.includes("₱") ? price : `₱${price}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      {/* Image Section with Gallery */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={mainImage}
          alt={property.title || "Property image"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/next.svg";
          }}
        />
        
        {/* Image Navigation */}
        {property.images && property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={16} />
            </button>
            
            {/* Image Indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {property.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {property.isNew && (
            <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold">
              NEW
            </Badge>
          )}
          {property.isVerified && (
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold">
              <CheckCircle size={12} className="mr-1" />
              VERIFIED
            </Badge>
          )}
          {!property.available && (
            <Badge variant="destructive" className="text-xs font-bold">
              OCCUPIED
            </Badge>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={toggleLike}
          className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
        >
          <Heart 
            size={18} 
            className={`transition-colors ${
              isLiked ? "text-red-500 fill-red-500" : "text-gray-600"
            }`} 
          />
        </button>

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1 rounded-full">
          <span className="font-bold text-sm">{formatPrice(property.price)}</span>
          <span className="text-xs opacity-80">/month</span>
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-foreground line-clamp-1 flex-1">
              {property.title || "Untitled Property"}
            </h3>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span className="text-sm line-clamp-1">
              {property.address || property.location || "Location not specified"}
            </span>
          </div>

          {/* Property Type and Category */}
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {property.type || "Property"}
            </Badge>
            {property.category && (
              <Badge variant="secondary" className="text-xs">
                {property.category}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {/* Property Details */}
        <div className="grid grid-cols-4 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-center p-2 bg-muted/50 rounded">
            <Bed size={14} className="mr-1" />
            <span className="font-medium">{property.beds || 0}</span>
          </div>
          <div className="flex items-center justify-center p-2 bg-muted/50 rounded">
            <Bath size={14} className="mr-1" />
            <span className="font-medium">{property.baths || 0}</span>
          </div>
          <div className="flex items-center justify-center p-2 bg-muted/50 rounded">
            <Car size={14} className="mr-1" />
            <span className="font-medium">{property.parking || 0}</span>
          </div>
          <div className="flex items-center justify-center p-2 bg-muted/50 rounded">
            <Home size={14} className="mr-1" />
            <span className="font-medium text-xs">{property.sqft || 0}ft²</span>
          </div>
        </div>

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Amenities</h4>
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 4).map((amenity, index) => {
                const IconComponent = amenityIcons[amenity.toLowerCase()] || Shield;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-muted/50 text-muted-foreground px-2 py-1 rounded text-xs"
                  >
                    <IconComponent size={12} />
                    <span className="capitalize">{amenity}</span>
                  </div>
                );
              })}
              {property.amenities.length > 4 && (
                <div className="bg-muted/50 text-muted-foreground px-2 py-1 rounded text-xs">
                  +{property.amenities.length - 4} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Property Stats */}
        <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye size={12} />
              <span>{property.views || 0} views</span>
            </div>
            {property.datePosted && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{formatDate(property.datePosted)}</span>
              </div>
            )}
          </div>
          {property.landlordName && (
            <div className="flex items-center gap-1">
              <User size={12} />
              <span className="line-clamp-1">{property.landlordName}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-medium"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
