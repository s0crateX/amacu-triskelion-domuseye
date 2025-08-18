"use client";

import React, { useEffect, useState } from "react";
import { SlidersHorizontal, MapPin, Map } from "lucide-react";
import { PropertyCard } from "@/components/propertycard";
import { Input } from "@/components/ui/input";
import PropertiesMapModal from "@/components/properties-map-modal";
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
import { Property } from "@/types/property";
import { PropertiesLoadingSkeleton } from "@/components/loadings";

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

const PropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const itemsPerPage = 6;

  //Fetch properties from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "properties"),
      (querySnapshot) => {
        try {
          const propertyList: Property[] = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              area: data.area || 0,
              available: data.available ?? true,
              images: data.images || [],
              title: data.title || "",
              category: data.category || "",
              datePosted: data.datePosted || new Date().toISOString(),
              price: data.price || "",
              location: data.location || "",
              amenities: data.amenities || [],
              beds: data.beds || 0,
              baths: data.baths || 0,
              sqft: data.sqft || 0,
              features: data.features || [],
              isNew: data.isNew,
              isVerified: data.isVerified,
              type: data.type || "",
              uid: data.uid || "",
              latitude: data.latitude || 0,
              longitude: data.longitude || 0,
              address: data.address || "",
              description: data.description || "",
              landlord: data.landlord || [],
              subtype: data.subtype || "",
              kitchen: data.kitchen || "",
              parking: data.parking || 0,
              landlordId: data.landlordId || "",
              landlordName: data.landlordName || "",
              views: data.views || 0,
              image: data.image,
              inquiries: data.inquiries,
              tenant: data.tenant,
              status: data.status,
              rating: data.rating,
              ...data,
            } as Property;
          });
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

  // Loading state - show normal page layout with skeleton grid
  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        {/* --- Hero Section: Search & Advanced Filters --- */}
        <div className="py-6">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-10 mt-16 md:mt-20 text-foreground">
              Find Your Perfect Property
            </h1>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by location, property type, or keywords..."
                  className="pl-9 md:pl-10 h-10 md:h-12 text-sm md:text-base border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {/* Buttons Container */}
              <div className="flex gap-2 md:gap-3">
                {/* Map View Button */}
                <button
                  onClick={() => setIsMapModalOpen(true)}
                  className="bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white px-3 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium flex items-center justify-center transition-colors"
                >
                  <Map
                    size={16}
                    className="mr-1.5 md:mr-2 md:w-[18px] md:h-[18px]"
                  />
                  <span className="hidden sm:inline">Map View</span>
                  <span className="sm:hidden">Map</span>
                </button>
                {/* Advanced Filters Button */}
                <button className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-3 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium flex items-center justify-center transition-colors">
                  <SlidersHorizontal
                    size={16}
                    className="mr-1.5 md:mr-2 md:w-[18px] md:h-[18px]"
                  />
                  <span className="hidden sm:inline">Advanced Filters</span>
                  <span className="sm:hidden">Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Main Content Section --- */}
        <div className="py-6 md:py-10">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 gap-3 sm:gap-0">
              <h2 className="text-xl md:text-2xl font-bold text-foreground hidden sm:block">
                All Properties
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm md:text-base text-muted-foreground">
                  Filter by:
                </span>
                <Select value={activeFilter} onValueChange={setActiveFilter}>
                  <SelectTrigger className="w-[160px] md:w-[200px] h-9 md:h-10 text-sm md:text-base">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem
                        key={type.value}
                        value={type.value}
                        className="text-sm md:text-base"
                      >
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* --- Properties Grid Skeleton --- */}
            <PropertiesLoadingSkeleton count={6} />
          </div>
        </div>

        {/* Properties Map Modal */}
        <PropertiesMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          properties={[]}
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
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
            <h2 className="text-lg md:text-xl font-semibold text-foreground">
              Unable to Load Properties
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              {error}
            </p>

            {/* Retry Button */}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 md:mt-6 px-4 md:px-6 py-2.5 md:py-3 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg transition-colors duration-200 text-sm md:text-base font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* --- Hero Section: Search & Advanced Filters --- */}
      <div className="py-6">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-10 mt-16 md:mt-20 text-foreground">
            Find Your Perfect Property
          </h1>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              <Input
                placeholder="Search by location, property type, or keywords..."
                className="pl-9 md:pl-10 h-10 md:h-12 text-sm md:text-base border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {/* Buttons Container */}
            <div className="flex gap-2 md:gap-3">
              {/* Map View Button */}
              <button
                onClick={() => setIsMapModalOpen(true)}
                className="bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white px-3 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium flex items-center justify-center transition-colors"
              >
                <Map
                  size={16}
                  className="mr-1.5 md:mr-2 md:w-[18px] md:h-[18px]"
                />
                <span className="hidden sm:inline">Map View</span>
                <span className="sm:hidden">Map</span>
              </button>
              {/* Advanced Filters Button */}
              <button className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-3 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium flex items-center justify-center transition-colors">
                <SlidersHorizontal
                  size={16}
                  className="mr-1.5 md:mr-2 md:w-[18px] md:h-[18px]"
                />
                <span className="hidden sm:inline">Advanced Filters</span>
                <span className="sm:hidden">Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content Section --- */}
      <div className="py-6 md:py-10">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 gap-3 sm:gap-0">
            <h2 className="text-xl md:text-2xl font-bold text-foreground hidden sm:block">
              All Properties
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm md:text-base text-muted-foreground">
                Filter by:
              </span>
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="w-[160px] md:w-[200px] h-9 md:h-10 text-sm md:text-base">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className="text-sm md:text-base"
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* --- Properties Grid --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-15">
            {currentProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <div className="text-center py-8 md:py-12">
              <p className="text-muted-foreground text-base md:text-lg">
                No properties found matching your criteria.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 md:mt-12 flex justify-center">
              <Pagination>
                <PaginationContent className="gap-1 md:gap-2">
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

      {/* Properties Map Modal */}
      <PropertiesMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        properties={filteredProperties}
      />
    </div>
  );
};

export default PropertiesPage;
