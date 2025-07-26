import React from "react";
import { MapPin, Bed, Bath, Home, Star, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
interface PropertyCardProps {
  image: string;
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
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img src={image} alt={title} className="w-full h-48 object-cover" />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isNew && (
            <div className="bg-[#cdb323] text-white px-2 py-1 text-xs font-bold rounded">
              NEW
            </div>
          )}
          {isVerified && (
            <div className="bg-[#1e40af] text-white px-2 py-1 text-xs font-bold rounded flex items-center">
              <CheckCircle size={12} className="mr-1" />
              VERIFIED
            </div>
          )}
        </div>
        <button className="absolute top-4 right-4 bg-white/80 rounded-full p-1.5 hover:bg-white">
          <Star size={18} className="text-gray-600" />
        </button>
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-[#1e40af] font-bold">{price}</p>
        </div>
        <div className="flex items-center text-gray-600 mt-1">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm">{location}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex justify-between mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Bed size={16} className="mr-1" />
            <span>{beds} Beds</span>
          </div>
          <div className="flex items-center">
            <Bath size={16} className="mr-1" />
            <span>{baths} Baths</span>
          </div>
          <div className="flex items-center">
            <Home size={16} className="mr-1" />
            <span>{sqft} sqft</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {features.map((feature, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
            >
              {feature}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <button className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white py-2 rounded font-medium">
          View Details
        </button>
      </CardFooter>
    </Card>
  );
};
