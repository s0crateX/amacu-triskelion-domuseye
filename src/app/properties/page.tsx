"use client";

import React, { useState } from "react";
import { Search, Filter, SlidersHorizontal, MapPin } from "lucide-react";
import { PropertyCard } from "@/components/propertycard";
import { Input } from "@/components/ui/input";
export const PropertiesPage = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const properties = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      title: "Modern Apartment",
      price: "₱1,200/mo",
      location: "Downtown, City Center",
      beds: 2,
      baths: 1,
      sqft: 850,
      features: ["Air Conditioning", "WiFi", "Parking"],
      isNew: true,
      isVerified: true,
      type: "apartment",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      title: "Family House",
      price: "₱2,500/mo",
      location: "Suburbia, Green Hills",
      beds: 4,
      baths: 2,
      sqft: 1800,
      features: ["Large Lot", "Air Conditioning", "Garden"],
      isVerified: true,
      type: "house",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      title: "Luxury Condo",
      price: "₱1,800/mo",
      location: "Riverside, East End",
      beds: 2,
      baths: 2,
      sqft: 1100,
      features: ["WiFi", "Gym", "Pool"],
      type: "condo",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1775&q=80",
      title: "Cozy Cottage",
      price: "₱950/mo",
      location: "Hillside, West Town",
      beds: 1,
      baths: 1,
      sqft: 650,
      features: ["Air Conditioning", "Garden", "Pets Allowed"],
      isVerified: true,
      type: "house",
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      title: "Spacious Villa",
      price: "₱3,500/mo",
      location: "Beachside, North Point",
      beds: 5,
      baths: 3,
      sqft: 2800,
      features: ["Large Lot", "Pool", "Air Conditioning", "WiFi"],
      isNew: true,
      type: "villa",
    },
    {
      id: 6,
      image:
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      title: "Urban Loft",
      price: "₱1,400/mo",
      location: "Arts District, Central",
      beds: 1,
      baths: 1,
      sqft: 950,
      features: ["WiFi", "Air Conditioning", "Modern"],
      isVerified: true,
      type: "apartment",
    },
    {
      id: 7,
      image:
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      title: "Penthouse Suite",
      price: "₱4,200/mo",
      location: "Financial District, Downtown",
      beds: 3,
      baths: 3,
      sqft: 1950,
      features: ["Luxury Finishes", "Concierge"],
      isNew: true,
      isVerified: true,
      type: "apartment",
    },
    {
      id: 8,
      image:
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1680&q=80",
      title: "Beachfront Bungalow",
      price: "₱2,800/mo",
      location: "Coastal Avenue, Seaside",
      beds: 2,
      baths: 1,
      sqft: 950,
      features: ["Ocean View", "Private Beach Access"],
      type: "house",
    },
    {
      id: 9,
      image:
        "https://images.unsplash.com/photo-1494526585095-c41746248156?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      title: "Rustic Cabin",
      price: "₱1,100/mo",
      location: "Mountain View, Highland",
      beds: 2,
      baths: 1,
      sqft: 780,
      features: ["Fireplace", "Scenic Views", "Hiking Trails"],
      isVerified: true,
      type: "house",
    },
  ];
  // --- Filtered Properties based on activeFilter ---
  const filteredProperties =
    activeFilter === "all"
      ? properties
      : properties.filter((property) => property.type === activeFilter);

  return (
    <div className="bg-background min-h-screen">
      {/* --- Hero Section: Search & Advanced Filters --- */}
      <div className="py-12 px-4 mx-10">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold  mb-4">
            Find Your Perfect Property
          </h1>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by location, property type, or keywords..."
                className="pl-10 h-12 text-base border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {/* Advanced Filters Button */}
            <button className="bg-[#cdb323] hover:bg-[#b8a01f] text-black px-6 py-3 rounded-lg font-medium flex items-center justify-center">
              <SlidersHorizontal size={18} className="mr-2" />
              Advanced Filters
            </button>
          </div>
        </div>
      </div>

      {/* --- Main Content Section --- */}
      <div className="container mx-auto py-10 px-4">
        {/* Filter Controls */}
        <div className="flex items-center justify-between mb-8 mx-10">
          <h2 className="text-2xl font-bold text-gray-800">All Properties</h2>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Filter by:</span>
            <div className="flex bg-background rounded-lg shadow-sm overflow-hidden">
              {/* Filter Buttons */}
              <button
                className={`px-4 py-2 ${
                  activeFilter === "all"
                    ? "bg-[#1e40af] text-white"
                    : "bg-white text-gray-700"
                }`}
                onClick={() => setActiveFilter("all")}
              >
                All
              </button>
              <button
                className={`px-4 py-2 ${
                  activeFilter === "apartment"
                    ? "bg-[#1e40af] text-white"
                    : "bg-white text-gray-700"
                }`}
                onClick={() => setActiveFilter("apartment")}
              >
                Apartments
              </button>
              <button
                className={`px-4 py-2 ${
                  activeFilter === "house"
                    ? "bg-[#1e40af] text-white"
                    : "bg-white text-gray-700"
                }`}
                onClick={() => setActiveFilter("house")}
              >
                Houses
              </button>
            </div>
          </div>
        </div>

        {/* --- Properties Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 m-10">
          {filteredProperties.map((property) => (
            <PropertyCard
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

        {/* --- No Properties Found Message --- */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No properties found matching your criteria.
            </p>
          </div>
        )}

        {/* --- Load More Button --- */}
        <div className="mt-12 flex justify-center">
          <button className="px-6 py-2 border-2 border-[#1e40af] text-[#1e40af] rounded-md font-medium hover:bg-[#1e40af] hover:text-white transition-colors">
            Load More
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;
