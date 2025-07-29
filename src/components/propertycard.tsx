import React from "react";
import { MapPin, Bed, Bath, Home, Star, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface PropertyCardProps {
  id: string;
  image: string; // Changed back to array to match your Firebase data
  title: string;
  price: string;
  location: string;
  beds: number;
  baths: number;
  sqft: number;
  features: string[];
  isNew?: boolean;
  isVerified?: boolean;
}

export const PropertyCard = ({
  id,
  image,
  title,
  price,
  location,
  beds,
  baths,
  sqft,
  features,
  isNew,
  isVerified,
}: PropertyCardProps) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/dashboard/properties/${id}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <Image
          src={image}
          alt={title || "Property image"}
          width={400}
          height={192}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/next.svg";
          }}
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isNew && (
            <Badge
              variant="default"
              className="bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              NEW
            </Badge>
          )}
          {isVerified && (
            <Badge
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1"
            >
              <CheckCircle size={12} />
              VERIFIED
            </Badge>
          )}
        </div>
        <button className="absolute top-4 right-4 bg-white/80 rounded-full p-1.5 hover:bg-white">
          <Star size={18} className="text-gray-600" />
        </button>
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-foreground">
            {title || "Untitled Property"}
          </h3>
          <p className="text-[#1e40af] font-bold">
            <span>₱ </span>
            {price || "Price not available"}
            <span>/Month</span>
          </p>
        </div>
        <div className="flex items-center text-gray-600 mt-1">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm">
            {location || "Location not specified"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex justify-between mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Bed size={16} className="mr-1" />
            <span>{beds || 0} Beds</span>
          </div>
          <div className="flex items-center">
            <Bath size={16} className="mr-1" />
            <span>{baths || 0} Baths</span>
          </div>
          <div className="flex items-center">
            <Home size={16} className="mr-1" />
            <span>{sqft || 0} sqft</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-1">
          {features && Array.isArray(features) && features.length > 0 ? (
            features.map((feature, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
              >
                {feature}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-xs">No features listed</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <button
          className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white py-2 rounded font-medium"
          onClick={handleViewDetails}
        >
          View Details
        </button>
      </CardFooter>
    </Card>
  );
};
