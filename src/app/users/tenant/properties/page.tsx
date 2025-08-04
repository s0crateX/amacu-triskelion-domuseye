"use client";

import React, { useEffect, useState } from "react";
import { 
  SlidersHorizontal, 
  MapPin, 
  Search, 
  Map, 
  Bed, 
  Bath, 
  Car, 
  Calendar, 
  Eye, 
  User, 
  CheckCircle, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  Home
} from "lucide-react";
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
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Property } from "@/types/property";
import { Button } from "@/components/ui/button";
import PropertiesMapModal from "@/components/properties-map-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  
  // Property details modal state
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [detailsProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const itemsPerPage = 6;

  // Fetch properties from Firebase
  useEffect(() => {
    const propertiesRef = collection(db, "properties");
    
    // Create query to only fetch available properties
    // Note: We'll sort in memory since datePosted might not be indexed
    const q = query(
      propertiesRef,
      where("available", "==", true)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const propertyList: Property[] = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              area: data.area || 0,
              available: data.available ?? true,
              images: Array.isArray(data.images) ? data.images : data.image ? [data.image] : [],
              title: data.title || "",
              category: data.category || "",
              datePosted: data.datePosted || new Date().toISOString(),
              price: data.price || "",
              location: data.location || "",
              amenities: Array.isArray(data.amenities) ? data.amenities : [],
              beds: data.beds || 0,
              baths: data.baths || 0,
              sqft: data.sqft || 0,
              features: Array.isArray(data.features) ? data.features : [],
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
          
          // Sort by datePosted in memory (newest first)
          propertyList.sort((a, b) => {
            const dateA = new Date(a.datePosted || 0).getTime();
            const dateB = new Date(b.datePosted || 0).getTime();
            return dateB - dateA;
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

  // Apply filters and search
  const filteredProperties = properties.filter((property) => {
    // Type filter
    const matchesType = activeFilter === "all" || property.type === activeFilter;
    
    // Search filter
    const matchesSearch = searchQuery === "" || 
      property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  // Reset to first page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  // Property details modal functions

  // Image navigation functions
  const nextImage = () => {
    if (detailsProperty?.images && detailsProperty.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === detailsProperty.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (detailsProperty?.images && detailsProperty.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? detailsProperty.images.length - 1 : prev - 1
      );
    }
  };

  // Utility functions
  const formatPrice = (price: string) => {
    if (!price) return "Price not available";
    return price.includes("₱") ? price : `₱${price}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          {/* Animated Loading Spinner */}
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-400 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-slate-500 dark:border-r-slate-300 rounded-full animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>

          {/* Loading Text */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Loading Properties
            </h2>
            <p className="text-muted-foreground">
              Please wait while we fetch the latest listings...
            </p>
          </div>

          {/* Animated Dots */}
          <div className="flex justify-center space-x-1 mt-4">
            <div
              className="w-2 h-2 bg-slate-600 dark:bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-slate-600 dark:bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-slate-600 dark:bg-slate-400 rounded-full animate-bounce"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
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
          </div>

          {/* Error Content */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Unable to Load Properties
            </h2>
            <p className="text-muted-foreground">
              {error ||
                "Something went wrong while loading the properties. Please try again."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-md font-medium transition-colors"
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
      <div className="py-0 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-10 mt-20">
            Available Properties
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Discover your perfect home from our curated selection of properties
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by location, property type, or keywords..."
                className="pl-10 h-12 text-base border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Map Button */}
            <Button
              onClick={() => setIsMapModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center h-12"
            >
              <Map size={18} className="mr-2" />
              View Map
            </Button>
            {/* Advanced Filters Button */}
            <Button className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-lg font-medium flex items-center justify-center h-12">
              <SlidersHorizontal size={18} className="mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>
      </div>

      {/* --- Main Content Section --- */}
      <div className="container mx-auto py-10 px-4">
        {/* Filter Controls */}
        <div className="flex items-center justify-between mb-8 mx-4 xl:mx-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground hidden xl:block">
              Available Properties
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
              {searchQuery && ` for "${searchQuery}"`}
              {activeFilter !== "all" && ` in ${propertyTypes.find(t => t.value === activeFilter)?.label}`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Filter by:</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-15">
          {currentProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
            />
          ))}
        </div>

        {filteredProperties.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="mb-4">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No properties found
            </h3>
            <p className="text-muted-foreground text-base max-w-md mx-auto">
              {searchQuery || activeFilter !== "all" 
                ? "Try adjusting your search criteria or filters to find more properties."
                : "There are currently no available properties. Please check back later."
              }
            </p>
            {(searchQuery || activeFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-md font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
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

      {/* Properties Map Modal */}
      <PropertiesMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        properties={filteredProperties}
      />

      {/* Property Details Modal */}
      <Dialog open={showPropertyDetails} onOpenChange={setShowPropertyDetails}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden p-0 flex flex-col">
          {detailsProperty && (
            <>
              <DialogHeader className="p-6 pb-0 flex-shrink-0">
                <div className="flex-1">
                  <DialogTitle className="text-xl font-bold mb-2">
                    {detailsProperty.title || "Property Details"}
                  </DialogTitle>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <MapPin size={16} className="mr-1" />
                    <span className="text-sm">{detailsProperty.address || detailsProperty.location}</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(detailsProperty.price)}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                {/* Image Gallery */}
                {detailsProperty.images && detailsProperty.images.length > 0 && (
                  <div className="relative h-64 bg-muted flex-shrink-0">
                    <Image
                      src={detailsProperty.images[currentImageIndex] || detailsProperty.image || "/next.svg"}
                      alt={detailsProperty.title || "Property image"}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/next.svg";
                      }}
                    />
                    
                    {/* Image Navigation */}
                    {detailsProperty.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                        >
                          <ChevronRight size={20} />
                        </button>
                        
                        {/* Image Indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {detailsProperty.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-3 h-3 rounded-full transition-colors ${
                                index === currentImageIndex ? "bg-white" : "bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {detailsProperty.isNew && (
                        <Badge className="bg-green-600 text-white">NEW</Badge>
                      )}
                      {detailsProperty.isVerified && (
                        <Badge className="bg-blue-600 text-white">
                          <CheckCircle size={12} className="mr-1" />
                          VERIFIED
                        </Badge>
                      )}
                      {!detailsProperty.available && (
                        <Badge variant="destructive">OCCUPIED</Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-6">
                  {/* Property Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Bed className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <div className="font-semibold">{detailsProperty.beds || 0}</div>
                      <div className="text-xs text-muted-foreground">Bedrooms</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Bath className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <div className="font-semibold">{detailsProperty.baths || 0}</div>
                      <div className="text-xs text-muted-foreground">Bathrooms</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Car className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <div className="font-semibold">{detailsProperty.parking || 0}</div>
                      <div className="text-xs text-muted-foreground">Parking</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Home className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <div className="font-semibold">{detailsProperty.sqft || 0}</div>
                      <div className="text-xs text-muted-foreground">Sq Ft</div>
                    </div>
                  </div>

                  {/* Property Type and Category */}
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{detailsProperty.type || "Property"}</Badge>
                    {detailsProperty.category && (
                      <Badge variant="secondary">{detailsProperty.category}</Badge>
                    )}
                  </div>

                  {/* Description */}
                  {detailsProperty.description && (
                    <div>
                      <h3 className="font-semibold mb-3">Description</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {detailsProperty.description}
                      </p>
                    </div>
                  )}

                  {/* Amenities */}
                  {detailsProperty.amenities && detailsProperty.amenities.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Amenities</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {detailsProperty.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                            <span className="capitalize">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {detailsProperty.features && detailsProperty.features.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Features</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {detailsProperty.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                            <span className="capitalize">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {detailsProperty.datePosted && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-muted-foreground flex-shrink-0" />
                        <span>Posted: {formatDate(detailsProperty.datePosted)}</span>
                      </div>
                    )}
                    {detailsProperty.views && (
                      <div className="flex items-center gap-2">
                        <Eye size={16} className="text-muted-foreground flex-shrink-0" />
                        <span>{detailsProperty.views} views</span>
                      </div>
                    )}
                    {detailsProperty.landlordName && (
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-muted-foreground flex-shrink-0" />
                        <span>Landlord: {detailsProperty.landlordName}</span>
                      </div>
                    )}
                    {detailsProperty.area && (
                      <div className="flex items-center gap-2">
                        <Home size={16} className="text-muted-foreground flex-shrink-0" />
                        <span>Area: {detailsProperty.area} sq m</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-background">
                    <Button className="flex-1 bg-[#1e40af] hover:bg-[#1e3a8a]">
                      Contact Landlord
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertiesPage;
