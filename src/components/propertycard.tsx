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
  Heart
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
        <Image
          src={mainImage}
          alt={property.title || "Property image"}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/next.svg";
          }}
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {property.isNew && (
            <div className="bg-green-600 text-white px-2 py-1 text-xs font-bold rounded">
              NEW
            </div>
          )}
          {property.isVerified && (
            <div className="bg-[#1e40af] text-white px-2 py-1 text-xs font-bold rounded flex items-center">
              <CheckCircle size={12} className="mr-1" />
              VERIFIED
            </div>
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
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-foreground">
            {property.title || "Untitled Property"}
          </h3>
          <p className="text-[#1e40af] font-bold">
            {formatPrice(property.price)}
          </p>
        </div>
        <div className="flex items-center text-gray-600 mt-1">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm">
            {property.location || property.address || "Location not specified"}
          </span>
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
