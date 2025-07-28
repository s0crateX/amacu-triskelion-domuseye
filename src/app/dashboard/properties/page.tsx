"use client";

import React, { useEffect, useState } from "react";
import { SlidersHorizontal, MapPin } from "lucide-react";
import { PropertyCard } from "@/components/propertycard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const propertyTypes = [
  { label: "All Properties", value: "all" },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
  { label: "Condominium", value: "condo" },
  { label: "Studio", value: "studio" },
  { label: "Villa", value: "villa" },
  { label: "Office Space", value: "office" },
  { label: "Retail Space", value: "retail" },
  { label: "Warehouse", value: "warehouse" },
  { label: "Lot / Land", value: "lot" },
  { label: "Farm", value: "farm" },
  { label: "Dormitory", value: "dorm" },
];

type Property = {
  id: string;
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
  type: string;
  uid: string;
};

const PropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);

  const [activeFilter, setActiveFilter] = useState("all");

  //Fetch properties from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "properties"),
      (querySnapshot) => {
        const propertyList: Property[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Property[];
        setProperties(propertyList);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  //Apply filter
  const filteredProperties =
    activeFilter === "all"
      ? properties
      : properties.filter((property) => property.type === activeFilter);

  return (
    <>
      <div className="bg-background min-h-screen">
        <div className="py-12 px-4 mx-4 xl:mx-10">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-10 mt-20">
              Find Your Perfect Property
            </h1>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by location, property type, or keywords..."
                  className="pl-10 h-12 text-base border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button className="bg-[#cdb323] hover:bg-[#b8a01f] text-black px-6 py-3 rounded-lg font-medium flex items-center justify-center">
                <SlidersHorizontal size={18} className="mr-2" />
                Advanced Filters
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-10 px-4">
          <div className="flex items-center justify-between mb-8 mx-4 xl:mx-10">
            <h2 className="text-2xl font-bold text-foreground hidden xl:block">
              All Properties
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Filter by:</span>
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 🔽 Render Property Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mx-4 xl:mx-10">
            {filteredProperties.map((property) => (
              <PropertyCard
                id={property.uid}
                key={property.id}
                image={property.image}
                title={property.title}
                price={property.price}
                location={property.location}
                beds={property.beds}
                baths={property.baths}
                sqft={property.sqft}
                features={property.features}
                isNew={property.isNew}
                isVerified={property.isVerified}
              />
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No properties found matching your criteria.
              </p>
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <button className="px-6 py-2 border-2 border-[#1e40af] text-[#1e40af] rounded-md font-medium hover:bg-[#1e40af] hover:text-white transition-colors">
              Load More
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertiesPage;
