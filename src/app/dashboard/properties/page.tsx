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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  //Fetch properties from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "properties"),
      (querySnapshot) => {
        try {
          const propertyList: Property[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Property[];
          setProperties(propertyList);
          setLoading(false);
          setError("");
        } catch (err) {
          console.error("Error fetching properties:", err);
          setError("Failed to load properties.");
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error listening to properties:", error);
        setError("Failed to load properties.");
        setLoading(false);
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

  // Pagination logic
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          {/* Animated Loading Spinner */}
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#cdb323] rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#1e40af] rounded-full animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>

          {/* Loading Text */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Loading Properties
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we fetch the latest listings...
            </p>
          </div>

          {/* Animated Dots */}
          <div className="flex justify-center space-x-1 mt-4">
            <div
              className="w-2 h-2 bg-[#cdb323] rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-[#cdb323] rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-[#cdb323] rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Unable to Load Properties
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>

            {/* Retry Button */}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-[#cdb323] text-white rounded-lg hover:bg-[#b8a01f] transition-colors duration-200 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen lg:mx-8 xl:mx-30">
      {/* --- Hero Section: Search & Advanced Filters --- */}
      <div className="py-6 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-10 mt-20">
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

        {/* --- Properties Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {currentProperties.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.uid}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  }
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        setCurrentPage(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPage;
