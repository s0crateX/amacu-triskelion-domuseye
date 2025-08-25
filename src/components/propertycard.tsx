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
  Heart,
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
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (property: Property) => void;
}

// Amenities icons mapping
const amenityIcons: {
  [key: string]: React.ComponentType<{ size?: number; className?: string }>;
} = {
  wifi: Wifi,
  tv: Tv,
  ac: AirVent,
  kitchen: Utensils,
  gym: Dumbbell,
  security: Shield,
};

export const PropertyCard = ({
  property,
  onViewDetails,
}: PropertyCardProps) => {
  const router = useRouter();
  const [currentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [viewCount, setViewCount] = useState(property.views || 0);

  const incrementViewCount = async () => {
    // Only increment view count for verified properties
    if (!property.isVerified) {
      console.log('View count not incremented - property is not verified');
      return;
    }

    try {
      // Increment local view count immediately for better UX
      const newViewCount = viewCount + 1;
      setViewCount(newViewCount);
      
      // Update the view count in the database
      const propertyRef = doc(db, "properties", property.id);
      await updateDoc(propertyRef, {
        views: newViewCount,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`View count incremented for verified property ${property.id}`);
    } catch (error) {
      console.error('Failed to increment view count:', error);
      // Revert the local count if the API call fails
      setViewCount(prev => prev - 1);
    }
  };

  const handleViewDetails = () => {
    // Increment view count when property details are viewed
    incrementViewCount();
    
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
  const mainImage =
    property.images && property.images.length > 0
      ? property.images[currentImageIndex]
      : property.image || "/next.svg";

  // Format price
  const formatPrice = (price: string) => {
    if (!price) return "Price not available";

    // Extract numeric value from price string
    const numericPrice = price.replace(/[^0-9]/g, "");
    if (!numericPrice) return price.includes("₱") ? price : `₱${price}`;

    // Format number with commas
    const formattedNumber = parseInt(numericPrice).toLocaleString();

    return price.includes("₱") ? `₱${formattedNumber}` : `₱${formattedNumber}`;
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
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group border-0 shadow-sm">
      {/* Image Section with Gallery */}
      <div className="relative h-48 overflow-hidden">
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
        <div className="absolute bottom-3 right-3 bg-black/65 text-white px-3 py-1 rounded-full">
          <span className="font-bold text-sm">
            {formatPrice(property.price)}
          </span>
          <span className="text-xs opacity-80">/month</span>
        </div>
      </div>
      <CardHeader className="p-3 pb-2">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground line-clamp-1">
            {property.title || "Untitled Property"}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <MapPin size={14} className="mr-1 flex-shrink-0" />
              <span className="text-sm line-clamp-1">
                {property.address ||
                  property.location ||
                  "Address not specified"}
              </span>
            </div>
            <p className="text-[#1e40af] font-bold text-sm"></p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-2">
        {/* Property Details */}
        <div className="grid grid-cols-4 gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center justify-center p-1.5 bg-muted/30 rounded text-xs">
            <Bed size={12} className="mr-1" />
            <span className="font-medium">{property.beds || 0}</span>
          </div>
          <div className="flex items-center justify-center p-1.5 bg-muted/30 rounded text-xs">
            <Bath size={12} className="mr-1" />
            <span className="font-medium">{property.baths || 0}</span>
          </div>
          <div className="flex items-center justify-center p-1.5 bg-muted/30 rounded text-xs">
            <Car size={12} className="mr-1" />
            <span className="font-medium">{property.parking || 0}</span>
          </div>
          <div className="flex items-center justify-center p-1.5 bg-muted/30 rounded text-xs">
            <Home size={12} className="mr-1" />
            <span className="font-medium">{property.sqft || 0}ft²</span>
          </div>
        </div>

        {/* Amenities - Compact Version */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((amenity, index) => {
              const IconComponent =
                amenityIcons[amenity.toLowerCase()] || Shield;
              return (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-muted/30 text-muted-foreground px-1.5 py-0.5 rounded text-xs"
                >
                  <IconComponent size={10} />
                  <span className="capitalize">{amenity}</span>
                </div>
              );
            })}
            {property.amenities.length > 3 && (
              <div className="bg-muted/30 text-muted-foreground px-1.5 py-0.5 rounded text-xs">
                +{property.amenities.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Property Stats - Simplified */}
        <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Eye size={10} />
              <span>{viewCount}</span>
            </div>
            {property.datePosted && (
              <div className="flex items-center gap-1">
                <Calendar size={10} />
                <span>{formatDate(property.datePosted)}</span>
              </div>
            )}
            {property.verifiedByName && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle size={10} />
                <span>Verified</span>
              </div>
            )}
          </div>
          {property.landlordName && (
            <div className="flex items-center gap-1 max-w-[100px]">
              <User size={10} />
              <span className="line-clamp-1 text-xs">
                {property.landlordName}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-2">
        <Button
          className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-medium h-8 text-sm"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
